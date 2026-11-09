---
name: Precision Booking System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e8eeff'
  surface-container-high: '#dfe8ff'
  surface-container-highest: '#d9e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#45474c'
  inverse-surface: '#273143'
  inverse-on-surface: '#ecf0ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e71'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141b2c'
  on-primary-container: '#7c8498'
  inverse-primary: '#bfc6dc'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818487'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe2f9'
  primary-fixed-dim: '#bfc6dc'
  on-primary-fixed: '#141b2c'
  on-primary-fixed-variant: '#3f4759'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#e0e3e6'
  tertiary-fixed-dim: '#c4c7ca'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#44474a'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d9e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  code-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-mobile: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system embodies high-craft digital utility, directly influenced by modern European product design movements, technical precision tools (Linear), transactional confidence (Stripe), and frictionless scheduling architecture (Cal.com).

### Target Audience & Core Persona
Built for ambitious professionals, service businesses, and global operators who view scheduling not as an administrative chore, but as a critical revenue engine. The interface speaks to founders, clinical practices, consultancies, and modern platforms demanding zero visual friction and infallible operational clarity.

### Emotional Disposition
- **Hyper-Calm & Methodical:** Every interaction yields an immediate sense of quiet control. The UI removes anxiety from time commitments.
- **Engineered Trust:** Crisp micro-boundaries, neutral canvases, and deliberate typographic rhythm reassure both the host and the guest during real-time transactions and calendar confirmations.
- **Frictionless Velocity:** Fast, lightweight transitions paired with unmistakable clickability.

### Visual Aesthetic
Minimalist technical utilitarianism. The system rejects superficial ornamentation, gradients, and heavy skeuomorphic shadows in favor of hairline structural separators (`#E4E7EC`), generous whitespace, refined micro-surfaces (`#F8FAFC`), and surgical pops of dynamic turquoise (`#14B8A6`) to direct intentional action.

## Colors

The palette is tuned for high data density, effortless scannability, and clear transactional state definitions. The system prioritizes a default light experience, optimizing legibility for daytime scheduling and desktop admin panels.

### Structural & Brand Palette
- **Deep Midnight (`#101828`):** The structural anchor. Governs primary headlines, active sidebar navigation states, top-tier iconography, and high-impact structural panels.
- **Vibrant Turquoise (`#14B8A6`):** The catalytic accent. Reserved exclusively for key conversion actions (CTA buttons), available calendar slot highlights, selection rings, and progress indicators.
- **Canvas Primary (`#FFFFFF`):** High-purity white used for primary cards, interactive form fields, dropdowns, and calendar grids.
- **Surface Secondary (`#F8FAFC` to `#F2F4F7`):** Subdued off-white used for the global background canvas, table header bands, disabled inputs, and nested secondary containers.
- **Muted Slate (`#667085`):** Mid-tone neutral for secondary labels, metadata strings, timezone markers, and placeholder text.
- **Structural Border (`#E4E7EC`):** The hairline divider separating components, table rows, and card perimeters.

### Semantic & Lifecycle Tokens
- **Success (`#12B76A`):** Confirmed reservations, successful webhooks, verified payment state.
- **Warning (`#F79009`):** Pending approvals, soft-holds, pre-authorizations requiring confirmation.
- **Danger (`#D92D20`):** Cancellations, rejected slots, payment errors, destructive actions.
- **Informational Tint (`#F0FDF9` / `#14B8A6`):** Active slot hover, selected meeting configuration.

## Typography

The type system is powered entirely by **Inter**, leveraging its optimized mechanical grotesque form, tabular figures for time grids, and immaculate legibility across screens.

### Typographic Hierarchy & Principles
- **Optical Tightening:** Display and headline sizes use negative tracking (`-0.025em` down to `-0.01em`) to create a compact, modern editorial feel comparable to developer consoles and elite fintech apps.
- **Tabular Numerals (`tnum`):** All calendar slots, booking timestamps, durations, and pricing indicators must activate tabular figure variants via CSS (`font-variant-numeric: tabular-nums`) to ensure strict vertical alignment across calendars and tables.
- **Strict Color Association:** Headlines default to `#101828`. Body and running text sit at `#101828` or `#344054`. Meta-information, secondary table data, and form hints strictly use `#667085`.

## Layout & Spacing

The layout philosophy follows a disciplined, utility-driven 12-column grid system paired with strict 4px/8px incremental rhythm.

### Grid & Breakpoints
- **Mobile (`< 768px`):** Single-column layout. Margin: `1rem` (`16px`). Gutters: `1rem` (`16px`). Components collapse vertically; calendar months reflow into stacked swipeable carousels; booking time pills stretch to 100% width.
- **Tablet (`768px – 1024px`):** 8-column layout. Margin: `1.5rem` (`24px`). Gutters: `1.5rem` (`24px`). Master-detail booking splits collapse into step-by-step sequential views.
- **Desktop (`> 1024px`):** 12-column layout. Max container constraint: `1280px` centered on canvas. Margin: `2rem` (`32px`). Gutters: `1.5rem` (`24px`). The canonical scheduling interface uses a split-plane architecture: fixed service/host details on the left (4 columns) and interactive monthly calendar + slot picker on the right (8 columns).

### Spacing Principles
- Density is intentional: administrative booking tables use tight rows with `space-sm` (`8px`) vertical cell padding.
- Customer-facing booking funnels employ generous breathing room (`space-lg` to `space-xl`) between date selection and form fields to maximize focus and reduce cognitive load.

## Elevation & Depth

Visual depth is achieved through **low-contrast outlines, layered surface tones, and subtle ambient shadows**. Heavy, high-opacity drop shadows are eliminated.

### Tier Structure
- **Level 0 (Canvas Base):** Background layer (`#F8FAFC`). No border, no shadow.
- **Level 1 (Card & Slot Tier):** Pure white `#FFFFFF` surface bounded by a crisp 1px solid hairline border (`#E4E7EC`). Shadow: `0 1px 2px 0 rgba(16, 24, 40, 0.04)`. Used for standard calendar cards, service items, and table rows.
- **Level 2 (Interactive Floating Tier):** Used for hover states on bookable slots, active modals, and popovers. Scaled hairline border (`#D0D5DD`). Shadow: `0 4px 12px -2px rgba(16, 24, 40, 0.06), 0 2px 4px -2px rgba(16, 24, 40, 0.03)`.
- **Level 3 (Overlays & Drawer System):** Used for appointment detail panels and reschedule side sheets. Shadow: `0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03)`.

## Shapes

The geometric identity is clean, controlled, and intentionally modern. It utilizes a unified `roundedness: 2` (base radius of 8px to 14px for structural containers), avoiding the toy-like nature of full circular pills on primary cards, while maintaining soft touch points for interactive items.

### Radius Scale
- **Interactive Micro-Elements (`6px` / `rounded-md`):** Checkbox boxes, dropdown triggers, status indicators, nested time-pill buttons.
- **Action Controls (`8px` to `10px` / `rounded-lg`):** Standard buttons, text inputs, search fields, quick filter chips.
- **Structural Modules (`12px` to `14px` / `rounded-xl`):** Booking cards, calendar month wrappers, summary panels, and modal windows.
- **Pill Exceptions (`9999px` / `rounded-full`):** Exclusively applied to circular host avatars and small quantitative status notification pills.

## Components

### Buttons
- **Primary (Turquoise):** Background `#14B8A6`, text `#FFFFFF`, font-weight 500 (`label-md`). Hover: `#0D9488`. Active: `#0F766E`. Focus: ring 3px `#14B8A6` at 20% opacity.
- **Secondary (Midnight):** Background `#101828`, text `#FFFFFF`. Hover: `#1D2939`.
- **Tertiary / Outline:** Background `#FFFFFF`, border `1px solid #E4E7EC`, text `#344054`. Hover: background `#F9FAFB`, border `#D0D5DD`.
- **Ghost:** Background transparent, text `#667085`. Hover: `#F2F4F7`, text `#101828`.

### Chips & Status Badges
Badges communicate immediate status via subtle background washes and dark text:
- **Confirmé (Confirmed):** Background `#ECFDF3`, border `#A6F4C5`, text `#027A48`.
- **En attente / Préautorisation (Pending/Pre-auth):** Background `#FFFAEB`, border `#FEDF89`, text `#B54708`.
- **Annulé / Refusé (Cancelled/Declined):** Background `#FEF3F2`, border `#FECDCA`, text `#B42318`.
- Badge shape is strictly `rounded-md` (4px to 6px) with micro text `label-sm` (`12px`, weight 500) and an optional 6px solid circular dot on the leading edge.

### Input Fields
- Height: 40px standard.
- Surface: `#FFFFFF` with `1px solid #E4E7EC` border, `rounded-lg` (8px). Text: `#101828`, placeholder `#667085`.
- Focus state: border `#14B8A6`, paired with an ambient box-shadow ring `0 0 0 3px rgba(20, 184, 166, 0.15)`.
- Error state: border `#FDA29B`, focus ring tinted in red.

### Checkboxes & Radios
- Checkbox: 16x16px, `rounded-sm` (4px), border `1px solid #D0D5DD`. Checked: background `#14B8A6`, border `#14B8A6`, white tick icon.
- Radio: 16x16px, fully circular, 1px border. Checked: `#14B8A6` filled ring with white inner dot.

### Cards
- Surface `#FFFFFF`, border `1px solid #E4E7EC`, radius `rounded-xl` (12px to 14px), shadow `Level 1`.
- Padding: `1.5rem` (`24px`) on desktop, `1rem` (`16px`) on mobile.
- Section headers inside cards separated by a 1px divider `#F2F4F7`.

### Calendars & Slot Selectors
- **Calendar Cell (Date):** 40x40px square/soft-rounded. Inactive dates: text `#D0D5DD`. Current month available: text `#101828`, weight 500. Selected date: background `#101828`, text `#FFFFFF`. Hover on available date: background `#F0FDF9`, text `#14B8A6`.
- **Time Slot Pills:** Vertical column or 2-column grid. Border `1px solid #E4E7EC`, background `#FFFFFF`, text `#101828`, height 44px, radius `rounded-lg`.
- Hover: border `#14B8A6`, background `#F0FDF9`, text `#0D9488`.
- Active/Selected: background `#14B8A6`, border `#14B8A6`, text `#FFFFFF`, weight 600.
- Booked/Unavailable: background `#F8FAFC`, border `1px solid #F2F4F7`, text `#D0D5DD`, cursor not-allowed.