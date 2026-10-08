# AI Chatbot Menwa UNJ

Chatbot memakai Gemini API melalui endpoint Vercel `api/chat.js`, sehingga API key tidak ditaruh di browser. Tanpa API key, chatbot tetap punya fallback navigasi berbasis kata kunci.

## Setup
1. Buat API key di Google AI Studio.
2. Di Vercel Project Settings → Environment Variables, tambahkan `GEMINI_API_KEY`.
3. Opsional: `GEMINI_MODEL=gemini-3.7-flash`.
4. Redeploy.

Google menyediakan paket gratis untuk Gemini API pada model tertentu dengan batas penggunaan. Batas dan model gratis dapat berubah; cek halaman pricing resmi sebelum deployment produksi.

## Fitur
- Menjawab pertanyaan singkat tentang portal.
- Mengarahkan pengunjung ke tab/subtab.
- Balasan AI memiliki tombol navigasi yang dapat diklik.
- Jika API tidak tersedia, fallback lokal tetap mengarahkan ke halaman yang relevan.
