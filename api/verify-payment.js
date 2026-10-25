/**
 * Vercel Serverless Endpoint: /api/verify-payment
 * Mengecek status mutasi pembayaran QRIS Statis secara berkala (Polling setiap 5 detik).
 *
 * // TODO: Replace with real bank mutation check API (Moota / Midtrans / Xendit / BCA Corporate API)
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.method === 'POST' ? (req.body || {}) : (req.query || {});
    const { txId, amount, bankAccount, elapsedSeconds = 0, forceVerify = false } = body;

    if (!txId || !amount) {
      return res.status(400).json({
        verified: false,
        error: 'Parameter txId dan amount wajib disertakan.'
      });
    }

    // TODO: Replace with real bank mutation check API
    // Contoh integrasi nyata:
    // const response = await fetch(`https://app.moota.co/api/v2/mutation?amount=${amount}`, {
    //   headers: { Authorization: `Bearer ${process.env.MOOTA_API_TOKEN}` }
    // });
    // const mutations = await response.json();
    // const match = mutations.data?.find(m => Number(m.amount) === Number(amount) && m.type === 'CR');

    // Simulasi verifikasi mandiri apabila sinyal forceVerify dikirim atau mutasi terdeteksi
    const isVerified = Boolean(forceVerify) || Number(elapsedSeconds) >= 15;

    return res.status(200).json({
      verified: isVerified,
      txId,
      amount: Number(amount),
      bankAccount: bankAccount || 'MENWA-UNJ-OFFICIAL',
      checkedAt: new Date().toISOString(),
      provider: 'STATIC_QRIS_POLLING_ENGINE_V8'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      verified: false,
      error: 'Gagal memeriksa mutasi rekening bank.'
    });
  }
}
