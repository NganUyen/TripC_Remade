# TripC Shop Design System Source of Truth

Refactor all cards to strictly follow the Card Shell token.

Requirements:
- Apply the CardShell pattern (outer mover + inner shell).
- Keep radius = rounded-[2rem], overflow-hidden, border, shadow, and hover motion consistent.
- Use the same hover lift (y: -4) and spring motion (400/25) for all cards.
- Preserve ALL existing content, layout, copy, and business logic per category.
- Do NOT redesign card internals or change information hierarchy.
- Differences between categories should remain in content layout only, not in shell styling.

Goal:
Different cards, same shell. Business stays unique, visual DNA stays unified.


> **STATUS**: ACTIVE & ENFORCED
> **VERSION**: 2.0
> **STRICT COMPLIANCE REQUIRED**

This document describes the **mandatory** design tokens, contracts, and patterns for the TripC application. All code contributions must adhere to these rules to prevent design drift.

---

## 1. 🎨 Tokenization & Color DNA

**Rule**: Do NOT use generic colors. Do NOT use standard CSS colors. Use **only** the specified Tailwind instructions.

### 1.1 Brand Identity
| Token | Value | Tailwind Class | Usage Policy |
| :--- | :--- | :--- | :--- |
| **Primary** | `#FF5E1F` (Orange) | `text-[#FF5E1F]`, `bg-[#FF5E1F]`, `border-[#FF5E1F]` | Actions, CTAs, Active States, Highlights. |
| **Banned** | Generic Blue | `text-blue-500`, `bg-blue-600` | **FORBIDDEN**. Use Orange or Neutral/Slate only. |
| **Success** | Emerald | `text-emerald-500`, `bg-emerald-500` | Status indicators, trust badges. |
| **Error** | Red | `text-red-500`, `bg-red-500` | Critical errors, "Sold Out", Alerts. |

### 1.2 Backgrounds (The Canvas)
| Context | Light Theme | Dark Theme |
| :--- | :--- | :--- |
| **Page Root** | `#fcfaf8` (`bg-[#fcfaf8]`) | `#0a0a0a` (`dark:bg-[#0a0a0a]`) |
| **Surface (Card)** | `bg-white` | `dark:bg-slate-900` or `dark:bg-[#121212]` |
| **Surface (Glass)** | `bg-white/60 backdrop-blur-xl` | `dark:bg-black/60 backdrop-blur-xl` |

### 1.3 Typography
**Font Family**: Default Sans (Geist/Inter).
- **Headings**: `font-bold tracking-tight text-slate-900 dark:text-white`
- **Body**: `font-normal text-slate-600 dark:text-slate-400 leading-relaxed`
- **Labels**: `font-bold text-xs uppercase tracking-wider text-slate-500`

### 1.4 Borders & Separation
**Rule**: Avoid hard lines. Use soft separation.
- **Light**: `border-slate-100` or `divide-slate-100`
- **Dark**: `border-slate-800` or `divide-slate-800`
- **Glass Border**: `border-white/20` (Light & Dark)

---

## 2. 🧱 Surface Hierarchy

**Gravity Budget**: Do NOT overuse Glass. Use it strategically.

### Tier 1: Solid Content (Base)
*   **Use for**: Product cards, standard sections, content blocks.
*   **Recipe**: `bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm`

### Tier 2: Floating Glass (Controls)
*   **Use for**: Sticky headers, floating search bars, filter pills, toast notifications.
*   **Recipe**: `bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg`

### Tier 3: Overlays (Badges)
*   **Use for**: Status pills on images, "AI Insight" cards.
*   **Recipe**: `bg-white/95 dark:bg-black/80 backdrop-blur-md shadow-sm border border-white/10`

---

## 3. � Layout Contract

### 3.1 The Container
**Mandatory**: All page content must live within the standard container bounds.
```tsx
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
```
*   **Forbidden**: `max-w-[1440px]`, `container` (unless configured to match), arbitrary pixels.

### 3.2 The "Bridge" Layout
When implementing Hero sections:
1.  **Curve**: Hero image must have `rounded-b-[2.5rem]` or `rounded-b-[3rem]`.
2.  **Overlap**: The Search/Filter component must "bridge" the curve.
    *   *Implementation*: Use negative margin `-mt-10` relative-z-10 on the following section, OR `translate-y-1/2` on the floating element.
    *   **Rule**: Never use both simultaneously. Prefer negative margin for simpler flow.

### 3.3 Vertical Rhythm
*   **Section Spacing**: `py-12` or `py-16`.
*   **Grid Spacing**: `gap-6` (Grid), `gap-8` (Sections).

---

## 4. 🎬 Motion Contract

**Library**: Framer Motion.

### 4.1 Global Config
```typescript
export const springTransition = { type: "spring", stiffness: 400, damping: 25 };
```

### 4.2 Allowed Interactions
*   **Hover Lift**: `y: -4` (Subtle lift)
*   **Hover Scale**: `scale: 1.02` to `1.05` (Micro-zoom)
*   **Tap/Press**: `scale: 0.95` (Feedback)

### 4.3 Forbidden
*   ❌ Aggressive rotation (`rotate-12` etc.)
*   ❌ Slow linear fades (> 0.5s)
*   ❌ Scale-in from 0 on large elements (Hero banners). Use Opacity + Y-offset instead.

---

## 5. 🧩 Component Primitives

### 5.1 CardShell Pattern (CRITICAL)
**Problem**: Transforming an element with `overflow-hidden` + `border-radius` breaks clipping in some browsers (squaring corners).
**Solution**: Separate the "Mover" from the "Container".

```tsx
// 1. Outer Wrapper (The Mover)
// Handles layout width, hover transform/lift, and group state
<div className="group hover:-translate-y-1 transition-transform duration-300 transform-gpu">
    
    // 2. Inner Container (The Shell)
    // Handles background, border, radius, clipping, and shadow
    <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow">
        
        // 3. Content
        {children}
    </div>
</div>
```

### 5.2 Buttons & Actions
*   **Primary Button**: `bg-[#FF5E1F] hover:bg-orange-600 text-white rounded-full font-bold shadow-lg shadow-orange-500/20`
*   **Secondary Button**: `bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full font-bold hover:bg-slate-50`
*   **Ghost/Text**: `text-slate-500 hover:text-[#FF5E1F] font-medium`

### 5.3 Inputs
*   **Shape**: `rounded-full` (Pill shape).
*   **Style**: `bg-slate-50 dark:bg-white/5 border-transparent focus:border-[#FF5E1F] focus:ring-1 focus:ring-[#FF5E1F]`

### 5.4 Icons
*   **Set**: Lucide React ONLY.
*   **Weight**: `strokeWidth={1.5}`.
*   **Size**: Defaults `w-4 h-4` (small), `w-5 h-5` (medium), `w-6 h-6` (large).

---

## 6. 🌙 Dark Mode Contract

**Mandatory**: Dark mode is a first-class citizen.
1.  **Never** use `bg-white` without a `dark:bg-*` pair.
2.  **Never** use `text-black` without `dark:text-white`.
3.  **Borders**: In dark mode, borders should be `white/5` or `slate-800` to remain subtle.
4.  **Shadows**: Use colorful shadows sparingly in dark mode; prefer lighter borders or inner glows.

---

## 7. ✅ Quality Gates (PR Checklist)

Before submitting or finalizing any component, verify:

- [ ] **No Blue**: Are there any accidental blue text/bg classes? -> Change to Orange/Slate.
- [ ] **Container Check**: Is it inside `max-w-7xl`?
- [ ] **Radius Check**: Are cards `rounded-[2rem]`? Are buttons `rounded-full`?
- [ ] **Dark Mode**: Did I toggle dark mode to verify text contrast and background visibility?
- [ ] **CardShell**: If the card hovers, did I use the Outer/Inner wrapper pattern to save the corners?
- [ ] **Motion**: Are animations snappy (Spring 400/25)?
- [ ] **Icons**: Are all icons Lucide with `strokeWidth={1.5}`?
