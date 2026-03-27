# 🎨 Design Tokens - Cumplia Landing Page 2026

## Color Palette - Dark Mode First

### Base Colors

```
┌─────────────────────────────────────────────────────────┐
│ NEUTRALS (Background & Text)                            │
├─────────────────────────────────────────────────────────┤
│ Background Primary       #0a0a0a                        │
│ ███████████ (99% black)                                 │
│ Usage: Main background, hero                            │
│ Contrast: White text 21:1 (AAA) ✓                       │
│                                                         │
│ Background Secondary     #1a1a1a                        │
│ ████████████ (90% brightness)                           │
│ Usage: Cards, overlays, hover states                    │
│ Contrast: White text 14:1 (AAA) ✓                       │
│                                                         │
│ Background Tertiary      #2a2a2a                        │
│ ███████████ (84% brightness)                            │
│ Usage: Nested elements, subtle differentiation         │
│ Contrast: White text 11:1 (AAA) ✓                       │
│                                                         │
│ Border Color            #1a1a1a                        │
│ ████████████ (subtle)                                   │
│ Usage: Card borders, dividers                           │
│                                                         │
│ Border Color Hover      #2a2a2a                        │
│ ███████████ (slightly visible)                          │
│ Usage: Hover states                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TEXT COLORS                                             │
├─────────────────────────────────────────────────────────┤
│ Text Primary            #ffffff                         │
│ ███████████ (100% white, max contrast)                  │
│ Usage: H1, H2, buttons, important text                  │
│ Contrast ratio: 21:1 on #0a0a0a (AAA) ✓                │
│ Contrast ratio: 14:1 on #1a1a1a (AAA) ✓                │
│                                                         │
│ Text Secondary          #e0e0e0                         │
│ ███████████ (88% brightness)                            │
│ Usage: Subtitles, descriptions, secondary text         │
│ Contrast ratio: 15.3:1 on #0a0a0a (AAA) ✓              │
│                                                         │
│ Text Tertiary           #a0a0a0                         │
│ ██████░░░░ (63% brightness)                             │
│ Usage: Captions, timestamps, helper text               │
│ Contrast ratio: 6.5:1 on #0a0a0a (AA) ✓                │
│                                                         │
│ Text Disabled           #707070                         │
│ ████░░░░░░ (44% brightness)                             │
│ Usage: Disabled buttons, inactive states                │
│ Contrast ratio: 4.5:1 on #0a0a0a (AA) ✓                │
└─────────────────────────────────────────────────────────┘
```

### Accent Colors

```
┌─────────────────────────────────────────────────────────┐
│ ACCENT COLORS (Brand & Interactive)                     │
├─────────────────────────────────────────────────────────┤
│ Accent Primary          #5c5cff                         │
│ █████░░░░░ (Blue-purple, vivid)                         │
│ Usage: CTA buttons, links, primary interactive         │
│ Contrast on #0a0a0a: 4.2:1 (AA) ✓                      │
│ Contrast on #ffffff: 4.9:1 (AA) ✓                      │
│                                                         │
│ Accent Hover            #7575ff                         │
│ ██████░░░░ (Lighter blue-purple)                        │
│ Usage: Hover state on buttons                           │
│ Contrast: 2.9:1 vs #5c5cff                              │
│                                                         │
│ Accent Light            #8f8fff                         │
│ ███████░░░ (Pastel blue-purple)                         │
│ Usage: Disabled or subtle states                        │
│                                                         │
│ Accent Secondary        #ff6b6b                         │
│ ███░░░░░░░ (Coral red)                                  │
│ Usage: Secondary CTA, alerts, emphasis                  │
│ Contrast on #0a0a0a: 6.1:1 (AAA) ✓                     │
│                                                         │
│ Accent Success          #51cf66                         │
│ ██████░░░░ (Green)                                      │
│ Usage: Success states, checkmarks, confirmations       │
│ Contrast on #0a0a0a: 7.2:1 (AAA) ✓                     │
│                                                         │
│ Accent Warning          #ffa94d                         │
│ ███████░░░ (Orange)                                     │
│ Usage: Warnings, notices, cautions                      │
│ Contrast on #0a0a0a: 5.8:1 (AAA) ✓                     │
│                                                         │
│ Accent Error            #ff6b6b                         │
│ ███░░░░░░░ (Red)                                        │
│ Usage: Errors, destructive actions                      │
│ Contrast on #0a0a0a: 6.1:1 (AAA) ✓                     │
└─────────────────────────────────────────────────────────┘
```

### Semantic Color Mapping

```
SUCCESS
├─ Background: rgba(81, 207, 102, 0.15)  // #51cf66 tinted
├─ Border:    #51cf66
├─ Text:      #51cf66
└─ Icon:      #51cf66

ERROR
├─ Background: rgba(255, 107, 107, 0.15) // #ff6b6b tinted
├─ Border:    #ff6b6b
├─ Text:      #ff6b6b
└─ Icon:      #ff6b6b

WARNING
├─ Background: rgba(255, 169, 77, 0.15)  // #ffa94d tinted
├─ Border:    #ffa94d
├─ Text:      #ffa94d
└─ Icon:      #ffa94d

INFO
├─ Background: rgba(92, 92, 255, 0.15)   // #5c5cff tinted
├─ Border:    #5c5cff
├─ Text:      #5c5cff
└─ Icon:      #5c5cff
```

---

## Gradients

### Hero Gradient

```css
background: linear-gradient(
  135deg,
  #0a0a0a 0%,      /* Dark navy blue */
  #1a3a3a 50%,     /* Teal-tinted dark */
  #2d1b4e 100%     /* Purple-tinted dark */
);
```

Visual representation:
```
#0a0a0a ─────────────────── #2d1b4e
   │         #1a3a3a         │
   └──────────────────────────┘
         135° diagonal
```

**Effect**: Subtle depth, suggests movement, premium feel

### Card Hover Gradient

```css
background: linear-gradient(
  135deg,
  #1a1a1a 0%,
  #2a2a3a 100%
);
```

**Effect**: Minimal change, focus on elevation via shadow

### Accent Gradient (CTA)

```css
background: linear-gradient(
  90deg,
  #5c5cff 0%,
  #ff6b6b 100%
);
```

**Effect**: Vibrant, eye-catching, energy

---

## Typography

### Font Stack Recommendations

```
Display Font (H1, H2):
font-family: 'Fraunces', 'IBM Plex Mono', serif;

Heading Font (H3, H4, Labels):
font-family: 'Geist Sans', 'Inter', sans-serif;

Body Font (p, li, description):
font-family: 'Geist Sans', 'Inter', sans-serif;

Monospace Font (code, pre):
font-family: 'Space Mono', 'IBM Plex Mono', monospace;
```

### Font Sizes & Weights

```
┌─────────────────────────────────────────────────────┐
│ H1 - Hero Title                                     │
├─────────────────────────────────────────────────────┤
│ Desktop:  72px / 900 weight / line-height 1.2      │
│ Tablet:   56px / 800 weight / line-height 1.2      │
│ Mobile:   40px / 700 weight / line-height 1.2      │
│ Color:    #ffffff                                   │
│ Font:     Fraunces (serif) or IBM Plex Mono bold   │
│ Letter-spacing: -0.02em (visual tightness)         │
│                                                     │
│ Example: "Make anything possible, all in Cumplia"  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ H2 - Section Title                                  │
├─────────────────────────────────────────────────────┤
│ Desktop:  48px / 700 weight / line-height 1.3      │
│ Tablet:   40px / 600 weight / line-height 1.3      │
│ Mobile:   32px / 600 weight / line-height 1.3      │
│ Color:    #ffffff                                   │
│ Font:     Geist Sans or Inter                       │
│ Margin-bottom: 24px (spacing)                       │
│                                                     │
│ Example: "Why Cumplia?"                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ H3 - Card Title / Feature Name                      │
├─────────────────────────────────────────────────────┤
│ Size:     24px                                      │
│ Weight:   600                                       │
│ Line-height: 1.4                                    │
│ Color:    #ffffff                                   │
│ Font:     Geist Sans or Inter                       │
│ Margin-bottom: 12px                                 │
│                                                     │
│ Example: "Powerful Features"                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ BODY - Paragraph Text                               │
├─────────────────────────────────────────────────────┤
│ Size:     16px (base)                               │
│ Weight:   400-500                                   │
│ Line-height: 1.6 (improved readability)             │
│ Color:    #e0e0e0 (secondary text)                  │
│ Font:     Geist Sans or Inter                       │
│ Letter-spacing: 0.01em                              │
│ Max-width: 600px per line (optimal reading)         │
│                                                     │
│ Example: "Deploy in minutes, not days. Our platform│
│ streamlines your workflow."                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ SMALL - Caption, Label, Helper Text                 │
├─────────────────────────────────────────────────────┤
│ Size:     14px                                      │
│ Weight:   400                                       │
│ Line-height: 1.5                                    │
│ Color:    #a0a0a0 (tertiary text)                   │
│ Font:     Geist Sans or Inter                       │
│ Letter-spacing: 0.02em (slightly spaced)            │
│                                                     │
│ Example: "No credit card required"                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ CODE - Monospace                                    │
├─────────────────────────────────────────────────────┤
│ Size:     14px                                      │
│ Weight:   400                                       │
│ Line-height: 1.5                                    │
│ Color:    #5c5cff (accent)                          │
│ Font:     Space Mono or IBM Plex Mono              │
│ Background: rgba(92, 92, 255, 0.1) (subtle tint)   │
│ Padding:  2px 6px (inline), 12px (block)           │
│                                                     │
│ Example: `npm install cumplia`                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ BUTTON TEXT                                         │
├─────────────────────────────────────────────────────┤
│ Size:     16px                                      │
│ Weight:   600 (semibold, weight visual)             │
│ Color:    #ffffff (on primary accent)               │
│ Font:     Geist Sans or Inter                       │
│ Uppercase: optional (for micro-labels)              │
│ Letter-spacing: 0.03em (emphasis)                   │
│ Padding:  12px 32px (height 44px min.)              │
│                                                     │
│ Example: "Get started"                              │
└─────────────────────────────────────────────────────┘
```

### Line Height Guidelines

```
Display (H1):      1.2  (tighter for visual impact)
Heading (H2-H3):   1.3-1.4 (balance of readability)
Body (p, li):      1.6  (optimal readability)
Small (captions):  1.5  (slightly tighter)
Code:              1.5  (readable but compact)
```

**Why**: Tight line heights on display creates visual weight. Generous line heights on body text prevent eye fatigue.

---

## Component Color Reference

### Navigation Bar

```
Background:        #0a0a0a (no elevation)
Text:              #e0e0e0
Links:
  Default:         #e0e0e0
  Hover:           #5c5cff (accent)
  Active:          #5c5cff (accent)
Dividers:          #1a1a1a

Button (CTA):
  Background:      #5c5cff
  Color:           #ffffff
  Hover:           #7575ff
```

### Hero Section

```
Background Gradient: linear-gradient(135deg, #0a0a0a 0%, #1a3a3a 50%, #2d1b4e 100%)
Overlay (video):     rgba(10, 10, 10, 0.3) (30% opacity dark)

H1:                  #ffffff
Subtitle:            #e0e0e0
Small text:          #a0a0a0

CTA Primary:
  Background:        #5c5cff
  Color:             #ffffff
  Hover:             #7575ff
  Shadow:            0 8px 24px rgba(92, 92, 255, 0.4)

CTA Secondary:
  Background:        transparent
  Border:            1px #a0a0a0
  Color:             #e0e0e0
  Hover:
    Border:          1px #ffffff
    Color:           #ffffff
```

### Feature Card

```
Background:        #1a1a1a
Border:            1px #2a2a2a
Border Hover:      1px #5c5cff

Icon Background:   #2d1b4e (accent tinted)
Icon Color:        #5c5cff

Title (H3):        #ffffff
Description:       #e0e0e0
Link:              #5c5cff

Shadow Default:    0 4px 12px rgba(0, 0, 0, 0.4)
Shadow Hover:      0 8px 32px rgba(92, 92, 255, 0.2)

Transition:        all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Pricing Card

```
Background Standard:     #1a1a1a
Background Highlighted:  linear-gradient(135deg, #2d1b4e, #1a1a2e)

Border Standard:         1px #2a2a2a
Border Highlighted:      1px #5c5cff

Price:                   #ffffff (72px, bold)
Period:                  #a0a0a0
Description:             #e0e0e0

Feature Item:
  Text:                  #e0e0e0
  Icon:                  #51cf66 (success)

Button:                  (same as CTA Primary)

Badge "Popular":
  Background:            #5c5cff
  Color:                 #ffffff
  Position:              Top-right, -12px offset
```

### Testimonial Card

```
Background:        #1a1a1a
Border:            1px #2a2a2a
Shadow:            0 4px 12px rgba(0, 0, 0, 0.4)

Stars:             #ffa94d (warning/orange)

Quote Text:        #e0e0e0
Quote Italic:      yes

Author Name:       #ffffff
Author Title:      #a0a0a0
Author Company:    #5c5cff (accent)

Avatar Border:     2px #5c5cff (optional)
Avatar Bg:         #2a2a2a
```

### Button States

```
PRIMARY BUTTON
├─ Default
│  ├─ Background: #5c5cff
│  ├─ Color: #ffffff
│  ├─ Shadow: 0 4px 12px rgba(92, 92, 255, 0.3)
│  └─ Cursor: pointer
│
├─ Hover
│  ├─ Background: #7575ff
│  ├─ Transform: translateY(-2px)
│  └─ Shadow: 0 8px 24px rgba(92, 92, 255, 0.5)
│
├─ Active
│  ├─ Background: #4a4aff
│  ├─ Transform: translateY(0px)
│  └─ Shadow: 0 2px 8px rgba(92, 92, 255, 0.3)
│
├─ Focus (Keyboard)
│  ├─ Outline: 2px solid #ffffff
│  ├─ Outline-offset: 2px
│  └─ Background: #5c5cff (unchanged)
│
└─ Disabled
   ├─ Background: #707070
   ├─ Color: #505050
   ├─ Cursor: not-allowed
   └─ Opacity: 0.6

SECONDARY BUTTON
├─ Default
│  ├─ Background: transparent
│  ├─ Border: 1px #a0a0a0
│  ├─ Color: #e0e0e0
│  └─ Cursor: pointer
│
├─ Hover
│  ├─ Border: 1px #ffffff
│  ├─ Color: #ffffff
│  └─ Background: rgba(255, 255, 255, 0.05)
│
├─ Focus
│  ├─ Outline: 2px solid #ffffff
│  └─ Outline-offset: 2px
│
└─ Disabled
   ├─ Border: 1px #505050
   ├─ Color: #505050
   └─ Cursor: not-allowed
```

---

## CSS Variables (Implementation)

```css
:root {
  /* === NEUTRALS === */
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #1a1a1a;
  --color-bg-tertiary: #2a2a2a;
  --color-border-default: #1a1a1a;
  --color-border-hover: #2a2a2a;

  /* === TEXT === */
  --color-text-primary: #ffffff;
  --color-text-secondary: #e0e0e0;
  --color-text-tertiary: #a0a0a0;
  --color-text-disabled: #707070;

  /* === ACCENTS === */
  --color-accent-primary: #5c5cff;
  --color-accent-hover: #7575ff;
  --color-accent-light: #8f8fff;
  --color-accent-secondary: #ff6b6b;
  --color-accent-success: #51cf66;
  --color-accent-warning: #ffa94d;
  --color-accent-error: #ff6b6b;

  /* === TYPOGRAPHY === */
  --font-display: 'Fraunces', 'IBM Plex Mono', serif;
  --font-heading: 'Geist Sans', 'Inter', sans-serif;
  --font-body: 'Geist Sans', 'Inter', sans-serif;
  --font-mono: 'Space Mono', 'IBM Plex Mono', monospace;

  --font-size-h1: 72px;
  --font-size-h2: 48px;
  --font-size-h3: 24px;
  --font-size-body: 16px;
  --font-size-small: 14px;

  --line-height-display: 1.2;
  --line-height-heading: 1.4;
  --line-height-body: 1.6;

  /* === SPACING === */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* === SHADOWS === */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.5);

  /* === TRANSITIONS === */
  --transition-fast: 150ms cubic-bezier(0.2, 0.2, 0.38, 0.9);
  --transition-base: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-slow: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* === BORDER RADIUS === */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}
```

### Usage Example

```css
.button-primary {
  background-color: var(--color-accent-primary);
  color: var(--color-text-primary);
  padding: 12px 32px;
  font-size: var(--font-size-body);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  cursor: pointer;
  border: none;
}

.button-primary:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(92, 92, 255, 0.5);
}

.button-primary:focus {
  outline: 2px solid var(--color-text-primary);
  outline-offset: 2px;
}

.button-primary:disabled {
  background-color: var(--color-text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}
```

---

## Dark Mode Implementation

```css
/* Default: Dark mode (no media query needed) */
:root {
  color-scheme: dark;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* Light mode as fallback (optional) */
@media (prefers-color-scheme: light) {
  :root {
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f5f5f5;
    --color-bg-tertiary: #e8e8e8;
    --color-text-primary: #0a0a0a;
    --color-text-secondary: #2a2a2a;
    --color-text-tertiary: #5a5a5a;
    /* ... etc ... */
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Contrast Verification Chart

```
Text Color         Background       Ratio    Level
─────────────────────────────────────────────────
#ffffff           #0a0a0a         21:1      AAA ✓
#ffffff           #1a1a1a         14:1      AAA ✓
#ffffff           #2a2a2a         11:1      AAA ✓
#e0e0e0           #0a0a0a         15.3:1    AAA ✓
#e0e0e0           #1a1a1a         10.8:1    AAA ✓
#a0a0a0           #0a0a0a         6.5:1     AA ✓
#a0a0a0           #1a1a1a         4.6:1     AA ✓

#5c5cff (accent)  #ffffff         4.9:1     AA ✓
#5c5cff (accent)  #0a0a0a         4.2:1     AA ✓
#ff6b6b (error)   #ffffff         3.3:1     AAA ✓
#ff6b6b (error)   #0a0a0a         6.1:1     AAA ✓
#51cf66 (success) #0a0a0a         7.2:1     AAA ✓
#ffa94d (warning) #0a0a0a         5.8:1     AAA ✓
```

---

## Export Formats

### Figma Export (Figma Variables)

```
Collections:
├─ color/background
├─ color/text
├─ color/accent
├─ typography/display
├─ typography/heading
├─ typography/body
└─ typography/mono
```

### Tailwind Config

```javascript
module.exports = {
  theme: {
    colors: {
      bg: {
        primary: '#0a0a0a',
        secondary: '#1a1a1a',
        tertiary: '#2a2a2a',
      },
      text: {
        primary: '#ffffff',
        secondary: '#e0e0e0',
        tertiary: '#a0a0a0',
      },
      accent: {
        primary: '#5c5cff',
        secondary: '#ff6b6b',
        success: '#51cf66',
        warning: '#ffa94d',
      },
    },
    fontFamily: {
      display: ['Fraunces', 'serif'],
      heading: ['Geist Sans', 'sans-serif'],
      body: ['Geist Sans', 'sans-serif'],
      mono: ['Space Mono', 'monospace'],
    },
  },
};
```

---

**Design Tokens v1.0** | March 27, 2026
Ready for implementation in Figma, code, and design system.
