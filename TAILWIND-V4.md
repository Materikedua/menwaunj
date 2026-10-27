# Tailwind CSS v4

Website sekarang menggunakan Tailwind CSS v4 melalui plugin resmi Vite.

Dependency utama:
- `tailwindcss`
- `@tailwindcss/vite`

Tidak lagi menggunakan:
- Tailwind Play CDN
- `tailwindcss` sebagai plugin PostCSS lama
- `autoprefixer` sebagai dependency yang diperlukan untuk Tailwind
- `@tailwindcss/postcss`

Setup:

```bash
npm install
npm run dev
```

Konfigurasi ada di `vite.config.js`:

```js
import tailwindcss from '@tailwindcss/vite';

plugins: [tailwindcss(), react()]
```

CSS utama ada di `src/styles.css` dan dimulai dengan:

```css
@import "tailwindcss";
```

Tailwind v4 menggunakan automatic content detection sehingga tidak diperlukan `tailwind.config.js` untuk class yang dipakai project ini.
