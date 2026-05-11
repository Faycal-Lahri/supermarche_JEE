# Design System Documentation: The Precision Logistics Framework

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is built for the high-stakes environment of logistics management, where functional density must coexist with mental clarity. Our Creative North Star is **The Digital Curator**. 

Unlike standard "out-of-the-box" admin templates that rely on heavy borders and rigid grids, this system treats data as an editorial centerpiece. We break the "template" look through **Tonal Layering** and **Intentional Asymmetry**. By utilizing a sophisticated hierarchy of whites and soft grays, we create a UI that feels like a physical workspace—stacked sheets of premium paper—rather than a flat digital screen. The goal is to reduce cognitive load while maintaining the "Apple-inspired" prestige that signals reliability and precision.

---

## 2. Colors: The Tonal Spectrum
We move beyond simple "hex codes" to a functional color architecture. The palette is designed to feel airy yet authoritative.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background shifts. For example, a card (`surface_container_lowest`) sits on a workspace (`surface_container_low`), which in turn sits on the application backdrop (`surface`). This creates "edges" through contrast rather than lines, resulting in a cleaner, more premium interface.

### Surface Hierarchy & Nesting
*   **Base Backdrop (`surface` / #f9f9fb):** The global canvas.
*   **Workspace Layer (`surface_container_low` / #f3f3f5):** Used for large content areas or sidebar backgrounds.
*   **Actionable Cards (`surface_container_lowest` / #ffffff):** The highest elevation for data entry and primary modules.
*   **Interactive Hover (`surface_container_high` / #e8e8ea):** For subtle feedback on non-primary elements.

### Signature Textures & Glassmorphism
To add "soul" to the logistics density:
*   **The Blue Gradient:** Primary actions (`primary` / #0059b5) should utilize a subtle linear gradient transitioning into `primary_container` (#0071e3) to create a soft, 3D "pill" effect.
*   **Glass Overlays:** Floating modals or dropdowns must use `surface` colors at 80% opacity with a `20px` backdrop-blur. This allows the complex logistics data underneath to "bleed through" without distracting the user.

---

## 3. Typography: Editorial Authority
Typography is our primary tool for hierarchy. We use **Inter** with specific optical adjustments to ensure tabular data remains legible at high speeds.

*   **Display-LG (56px):** Reserved for KPI "Hero" numbers (e.g., total daily revenue).
*   **Headline-SM (24px):** Section headers. Use `Font-Weight: 600` and `-0.02em` letter spacing for a "compact" premium feel.
*   **Title-SM (16px):** Card titles and primary navigation labels.
*   **Body-MD (14px):** The workhorse. All data points must use **Tabular Figures** (tnum) to ensure numbers align vertically in columns.
*   **Label-SM (11px):** Metadata and micro-copy. Always `Uppercase` with `+0.05em` tracking for "utility" feel.

---

## 4. Elevation & Depth: Tonal Stacking
We reject traditional "drop shadows" in favor of environmental light.

*   **The Layering Principle:** Depth is achieved by stacking tones. A `surface_container_lowest` (#FFFFFF) card placed on a `surface_container_low` (#F3F3F5) background provides all the separation needed.
*   **Ambient Shadows:** For "floating" components (Modals/Popovers), use: `0 4px 16px rgba(29, 31, 31, 0.06)`. Note the color: the shadow is a 6% opacity tint of our `on_surface` (#1A1C1D), not a generic black.
*   **The "Ghost Border" Fallback:** If a container requires further definition (e.g., in high-density data tables), use a `1px` stroke of `outline_variant` at **20% opacity**. It should feel felt, not seen.

---

## 5. Components: Functional Primitives

### Buttons & Pills
*   **Action Buttons:** Large corner radius (`md` / 0.75rem). The primary button uses the "Blue Gradient" mentioned above.
*   **Status Pills:** High-contrast backgrounds (`tertiary_container` for Success, `error_container` for Rupture). Use `full` (9999px) rounding.
*   **Inline Stock Counters:** A signature component. A subtle `surface_container` housing two `label-md` buttons (+/-) and a central `title-sm` value. No borders; use background contrast to define the hit area.

### Input Fields & Search
*   **Minimalist Inputs:** No box-shadow. Use `surface_container_highest` for the field background. On focus, transition the background to `surface_container_lowest` and apply a `2px` "Ghost Border" of the `primary` color.

### High-Density Cards & Lists
*   **The No-Divider Rule:** Forbid the use of horizontal lines between list items. Instead, use `8px` of vertical white space and a `surface_container_low` hover state to separate rows. This keeps the "Apple-inspired" aesthetic of breathing room even in data-heavy views.

### Sidebar Navigation
*   **Vertical Density:** Use a fixed width sidebar using `surface_container_low`. Active states are marked by a vertical `4px` bar of `primary` blue on the left edge and a shift to `surface_container_lowest` for the menu item background.

---

## 6. Do's and Don'ts

### Do
*   **Use Tabular Numbers:** Always enable `font-variant-numeric: tabular-nums` for stock levels and timestamps.
*   **Embrace Negative Space:** If a dashboard feels crowded, increase the spacing between cards rather than adding borders.
*   **Prioritize Surface Shifts:** Define "Submit" areas by placing them on a slightly darker `surface_container_high` footer bar within a modal.

### Don't
*   **Don't use #000000:** Always use `on_surface` (#1A1C1D) for text to maintain the soft-pro look.
*   **Don't use hard borders:** Avoid `border: 1px solid`. If you feel the need for a line, your background contrast isn't strong enough.
*   **Don't use standard shadows:** Never use a shadow with more than 10% opacity; it breaks the "Apple minimalism" and creates visual "mud."