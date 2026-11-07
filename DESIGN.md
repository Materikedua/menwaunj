# Design System: Resimen Mahasiswa Satuan UNJ (Menwa UNJ)

Official Design System Specification for Google Stitch MCP integration and frontend alignment across the Menwa UNJ Portal.

---

## 1. Visual Theme & Atmosphere

**Tactical Academic Glassmorphism & Modern Soft Neumorphism.**
A balance of proud Indonesian military heritage and state university academic intellect.
- Deep, immersive cinematic hero background with autonomous 5-scene reel transitions.
- Tactile, extruded 3D neumorphic cushions (`neu-card`, `neu-btn`) with gentle bevels, soft ambient drop shadows, and inset recesses (`neu-inset`).
- High-clarity clean light mode for data-intensive administrative dashboards, legal compliance pages, command hierarchies, and the official merch store.

---

## 2. Color Palette & Functional Roles

### Primary Brand Foundation
- **Menwa Emerald (`#006569`)**: Primary brand identity, focal badges, primary button gradients, and active navigation indicators.
- **Deep Mako Slate (`#092D32`)**: High-authority structural panels, dark mode cards, command center trims, and primary display headlines.
- **Komando Gold (`#FFDD00`)**: Prestigious tactical accents, notification pills, star achievements, and active indicator dots.

### Surface & Background Tokens
- **Pure Canvas White (`#FFFFFF`)**: Clean, authoritative background for Adminu, Toko, Garis Komando, and Participant Portal modals.
- **Tactile Off-White (`#F5F8F6` to `#F8FAFC`)**: Soft surface tone for inset inputs, card borders, and tab containers.
- **Deep Slate Canvas (`#020812` to `#0B132B`)**: Night cinematic background for the Hero section, dynamic 3D visuals, and interactive games.

### Typography & Text Hierarchy
- **Primary Ink (`#092D32` / `#020617`)**: High-contrast, maximum legibility typography on all light backgrounds.
- **Secondary Slate (`#64748B` / `#475569`)**: Supporting explanations, helper instructions, and metadata timestamps.
- **Reverse Text (`#FFFFFF`)**: Pure white text for dark glassmorphic headers and hero overlays.

### Functional Status Tokens
- **Success / Verified (`#059669`)**: Verified badges, payment approved alerts, and valid profile indicators.
- **Alert / Destructive (`#E11D48`)**: Validation errors, destructive actions, and locked session notices.
- **Warning / Pending (`#F59E0B`)**: Pending verifications, pre-order badges, and draft documents.

---

## 3. Typography Rules

- **Display & Section Titles**: `font-black` (weight 900), tracking `-0.02em` to `-0.01em`, uppercase subheadings with `tracking-widest` in `font-mono`.
- **Headings (H1–H4)**: Heavy sans-serif with crisp contrast.
- **Numeric Telemetry & Codes**: `font-mono font-black tabular-nums` for participant IDs, event timers, and scoring marks.
- **Body & Inputs**: `font-bold` and `font-medium` (Inter / system sans-serif) at `14px` (`text-sm`) and `16px` (`text-base`).

---

## 4. Component Stylings & Primitives

### Buttons
- **Primary Action (`neu-btn-primary`)**: Linear gradient from `#006569` through `#092D32` to `#004d50`, text `#FFDD00`, rounded-2xl (`1rem`), micro-tactile click feedback.
- **Secondary Action (`neu-btn`)**: Soft white/slate background with dual-side ambient neumorphic shadow, text `#092D32`.
- **Gold Accent (`neu-btn-gold`)**: High-priority print/export buttons, text `#092D32`, hover scale-102.

### Cards & Modals
- **Neumorphic Card (`neu-card`)**: `rounded-3xl` (`1.5rem`), soft border `#006569`/10 or slate-200/70, smooth padding (`p-6` to `p-8`).
- **Glassmorphic Floating Dock**: `backdrop-blur-md`, subtle `1px` white border (`border-white/20`), elevated shadow `shadow-2xl`.

### Form Fields & Inset Containers
- **Tactile Inset (`neu-inset`)**: Inner shadow mimicking debossed metal or soft matte polymer, crisp focus ring `#006569`/30.

---

## 5. Layout Principles

- **Baseline Spacing**: Multiples of `4px` and `8px` (`gap-2`, `gap-4`, `gap-6`, `p-6`, `p-8`).
- **Container Max-Width**: `max-w-7xl` (`1280px`) with responsive side margins (`px-4 sm:px-6 lg:px-8`).
- **Mobile First**: Minimum touch target `44x44px`, collapsible tablet sidebar dock into bottom drawer on mobile.

---

## 6. Design System Notes for Stitch Generation

- **Atmosphere Keywords**: Tactical glassmorphism, Indonesian university student regiment, emerald green `#006569`, deep slate `#092D32`, gold accent `#FFDD00`, 3D soft neumorphic cards.
- **Component Prompts**: 
  - Soft 3D extruded cards with dual-tone status headers for participant roster management.
  - Floating glassmorphic command console with pill navigation and golden status tags.
  - Clean authoritative administrative forms with inset input fields and 100% white card backings.
