# Design System: Immersive Cinematic Luxury

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is engineered to feel less like a software interface and more like a high-end gallery or a cinematic title sequence. We are moving away from the "flat web" to embrace **The Digital Curator**—a philosophy where every element is treated as a physical object suspended in a dark, infinite space. 

By utilizing intentional asymmetry, overlapping glass surfaces, and high-contrast typography scales, we break the traditional "template" look. We reject the rigid grid in favor of a fluid, editorial layout that prioritizes atmospheric depth and emotional resonance over mere utility.

---

## 2. Colors & Surface Philosophy
The palette is rooted in an ultra-dark environment (`#0e0e0e`), allowing vibrant accent glows and glass surfaces to create a sense of "Immersive Luxury."

### The "No-Line" Rule
Sectioning must **never** be achieved through 1px solid borders. Boundaries are defined solely through background tonal shifts. Use `surface-container-low` for a background section and `surface-container-highest` for an elevated area. If content feels lost, increase the vertical whitespace rather than reaching for a divider.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of frosted glass. 
*   **Base:** `surface-dim` (#0e0e0e)
*   **Layer 1:** `surface-container-low` (#131313) - Large structural areas.
*   **Layer 2:** `surface-container` (#1a1919) - Interaction cards.
*   **Layer 3:** `surface-container-highest` (#262626) - Floating modals or tooltips.

### The "Glass & Gradient" Rule
Standard cards should be replaced with Glassmorphism:
*   **Background:** 10% opacity `on-surface` (#ffffff).
*   **Effect:** `backdrop-blur: 20px`.
*   **Signature Texture:** Use a mesh gradient transition from `primary` (#85adff) to `secondary` (#ff6f7c) at 5% opacity behind glass layers to give them a "soul."

---

## 3. Typography: Editorial Authority
The typographic voice is a conversation between modern tech and classic luxury.

*   **Display & Headlines (Noto Serif):** Use `display-lg` for hero moments. This serif font provides the "Luxury" weight. Large-scale serifs evoke editorial prestige.
*   **Titles & Body (Manrope):** Use for functional information. Manrope’s geometric nature provides a clean, "Apple-esque" legibility that balances the serif accents.
*   **Labels & Prices (Space Grotesk):** We substitute SF Mono with Space Grotesk for a high-fashion, technical look. Use `label-md` for prices and metadata to give a "concierge tag" feel.

**Hierarchy Strategy:** Use massive contrast. Pair a `display-lg` headline with a `body-sm` description to create a sophisticated, high-fashion layout.

---

## 4. Elevation & Depth
Depth is not a "drop shadow"; it is a lighting condition.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This "negative depth" creates a soft, natural inset look.
*   **Ambient Shadows:** For floating elements, use a `primary` tinted shadow: `box-shadow: 0 20px 40px rgba(0, 91, 194, 0.08)`. Never use pure black shadows; they muddy the dark theme.
*   **The "Ghost Border" Fallback:** If containment is required, use `outline-variant` (#494847) at **15% opacity**. It should be felt, not seen.
*   **3D Transforms:** Interactive cards should utilize a subtle 5-degree tilt on hover using spring physics (`stiffness: 300, damping: 20`) to simulate physical weight.

---

## 5. Components

### Buttons
*   **Primary:** A gradient-fill using `primary` to `primary-dim`. Roundedness: `full`. No border.
*   **Secondary:** Glassmorphic background (10% white) with a "Ghost Border."
*   **Tertiary:** Text-only in `primary-fixed-dim`, using `notoSerif` for a distinct, high-end feel.

### Chips
*   Use `surface-container-high` backgrounds with `label-md` (Space Grotesk). Sizing should be tight with `xl` (1.5rem) roundedness to resemble luxury luggage tags.

### Cards & Lists
*   **Strict Rule:** No dividers. Use `surface-container-low` for the list container and `surface-container-highest` for the active item.
*   **Spacing:** Double the industry standard vertical padding (e.g., 32px instead of 16px) to allow the "Immersive Luxury" to breathe.

### Input Fields
*   **States:** Default state is a `surface-container-lowest` well. On focus, the "Ghost Border" pulses with a `secondary` glow (pink/orange). 
*   **Typography:** Use `body-lg` for input text to maintain a premium, easy-to-read scale.

### Immersive Components (Contextual)
*   **The Mesh Glow:** A background decorative element using `secondary_container` and `tertiary_container` blurred at 150px, placed behind key content to guide the eye.
*   **Curated Scroll:** Implementation of a parallax effect where background images move at 20% the speed of foreground glass cards.

---

## 6. Do's and Don'ts

### Do
*   **DO** use asymmetric layouts. If a card is on the left, let the right side have "dead space" for a mesh gradient.
*   **DO** use "Playfair" (Noto Serif) for atmospheric words (e.g., *"The Selection"*, *"Featured"*).
*   **DO** use spring physics for all transitions. Linear animations are forbidden.

### Don't
*   **DON'T** use 100% white (#ffffff) for large blocks of body text. Use `on-surface-variant` (#adaaaa) to reduce eye strain against the deep black background.
*   **DON'T** use standard grids. If every element lines up perfectly, the "Cinematic" feeling is lost. Offset elements by 8px or 16px.
*   **DON'T** use high-contrast borders. If the border is the first thing you see, it’s too heavy.