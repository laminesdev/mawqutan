# Mawqūtan Design System

> Golden-ratio dark theme for Islamic prayer times.
> Inspiration: Linear (spacing, minimalism) × Islamic geometric vernacular.

## Tokens

### Color
```
--color-bg: #0a0e27
--color-surface: rgba(232, 224, 208, 0.05)
--color-overlay: rgba(17, 21, 51, 0.95)
--color-text-primary: #e8e0d0
--color-text-secondary: #8b83a0
--color-text-muted: #a098c0
--color-text-verse: #6b6380
--color-accent: #d4a843
--color-accent-hover: #c49430
--color-accent-glow: rgba(212, 168, 67, 0.4)
--color-border: rgba(232, 224, 208, 0.1)
--color-placeholder: #7a7390
--color-toast-bg: rgba(17, 21, 51, 0.95)
```

### Spacing (4pt scale — Linear-compatible)
```
--space-2xs: 0.125rem (2px)
--space-xs: 0.25rem (4px)
--space-sm: 0.5rem (8px)
--space-md: 1rem (16px)
--space-lg: 1.5rem (24px)
--space-xl: 2rem (32px)
```

### Radius
```
--radius: 6px (unified)
--radius-lg: 12px
```

### Typography
```
--font-arabic: 'Noto Naskh Arabic', serif
--font-latin: 'Inter', system-ui, sans-serif
```

### Transitions
```
--transition-fast: 0.15s
--transition-normal: 0.2s
--transition-slow: 0.3s
```

## Components

| Component | Description |
|-----------|-------------|
| RegionSelect | City picker with search, toggle city/custom, method picker |
| PrayerTimesScreen | Active prayer display, countdown, prayer list |
| TimerScreen | Fullscreen lock during prayer timer (5 min) |
| ErrorBoundary | Catches crashes, shows restart button |
| Toast | Prayer time notification (bottom-fixed banner) |

## Do's
- Use CSS variables from :root over hardcoded values
- gold (#d4a843) for accents only — not text
- Respect prefers-reduced-motion
- Ensure WCAG AA on all text (#8b83a0 minimum for secondary)

## Don'ts
- No glassmorphism
- No emoji in UI
- No box-shadows on containers
- No linear-gradient on backgrounds (except start btn)
- No font-size under 0.75rem
