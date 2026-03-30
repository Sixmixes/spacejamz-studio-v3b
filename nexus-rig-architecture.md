# Nexus RIG Architecture
**SpaceJamz Studio V3B UI Standard**

The "Nexus RIG Architecture" is the definitive aesthetic system for the SpaceJamz V3B platform, blending deep-space cinematic scale, high-density data framing, and tactical "Dead Space" RIG-class modularity.

## 1. Container Rules
All major nodes, modals, and container boundaries must use rigid, angular styling to simulate physical, tactical hardware rather than standard "web" cards.

- **Backgrounds:** Standardize on `bg-[#050505]` or `bg-black/90` with `backdrop-blur-xl`.
- **Accents:** Use `bg-primary/5` to `bg-primary/10` for active states or highlighted quadrants.
- **Borders:** `border border-primary/20`. Active or hover states should bump to `border-primary/60`.
- **Corners (Clip Paths):** Never use rounded `.rounded-md` corners for major boundaries. Stick strictly to polygon clips.
  - Standard Chop: `clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)'`
  - Aggressive Chop: `clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)'`

## 2. Typography Rules
Typography in SpaceJamz must exclusively differentiate between massive, physical "Header" fonts and precise, tactical "Readout" fonts. Standard Sans-Serif body text is deprecated in UI components.

- **Headers (Titles, Massive Calls to Action):**
  - Font: `font-bebas` (Bebas Neue)
  - Style: `text-white tracking-widest uppercase`
  - Weight: `font-black`
  - Scale: `text-3xl` up to `text-6xl`
  - Effects: Combine with `italic` or `drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]` for cinematic depth.

- **Readouts (Metadata, Subtitles, System Info, Tags):**
  - Font: `font-mono` (usually JetBrains Mono or similar)
  - Style: `uppercase text-primary/60` to `text-primary/100` depending on priority.
  - Tracking: `tracking-[0.2em]` up to `tracking-[0.5em]` for extreme stretching.
  - Scale: Keep it tiny to increase perceived scale around it (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`).

## 3. Viewport & Layout Architecture
Gated environments (where serious UI computing is done) must utilize the full viewport width.

- **Width Structure:** Transition away from centered blocks (`max-w-5xl`, `max-w-7xl`). Use `w-full max-w-[1800px] px-4 md:px-8 mx-auto`.
- **Top Offset:** Account for the `NeuralIdentityTerminal` by using `pt-20` to `pt-32` on main containers.
- **Atmosphere:** Always include the subtle background scanlines overlay:
  ```jsx
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-10 mix-blend-overlay scanlines" />
  ```

## 4. Component Behaviors
- **Buttons (CyberButton):** Buttons must hover-fill and carry heavy padding. Use the internal SCSS clip-path system defined in `cyber-btn`.
- **Transparencies:** Use dense background layers over backgrounds. e.g. `<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />` to separate layers from the cinematic loops under them.
