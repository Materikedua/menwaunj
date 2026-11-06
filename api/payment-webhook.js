/**
 * Serverless Endpoint: /api/payment-webhook
 * Webhook Terpadu dengan Verifikasi Tanda Tangan Digital (HMAC SHA-256) & Persistent Idempotency Gate
 * Stage 2.3: Menyimpan state transaksi ke Firestore REST API (/payment_mutations/{txId}) + Disk/Memory
 * sehingga tahan terhadap Serverless Cold Start di Vercel maupun restart container.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const processedTransactions = new Map();

const PERSISTENT_CACHE_PATH = path.resolve(process.cwd(), '.payment-mutations-store.json');

function loadFirebaseConfig() {
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), 'firebase-applet-config.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hydrateFromDisk() {
  try {
    if (fs.existsSync(PERSISTENT_CACHE_PATH)) {
      const raw = JSON.parse(fs.readFileSync(PERSISTENT_CACHE_PATH, 'utf8'));
      if (raw && typeof raw === 'object') {
        for (const [k, v] of Object.entries(raw)) {
          if (v && typeof v === 'object') {
            processedTransactions.set(k, v);
          }
        }
      }
    }
  } catch {
    /* ignore disk cache errors */
  }
}

function flushToDisk() {
  try {
    const obj = Object.fromEntries(processedTransactions.entries());
    fs.writeFileSync(PERSISTENT_CACHE_PATH, JSON.stringify(obj, null, 2), 'utf8');
  } catch {
    /* ignore read-only fs errors in strict serverless */
  }
}

hydrateFromDisk();

/**
 * Sinkronisasi dokumen mutasi ke koleksi Firestore `/payment_mutations/{txId}` via REST API
 */
export async function persistMutationToFirestore(record) {
  if (!record || !record.txId) return false;
  const cfg = loadFirebaseConfig();
  if (!cfg?.projectId || !cfg?.apiKey) return false;
  const dbId = cfg.firestoreDatabaseId || '(default)';
  const safeTxId = encodeURIComponent(String(record.txId));
  const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${encodeURIComponent(dbId)}/documents/payment_mutations/${safeTxId}?key=${encodeURIComponent(cfg.apiKey)}`;

  const fields = {
    txId: { stringValue: String(record.txId) },
    status: { stringValue: String(record.status || 'lunas') },
    amount: { integerValue: String(Math.round(Number(record.amount || 0))) },
    provider: { stringValue: String(record.provider || 'SERVER_WEBHOOK') },
    processedAt: { stringValue: String(record.processedAt || new Date().toISOString()) },
    claimed: { booleanValue: Boolean(record.claimed) },
  };
  if (record.claimedAt) {
    fields.claimedAt = { stringValue: String(record.claimedAt) };
  }

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
      signal: AbortSignal.timeout(4500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Membaca dokumen mutasi dari koleksi Firestore `/payment_mutations/{txId}` saat memori lokal kosong (Cold Start)
 */
export async function fetchMutationFromFirestore(txId) {
  if (!txId) return null;
  const cfg = loadFirebaseConfig();
  if (!cfg?.projectId || !cfg?.apiKey) return null;
  const dbId = cfg.firestoreDatabaseId || '(default)';
  const safeTxId = encodeURIComponent(String(txId));
  const url = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${encodeURIComponent(dbId)}/documents/payment_mutations/${safeTxId}?key=${encodeURIComponent(cfg.apiKey)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return null;
    const docJson = await res.json();
    const f = docJson?.fields;
    if (!f) return null;
    const record = {
      txId: f.txId?.stringValue || String(txId),
      status: f.status?.stringValue || 'lunas',
      amount: Number(f.amount?.integerValue || f.amount?.doubleValue || 0),
      provider: f.provider?.stringValue || 'FIRESTORE_PERSISTENT',
      processedAt: f.processedAt?.stringValue || new Date().toISOString(),
      claimed: Boolean(f.claimed?.booleanValue),
      claimedAt: f.claimedAt?.stringValue || null,
    };
    processedTransactions.set(String(txId), record);
    flushToDisk();
    return record;
  } catch {
    return null;
  }
}

export function verifyHmacSignature(payloadString, signature, secret) {
  if (!secret) return false;
  if (!signature || typeof signature !== 'string') return false;
  try {
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
    const cleanSig = signature.trim().toLowerCase();
    const expectedBuf = Buffer.from(expectedHash, 'utf8');
    const actualBuf = Buffer.from(cleanSig, 'utf8');
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

function extractTxId(description) {
  if (!description || typeof description !== 'string') return null;
  const match = description.match(/(?:VOTE|TX|tx|TRX|trx)[-_A-Za-z0-9]+/);
  return match ? match[0] : null;
}

export function getVerifiedTransaction(txId, expectedAmount) {
  if (!txId) return null;
  hydrateFromDisk();
  const entry = processedTransactions.get(String(txId));
  if (!entry) return null;
  if (expectedAmount && Number(entry.amount) < Number(expectedAmount)) {
    return null;
  }
  return entry;
}

export async function getVerifiedTransactionPersistent(txId, expectedAmount) {
  const local = getVerifiedTransaction(txId, expectedAmount);
  if (local) return local;
  const remote = await fetchMutationFromFirestore(txId);
  if (!remote) return null;
  if (expectedAmount && Number(remote.amount) < Number(expectedAmount)) {
    return null;
  }
  return remote;
}

export function markTransactionProcessed(txId, metadata = {}) {
  if (!txId) return { alreadyProcessed: false, record: null };
  hydrateFromDisk();
  const key = String(txId);
  if (processedTransactions.has(key)) {
    return {
      alreadyProcessed: true,
      record: processedTransactions.get(key),
    };
  }
  const record = {
    txId: key,
    status: 'lunas',
    claimed: false,
    processedAt: new Date().toISOString(),
    ...metadata,
  };
  processedTransactions.set(key, record);
  flushToDisk();
  // Fire-and-forget sinkronisasi ke Firestore agar persisten lintas cold start
  persistMutationToFirestore(record).catch(() => {});
  return { alreadyProcessed: false, record };
}

export async function markTransactionClaimedPersistent(txId) {
  if (!txId) return { alreadyClaimed: false, record: null };
  const key = String(txId);
  let record = processedTransactions.get(key) || (await fetchMutationFromFirestore(key));
  if (!record) return { alreadyClaimed: false, record: null };
  if (record.claimed) {
    return { alreadyClaimed: true, record };
  }
  const updated = {
    ...record,
    claimed: true,
    claimedAt: new Date().toISOString(),
  };
  processedTransactions.set(key, updated);
  flushToDisk();
  await persistMutationToFirestore(updated);
  return { alreadyClaimed: false, record: updated };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Signature, X-Signature, X-Callback-Token'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Gunakan POST untuk webhook.' });
  }

  try {
    const body = req.body || {};
    const rawPayload = req.rawBody || (typeof body === 'string' ? body : JSON.stringify(body));
    const signature =
      req.headers['signature'] ||
      req.headers['x-signature'] ||
      body.signature_key ||
      '';
    const webhookSecret =
      process.env.MOOTA_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET || '';

    // Wajib validasi HMAC SHA-256 apabila secret dikonfigurasi di server
    if (webhookSecret && !verifyHmacSignature(rawPayload, signature, webhookSecret)) {
      return res.status(401).json({
        success: false,
        error: 'Verifikasi tanda tangan digital HMAC SHA-256 tidak sah.',
      });
    }

    // 1. FORMAT MOOTA (Array mutasi kredit masuk)
    if (Array.isArray(body) || Array.isArray(body.data)) {
      const mutations = Array.isArray(body) ? body : body.data;
      const newlyProcessed = [];
      const duplicatesSkipped = [];

      for (const m of mutations) {
        if (m.type === 'CR' || m.type === 'credit') {
          const amount = Number(m.amount || 0);
          const txId =
            extractTxId(m.description) ||
            m.tag ||
            m.order_id ||
            m.mutation_id ||
            m.id;
          if (!txId || amount <= 0) continue;

          const existingRemote = await getVerifiedTransactionPersistent(txId, amount);
          if (existingRemote) {
            duplicatesSkipped.push(txId);
            continue;
          }

          const { alreadyProcessed, record } = markTransactionProcessed(txId, {
            mutationId: m.mutation_id || m.id,
            accountNumber: m.account_number,
            amount,
            description: m.description,
            provider: 'MOOTA_MUTATION',
          });
          await persistMutationToFirestore(record);

          if (alreadyProcessed) {
            duplicatesSkipped.push(txId);
          } else {
            newlyProcessed.push(record);
          }
        }
      }

      return res.status(200).json({
        success: true,
        provider: 'MOOTA_MUTATION',
        idempotent: true,
        persistent: true,
        processedCount: newlyProcessed.length,
        duplicatesSkippedCount: duplicatesSkipped.length,
        items: newlyProcessed,
      });
    }

    // 2. FORMAT MIDTRANS QRIS CALLBACK
    if (body.order_id && body.transaction_status) {
      const isSettled =
        body.transaction_status === 'settlement' ||
        body.transaction_status === 'capture';
      if (!isSettled) {
        return res.status(200).json({
          success: true,
          provider: 'MIDTRANS',
          orderId: body.order_id,
          status: body.transaction_status,
        });
      }

      const amount = Number(body.gross_amount || 0);
      const existingRemote = await getVerifiedTransactionPersistent(body.order_id, amount);
      if (existingRemote) {
        return res.status(200).json({
          success: true,
          provider: 'MIDTRANS',
          orderId: body.order_id,
          idempotent: true,
          alreadyProcessed: true,
          status: 'lunas',
          record: existingRemote,
        });
      }

      const { alreadyProcessed, record } = markTransactionProcessed(body.order_id, {
        amount,
        provider: 'MIDTRANS',
      });
      await persistMutationToFirestore(record);

      return res.status(200).json({
        success: true,
        provider: 'MIDTRANS',
        orderId: body.order_id,
        idempotent: true,
        alreadyProcessed,
        status: 'lunas',
        record,
      });
    }

    // 3. FORMAT GENERIC GATEWAY
    const genericTxId = body.txId || body.order_id || body.reference;
    const genericAmount = Number(body.amount || body.nominal || 0);

    if (!genericTxId || genericAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Parameter txId dan nominal pembayaran wajib valid.',
      });
    }

    const existingRemote = await getVerifiedTransactionPersistent(genericTxId, genericAmount);
    if (existingRemote) {
      return res.status(200).json({
        success: true,
        provider: 'GENERIC_GATEWAY',
        txId: genericTxId,
        amount: genericAmount,
        idempotent: true,
        alreadyProcessed: true,
        status: 'lunas',
        record: existingRemote,
      });
    }

    const { alreadyProcessed, record } = markTransactionProcessed(genericTxId, {
      amount: genericAmount,
      provider: 'GENERIC_GATEWAY',
    });
    await persistMutationToFirestore(record);

    return res.status(200).json({
      success: true,
      provider: 'GENERIC_GATEWAY',
      txId: genericTxId,
      amount: genericAmount,
      idempotent: true,
      alreadyProcessed,
      status: 'lunas',
      record,
    });
  } catch (error) {
    console.error('[Payment Webhook Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kegagalan saat memproses webhook pembayaran.',
    });
  }
}