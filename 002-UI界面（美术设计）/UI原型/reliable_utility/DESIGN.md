---
name: Reliable Utility
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424754'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#3452c1'
  on-tertiary: '#ffffff'
  tertiary-container: '#506cdb'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b8c4ff'
  on-tertiary-fixed: '#001453'
  on-tertiary-fixed-variant: '#173bab'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-bg: '#F5F7FA'
  surface-card: '#FFFFFF'
  text-heading: '#111827'
  text-body: '#374151'
  text-secondary: '#6B7280'
  text-placeholder: '#9CA3AF'
  border-standard: '#E5E7EB'
  border-active: '#BFDBFE'
  success: '#22C55E'
  success-bg: '#F0FDF4'
  warning: '#F59E0B'
  warning-bg: '#FFFBEB'
  danger: '#EF4444'
  danger-bg: '#FEF2F2'
  mastery-unmastered: '#60A5FA'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  input-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 16px
  tight: 8px
  xtight: 4px
  loose: 24px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is anchored in a **Corporate/Modern** aesthetic, emphasizing a "Safe" and utility-first approach. It is specifically crafted for a student learning management tool where reliability and speed of information retrieval are paramount. The visual language conveys professionalism and trustworthiness through a disciplined use of whitespace, a constrained color palette, and a focus on legibility.

The brand personality is **Professional, Efficient, and Dependable**. It avoids unnecessary decorative flourishes, opting instead for a minimalist structure that ensures the user's focus remains on data entry and student progress tracking. The interface should feel like a high-performance instrument—unobtrusive yet highly functional, optimized for "30-second recording" tasks on mobile devices.

## Colors

The color strategy is "Blue-centric and Restrained," utilizing a monochromatic blue progression to signal hierarchy and mastery.

- **Primary Action**: Use `#3B82F6` for key interactive elements, primary buttons, and active states.
- **Surface Strategy**: The global background uses a cool-toned gray-blue (`#F5F7FA`) to reduce eye strain, while content lives on pure white (`#FFFFFF`) cards to provide clear separation.
- **Semantic Integrity**: Status colors (Success, Warning, Danger) are reserved exclusively for feedback and data categorization (e.g., homework completion status). They must never be used for general decoration.
- **Mastery Scale**: For data visualization, use the blue scale from `mastery-unmastered` (`#60A5FA`) up to `tertiary` (`#1E40AF`) to indicate increasing levels of student proficiency.

## Typography

This design system uses **Inter** across all levels to maintain a systematic and utilitarian feel. Hierarchy is established primarily through font weight and neutral color depth rather than drastic size changes.

- **Scale & Accessibility**: On mobile, input fields must use a minimum size of `16px` (`input-text`) to prevent iOS and Android browsers from auto-zooming on focus.
- **Headlines**: Reserved for student names and page titles, using the `text-heading` color.
- **Body**: Standardized for record descriptions and notes using the `text-body` color.
- **Metadata**: Timestamps, auxiliary labels, and secondary details use the `label` levels with `text-secondary` color.

## Layout & Spacing

The layout follows a **Mobile-First** philosophy, optimized for the WeChat environment and vertical scrolling.

- **Rhythm**: A strict 8px/16px grid maintains consistency. All margins between cards and screen edges should be at least `16px`.
- **Card-Based Layout**: Content is grouped into logical modules using cards. Vertical spacing between cards is standardized at `16px`.
- **Navigation**: A fixed bottom tab bar handles primary navigation. The "Record" action is given prominence as a central floating-style button in the tab bar to facilitate one-handed operation.
- **Form Density**: Layouts for data entry are condensed to minimize scrolling, using horizontal layouts for toggles and chips to keep forms short.

## Elevation & Depth

This design system utilizes **Tonal Layers** rather than heavy shadows to create hierarchy. This approach maintains a clean, "flat" aesthetic that performs well across varying mobile screen qualities.

- **Level 0 (Base)**: The global background (`#F5F7FA`).
- **Level 1 (Surface)**: White cards (`#FFFFFF`) with a `1px` border of `border-standard`. These appear visually "lifted" due to the contrast against the background.
- **Level 2 (Interactive)**: Elements like modals or dropdowns may use a very soft, diffused ambient shadow (10% opacity) to indicate they are temporary overlays.
- **Active State**: Instead of physical elevation, use a border color shift to `border-active` (`#BFDBFE`) or a subtle background tint (`#EFF6FF`) to indicate selection.

## Shapes

The shape language is defined by a consistent **Rounded (12px)** radius, which balances professional structure with modern accessibility.

- **Standard Radius**: `12px` is applied to all primary UI containers, including cards, input fields, and large buttons.
- **Small Elements**: For tags, chips, and small indicators, use `8px` (rounded-lg equivalent) to maintain visual proportion.
- **Consistency**: Sharp corners (0px) should be avoided entirely to maintain the approachable, modern utility feel.

## Components

### Buttons
- **Primary**: Solid `#3B82F6` fill with white text. Apply `12px` corner radius. Only one solid primary button is permitted per view.
- **Secondary**: Outlined with `border-standard` or ghost style with primary-colored text.
- **States**: On press, primary buttons shift to `#2563EB`.

### Cards
- Pure white background, `12px` radius, and a light `1px` gray border. 
- Internal padding is set to `16px` (`base`).

### Inputs & Forms
- **Fields**: `16px` text size to prevent mobile zoom. `12px` radius.
- **Selectable Chips**: Used for "Conditions" (Great, Good, etc.). Active chips use the primary blue background or semantic colors if indicating status.
- **Star Rating**: Used for "Focus" level. Unlit stars use `border-standard`; lit stars use `primary-color`.

### Lists & Dividers
- Use `1px` solid `border-standard` for hairline dividers between student records or menu items.
- Ensure a minimum touch target of `44px` for all list interactions.

### Semantic Tags
- Small badges with light backgrounds (`success-bg`, `warning-bg`, `danger-bg`) and high-contrast text for immediate status recognition.