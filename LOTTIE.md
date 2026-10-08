# Motion reference assets

File `.lottie` di `public/lottie/` sekarang **hanya menjadi referensi visual** untuk gerakan yang diinginkan.

Website production tidak lagi mengimpor `@lottiefiles/dotlottie-react` dan tidak menjalankan Lottie runtime, karena runtime Lottie membuat halaman terasa berat ketika beberapa animasi aktif bersamaan.

Animasi production dibuat ulang dengan CSS + inline SVG/Lucide sehingga:
- tidak membutuhkan dependency Lottie;
- tidak melakukan parsing/render `.lottie` saat halaman dibuka;
- lebih ringan untuk CPU/GPU;
- tetap mendukung hover, click, looping, dan `prefers-reduced-motion`.

Referensi:
- `play-pause.lottie` → `PlayPauseMotion`
- `card-stack.lottie` → `CardStackMotion` + kartu dokumentasi CSS
- `aero-plane.lottie` → `PlaneMotion`
- `laptop-error.lottie` → `LaptopMotion`
- `fire.lottie` → `FireMotion`
- `trophy.lottie` → `TrophyMotion`

Jika ingin mengganti gerakan, ubah komponen di `src/components/MotionAssets.jsx` dan keyframes di `src/styles.css`.
