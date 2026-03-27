# Visual Polish Design: Archery Metrics App

## Goal

Add personality, animations, and visual depth to the existing archery target color theme. Zero new dependencies — all CSS keyframes + Tailwind utilities.

## 1. Entry Animations

| Animation | Target | Duration | Easing |
|-----------|--------|----------|--------|
| `fadeSlideUp` | Cards, sections | 400ms, 50ms stagger | ease-out |
| Tab content crossfade | Active tab form | 200ms | ease-out |
| `contentExpand` | Collapsible FieldGroup | 250ms | ease |
| `slideUpEntry` | Sticky bottom bar | 300ms | ease-out |

## 2. Micro-interactions

- **Card hover**: `translateY(-1px)` + enhanced layered shadow, 150ms
- **Input focus glow**: Pulsing gold ring `box-shadow: 0 0 0 3px var(--ring-gold)`, 1.5s cycle
- **Tab/button press**: `scale(0.97)` on `:active`, 100ms
- **Match bar indicator**: Gold glow trail `box-shadow: 0 0 8px var(--gold)`
- **Value change flash**: Brief gold background pulse on result update

## 3. Visual Depth

- **Card glass**: `bg-[var(--bg-surface)]/80` + `backdrop-blur-sm` + layered shadows
- **Active glow**: Gold-tinted shadow on focused/active elements
- **Background gradient**: Subtle radial from center (lighter) to edges
- **Header accent**: Thin gold gradient line under sticky header

## 4. Archery Accents

- **Target rings**: 3 concentric SVG circles (gold/red/blue at 5% opacity) behind match bar
- **Section dividers**: Centered arrow/chevron motif
- **Header underline**: `linear-gradient(90deg, transparent, var(--gold), transparent)`

## 5. Accessibility

- All animations respect `prefers-reduced-motion: reduce` — disabled entirely
- Touch targets remain 44px+
- No content shift from animations (transform-only)

## Files Modified

- `src/index.css` — keyframes, utility classes, background, reduced-motion
- `src/components/FieldGroup.tsx` — grid-rows collapse animation
- `src/components/InputField.tsx` — focus glow
- `src/components/SelectField.tsx` — focus glow
- `src/components/FormSection.tsx` — entry animation, glass depth
- `src/components/TabNavigation.tsx` — press feedback, active glow
- `src/components/Toolbar.tsx` — button press scale
- `src/components/ResultsSummary.tsx` — target rings, indicator glow, value flash
- `src/components/TuningAssistant.tsx` — card hover, entry animation
- `src/components/SetupComparator.tsx` — card hover, entry animation
- `src/App.tsx` — stagger logic, sticky bar entry, header accent, background gradient
