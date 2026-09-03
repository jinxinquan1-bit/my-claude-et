---
name: Reliable Utility Desktop
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fd'
  surface-container: '#ecedf7'
  surface-container-high: '#e6e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#424754'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#eff0fa'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#924700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#f9f9ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
  app-bg: '#F8FAFC'
  card-white: '#FFFFFF'
  periwinkle-subtle: '#EEF2F6'
  border-light: '#E2E8F0'
  text-main: '#0F172A'
  text-muted: '#64748B'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  page-margin: 32px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  sidebar-width: 260px
  max-content-width: 1440px
---

## Brand & Style

This design system is a professional evolution of a utility-focused system, optimized for high-productivity desktop environments. The brand personality is **Professional, Systematic, and Precise**, moving away from a basic mobile layout toward a sophisticated SaaS aesthetic. It evokes a sense of "Safe Innovation"—reliable enough for enterprise data handling but modern enough to feel premium.

The visual style is **Corporate / Modern** with a focus on **Tonal Layering**. By replacing pure white backgrounds with a subtle periwinkle-grey base, we create a "canvas and card" relationship that reduces eye strain and provides clear structural hierarchy. The UI feels "Soft-Industrial": clean lines and structured grids are balanced by generous 12px-16px corner radii and a calm, blue-centric color palette.

## Colors

The palette is designed to differentiate between the application "shell" and the interactive "content."

- **The Neutral Foundation**: The main application background uses `app-bg` (`#F8FAFC`), a very light periwinkle-grey. This ensures that `card-white` (`#FFFFFF`) surfaces appear distinctly elevated and prioritized.
- **Primary Blue**: `#3B82F6` is the engine of the system. It is used more expansively than in mobile versions, appearing in sidebar active states, focus rings, and primary action buttons to inject energy into the "utility" look.
- **Subtle Layering**: `periwinkle-subtle` is used for inner-card sections, header backgrounds, or table row zebra-striping to add depth without adding borders.
- **Typography Colors**: `text-main` provides high-contrast legibility for data, while `text-muted` handles labels and secondary information.

## Typography

The system utilizes **Inter** for its neutral, high-legibility characteristics. For desktop, the hierarchy is expanded to accommodate wider layouts and dashboard-style views.

- **Rhythmic Spacing**: Maintain a strict vertical rhythm where line heights are always multiples of 4px.
- **Display & Headlines**: Large screen titles use `display-lg` or `headline-xl` with slight negative letter spacing to feel tighter and more premium.
- **Body Scaling**: The default reading size is `body-md` (16px). For dense data tables, `body-sm` (14px) is preferred to maximize information density without sacrificing clarity.
- **Weight as Signal**: Use SemiBold (600) for UI headings and Medium (500) for labels to differentiate interactive text from static content.

## Layout & Spacing

The design system transitions from a mobile-first column to a **Fixed-Fluid Hybrid Grid** for desktop.

- **Sidebar Navigation**: A fixed `sidebar-width` of 260px anchors the left side of the application. It uses a slightly darker tint (`periwinkle-subtle`) to separate navigation from the workspace.
- **Content Max-Width**: Main content areas are capped at `1440px` to maintain comfortable line lengths and prevent data "stretching" on ultra-wide monitors.
- **Spacing Rhythm**: A 8px base grid is strictly followed. Page margins are set to `32px` to give the UI room to "breathe," while internal card padding scales between `24px` and `32px` depending on content density.
- **Responsive Reflow**: At tablet widths (below 1024px), the sidebar collapses into a rail or hamburger menu, and page margins reduce to `24px`.

## Elevation & Depth

Hierarchy is established through a combination of **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Base)**: `app-bg` (#F8FAFC) - The deepest layer.
- **Level 1 (Card)**: `card-white` (#FFFFFF) with a `1px` border of `border-light`. This layer uses a very soft, multi-layered shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`.
- **Level 2 (Interactive/Floating)**: Modals, dropdowns, and popovers use a more pronounced "Premium" shadow to indicate temporary overlay status: `0 10px 15px -3px rgb(0 0 0 / 0.08)`.
- **Depth through Contrast**: Avoid using shadows for primary layout blocks like sidebars; instead, use vertical borders or slight background color shifts to define these areas.

## Shapes

The shape language is refined for a "Premium Utility" feel, using a **Rounded (Level 2)** scale.

- **Large Containers**: Main content cards and dashboard modules utilize a **16px (rounded-xl)** radius, creating a softer, more modern industrial look.
- **Standard Components**: Buttons, input fields, and smaller UI widgets use a **8px (rounded-lg)** radius for a balanced, professional appearance.
- **Consistent Enclosure**: When elements are nested (e.g., a button inside a card), ensure the inner radius is smaller than the outer radius to maintain visual harmony (Outer Radius = Inner Radius + Padding).

## Components

### Navigation (Desktop Sidebar)
The sidebar is the primary navigation anchor. It should feature a `primary_color_hex` vertical indicator for active states and use `text-muted` for inactive icons/labels. Hover states should use a subtle `periwinkle-subtle` background shift.

### Cards & Layout Modules
Cards are the primary container for data. They must feature a white background, the Level 1 shadow, and a 16px corner radius. In desktop views, cards should leverage the extra width by using multi-column grid layouts for internal content.

### Primary & Secondary Buttons
- **Primary**: Solid Blue (#3B82F6) with white text, 8px radius. Use a subtle gradient (top-to-bottom) or a 1px inner highlight to add a "tactile" SaaS feel.
- **Secondary**: Outlined with `border-light`, using `primary_color_hex` for text.

### Form Inputs
Inputs use a white background, 8px radius, and a 1px `border-light`. On focus, the border should transition to `primary_color_hex` with a soft 3px blue glow (ring).

### Data Tables
Tables should use `body-sm` typography. The header row should be `periwinkle-subtle` with `label-lg` text. Rows should have a subtle 1px bottom border rather than zebra stripes for a cleaner look.