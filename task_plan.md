# Audit & Comprehensive Enhancement Plan (Menwa UNJ Web App)

## 1. Goal
Melakukan audit menyeluruh (holistik) terhadap seluruh codebase Menwa UNJ mencakup:
- **Keamanan (Security)**: Rules Firestore, autentikasi, sanitasi input XSS/NoSQLi, pencegahan kebocoran kredensial, validasi hak akses perwira/superadmin.
- **Fungsionalitas (Functionality)**: Validasi handlers, props, error boundary, unduhan PDF/CSV, sinkronisasi state.
- **UI & UX (Design & Experience)**: Konsistensi grand design Tactical Academic (`#006569`, `#092D32`, `#FFDD00`), kontras keterbacaan (WCAG AA), responsiveness mobile, fluid touch targets, navigasi.
- **Performa & Maintainability**: Menghilangkan komputasi berat/lag, kepatuhan batas baris $\le 750$ baris per file.

## 2. Phases
- [ ] **Phase 1: Code Scanning & Automated Diagnostics**
  - Run ESLint / build checks.
  - Scan for unhandled references, missing imports, unescaped entities, broken links.
  - Scan `firestore.rules` for security gaps.
- [ ] **Phase 2: Security Hardening**
  - Verify Firestore rules for all collections.
  - Verify PIN hashing & lockout mechanism.
  - Check form sanitization & size limits.
- [ ] **Phase 3: Fungsionalitas & Bug Hunting**
  - Verify all modal handlers, download handlers, forms submissions.
  - Ensure zero runtime undefined references.
- [ ] **Phase 4: UI/UX & Tactical Academic Alignment**
  - Polish contrast, mobile overflow, button accessibility.
  - Harmonize color palettes across subpages.
- [ ] **Phase 5: Verification & Full Production Build**
  - Check file line limits ($\le 750$).
  - Full Vite build.
  - Git commit & dual-remote push.

