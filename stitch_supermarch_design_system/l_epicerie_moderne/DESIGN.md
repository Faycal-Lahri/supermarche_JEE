# Design System Strategy: The Digital Atelier

## 1. Overview & Creative North Star
This design system is built to transform the mundane task of grocery shopping into a high-end, editorial experience. Our Creative North Star is **"The Digital Atelier."** 

We are moving away from the "warehouse" feel of traditional e-commerce. By fusing the relentless precision of Apple’s iOS with the expressive, tactile warmth of Material You, we create a space that feels both surgically clean and invitingly human. 

To break the "template" look, we lean into **Intentional Asymmetry**. Large-scale typography should be offset by generous whitespace, and product imagery should "break the grid," overlapping containers to create a sense of physical depth. This is not a flat interface; it is a curated gallery of culinary essentials.

---

## 2. Colors: Tonal Depth vs. Structural Lines
Our palette is rooted in pure whites and sophisticated blues, but its power lies in how we layer these tones.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections. Structural boundaries must be created through background shifts. For example, a `surface-container-low` section should sit atop a `surface` background to create a "well." 

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers.
- **Base:** `surface` (#f8f9fa)
- **Primary Content Areas:** `surface_container_lowest` (#ffffff)
- **Secondary Utility Zones:** `surface_container_low` (#f3f4f5)
- **Interactive Elevated Elements:** `surface_container_high` (#e7e8e9)

### The "Glass & Gradient" Rule
To elevate the "Blue" from a standard link color to a premium signature, use **Glassmorphism** for floating elements (e.g., a floating bottom navigation bar or a "Quick Add" cart button). Use `surface` with 80% opacity and a `20px backdrop-blur`. 

**Signature Texture:** Main CTAs should not be flat. Apply a subtle linear gradient from `primary` (#0059b5) to `primary_container` (#0071e3) at a 135-degree angle to provide a "soul" to the action.

---

## 3. Typography: Editorial Authority
Typography is our primary tool for storytelling. We use a mix of **Inter** and **SF Pro** to achieve a technical yet approachable feel.

- **Display & Headlines:** Use `display-lg` to `headline-sm`. These must be set to **Medium weight** with a strictly enforced **-0.02em tracking**. This "tightness" mimics high-end print magazines.
- **Body Text:** Use `body-lg` or `body-md`. All body copy must maintain a **1.4 leading (line-height)**. This provides the "breathing room" necessary for a premium feel.
- **Labels:** Use `label-md` for metadata. These should be treated with slightly increased letter spacing (0.05em) to differentiate from body copy.

---

## 4. Elevation & Depth: The Layering Principle
We do not use structural lines; we use **Tonal Layering** and **Ambient Light.**

- **The Stacking Principle:** To highlight a product card, do not draw a box. Place a `surface_container_lowest` card on a `surface_container_low` background. The subtle shift in hex value creates a natural lift.
- **Ambient Shadows:** When an element must "float" (like a pill-shaped input), use an extra-diffused shadow.
    - **Blur:** 24px–32px.
    - **Opacity:** 4%–6%.
    - **Color:** Use a tinted version of `on_surface` (e.g., a deep navy-tinted grey) rather than pure black.
- **The "Ghost Border" Fallback:** If a boundary is required for accessibility, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components: The Primitive Set

### Buttons (The "Hyper-Pill")
- **Radius:** `full` (999px) for a complete pill shape.
- **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text.
- **Secondary:** `surface_container_high` background with `primary` text.
- **Interaction:** Implement a Material "Ripple" effect on press, but keep the ripple color subtle (white at 10% opacity).

### Cards (The "Soft Container")
- **Radius:** `12px` (Internal scale reference: `DEFAULT` / `1rem`).
- **Styling:** Forbid divider lines within cards. Use vertical whitespace (16px–24px) to separate the product image from the title and price.

### Floating Pill Inputs
- **Shape:** Pill-shaped (`full` radius).
- **Background:** `surface_container_lowest` with a "Ghost Border" (15% `outline_variant`).
- **Floating Label:** When active, the label should shrink and move into the top-left curve, using the `primary` color for the text.

### Segmented Control Chips
- **Usage:** For category filtering (e.g., "Organic," "Dairy," "Bakery").
- **Style:** Pill-shaped. Unselected chips use `surface_container_low`. Selected chips use `primary` with `on_primary` text.

### The "Aisle" List
- **Rule:** No horizontal separators. Use a `surface_container_low` background on every second item, or simply use 32px of vertical padding between items to define the list.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use "Over-sized" margins. If a standard grid uses 16px, try 24px or 32px to increase the premium feel.
- **Do** use high-quality imagery with consistent lighting.
- **Do** allow the `primary` color to be the "hero." Use it sparingly for maximum impact.

### Don’t:
- **Don’t** use a 1px border. Ever.
- **Don’t** use high-contrast shadows. If the shadow looks "dirty," lower the opacity.
- **Don’t** crowd the interface. If you are unsure if a section needs more space, it probably does.
- **Don’t** use "Default Blue." Always ensure you are using the specific `primary` (#0059b5) or `primary_container` (#0071e3) tokens.

---

*This design system is a living document. Every pixel should feel intentional, every transition smooth, and every surface part of a larger, cohesive culinary journey.*