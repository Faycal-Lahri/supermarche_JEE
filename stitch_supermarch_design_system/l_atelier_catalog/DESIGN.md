# Design System Document: High-End Editorial Admin

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Curator"**

This design system rejects the "utilitarian spreadsheet" aesthetic common in administrative tools. Instead, it treats inventory management as a high-end editorial experience. We are not just managing data; we are curating a gallery. 

By leveraging **Apple-inspired precision** and **Editorial whitespace**, this system breaks the traditional "template" look. We favor intentional asymmetry, overlapping media elements, and a hierarchy driven by tonal depth rather than structural lines. The goal is a workspace that feels like a premium lifestyle magazine—calm, expansive, and visually driven.

---

## 2. Colors & Surface Philosophy

The color palette is rooted in a "Pure & Atmospheric" range. We use white and soft grays not as "voids," but as architectural planes.

### Core Palette
*   **Primary (The Signature):** `#0059B5` (Action) | `#0071E3` (Container)
*   **Success (The Growth):** `#34C759`
*   **Warning (The Draft):** `#FF9500`
*   **Error (The Alert):** `#BA1A1A`
*   **Neutral/Background:** `#F9F9FB` to `#FFFFFF`

### The "No-Line" Rule
**Explicit Instruction:** Prohibit 1px solid borders for sectioning. 
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a natural edge. If a container feels "lost," do not add a stroke; instead, increase the tonal contrast or adjust the nesting depth.

### Surface Hierarchy & Nesting
Treat the UI as physical layers—stacked sheets of fine paper or frosted glass:
*   **Surface (Base):** `#F9F9FB` - The foundation.
*   **Surface-Container-Lowest:** `#FFFFFF` - Used for primary content cards (the "Hero" card).
*   **Surface-Container-Low:** `#F3F3F5` - Subtle grouping within a page.
*   **Surface-Container-High:** `#E8E8EA` - For interactive side-panels or navigation.

### The "Glass & Gradient" Rule
To elevate beyond a standard flat UI:
*   **Glassmorphism:** For floating elements (Modals, Hovering Popovers), use `on_primary_container` at 80% opacity with a `20px backdrop-blur`.
*   **Signature Gradients:** For primary CTAs, use a subtle linear gradient from `primary` (#0059B5) to `primary_container` (#0071E3) at a 135-degree angle to provide a "tactile" glow.

---

## 3. Typography: The Editorial Voice

We use **Inter** (or SF Pro) to create a sophisticated, rhythmic hierarchy.

| Role | Token | Size | Weight | Color | Note |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Product Title** | `title-md` | 1.125rem (18px) | Medium | `on_surface` | High-contrast against background. |
| **Price Display** | `headline-sm` | 1.5rem (24px) | Semibold | `on_surface` | **Use Tabular Numbers** for alignment. |
| **Description** | `body-md` | 0.875rem (14px) | Regular | `on_secondary_container` | Increased line-height (1.6) for readability. |
| **Section Label** | `label-sm` | 0.6875rem (11px) | Bold | `outline` | All-caps, 0.05em letter spacing. |

**The Editorial Touch:** Headlines should have ample leading. Never crowd a title. Use `display-sm` (2.25rem) for empty states or dashboard intros to establish an authoritative, "magazine-cover" feel.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering**. Place a `surface-container-lowest` (#FFFFFF) card onto a `surface-container-low` (#F3F3F5) background. This creates a "soft lift" that feels architectural rather than digital.

### Ambient Shadows
Avoid dark, muddy shadows. 
*   **Standard Lift:** Blur: 40px, Y: 10px, Color: `rgba(0, 0, 0, 0.04)`.
*   **Active Lift:** Blur: 60px, Y: 20px, Color: `rgba(0, 71, 227, 0.08)` (A tinted shadow using the primary color).

### The "Ghost Border" Fallback
If a border is required for accessibility in high-density areas, use the **Ghost Border**: `outline-variant` (#C1C6D6) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Media-Rich Grids
*   **Aspect Ratio:** Standardize on 4:5 for product shots to feel editorial.
*   **Hover State:** On hover, the image should subtly scale (1.02x) within its container, and the shadow should transition to the "Active Lift" state.

### Image Uploaders (The "Canvas")
*   Style the drop zone as a `surface-container-low` area with a `dashed` ghost border. 
*   Upon upload, show a high-resolution preview with 20px rounded corners (`xl` scale) and a glassmorphic "Delete" button in the top right.

### Buttons & Inputs
*   **Primary Button:** 20px (`xl`) corner radius. High-gloss gradient. No border.
*   **Input Fields:** Background `surface-container-lowest`. On focus, transition the background to `surface-background` and add a soft 2px "glow" using the primary color at 20% opacity. No harsh outlines.

### Category Trees & Wizards
*   **Wizards:** Use a horizontal "Breadcrumb-Style" progress bar at the top, using `primary_fixed_dim` for inactive steps and `primary` for the active step.
*   **Trees:** Remove all vertical connector lines. Use indentation and chevron-rotation to indicate depth. Highlight the active branch with a soft `primary_container` background-wash.

### Cards & Lists
*   **No Dividers:** Forbid the use of 1px lines to separate list items. Use **Vertical White Space** (24px min) or a slight color shift (`surface-container-low`) on alternate rows to differentiate items.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts for product galleries (e.g., alternating large and small cards).
*   **Do** use tabular numbers for all prices and stock counts to ensure vertical alignment.
*   **Do** prioritize "negative space." If a layout feels cramped, remove content before shrinking text.
*   **Do** use 20px (`xl`) rounded corners for all primary containers to mimic Apple’s hardware aesthetics.

### Don’t
*   **Don’t** use pure black (#000000) for text. Use `on_surface` (#1A1C1D) for a softer, premium feel.
*   **Don’t** use standard "Drop Shadows." Always use the high-blur, low-opacity Ambient Shadow.
*   **Don’t** use 1px borders to separate navigation from content. Use a tonal shift or a backdrop blur.
*   **Don’t** use bright, saturated red for "Draft" states. Use the warm, sophisticated `tertiary` (#FF9500).