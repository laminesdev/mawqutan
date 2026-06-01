# Contributing to مَوْقُوتًا / Mawqūtan

First off, thanks for considering contributing. This project started as a personal tool and grew into something others might find useful.

## Code of Conduct

Be respectful. This is a small project maintained by one person — treat it and its users the way you'd want to be treated.

## How to contribute

### 🐛 Bugs

Open an issue with:
- What happened
- What you expected to happen
- Your OS / how you're running the app (dev, built, packaged)
- Screenshot if visual

### 💡 Feature requests

Open an issue with the `enhancement` label. Explain:
- What you want
- Why it fits the project philosophy (one thing, well)
- Mockup or reference if UI-related

### 🛠️ Code changes

1. **Fork** the repo
2. **Branch** from `main` (`git checkout -b feature/your-thing`)
3. **Follow the conventions:**
   - TypeScript strict mode — no `any` unless unavoidable
   - Tailwind CSS utility classes — no raw CSS for layout/styling
   - Arabic comments for UI/visible text logic
   - English comments for technical logic
   - One concept per commit (not "fix stuff")
4. **Build** before pushing: `npm run build`
5. **Open a PR** with a clear title and description of what changed and why

### 📝 Adding cities

Open `src/screens/RegionSelect.tsx` and add your city to the `CITIES` array:

```ts
{ name: 'اسم المدينة (English)', lat: 00.0000, lng: 00.0000 },
```

Make sure the coordinates are accurate (check timeanddate.com or similar).

## Project philosophy

- **One thing, well.** This app shows prayer times and runs a timer. That's it.
- **No ads, no tracking, no accounts.**
- **Desktop-first.** Electron + native APIs. No web wrappers.
- **Design matters.** The dark theme, gold accent, and animations weren't accidental.
- **Accessibility isn't optional.** Add `aria-*` attributes with new UI elements.

## Architecture notes

- Each screen is a separate chunk (code-split via `React.lazy`)
- State lives in Zustand (persisted to localStorage for region)
- Prayer times recalculate every 60s (midnight boundary)
- Timer checks every 2s for 5-min window
- Electron main process has OS notifications + adhan audio
- All IPC is type-safe through `electron/ipc-channels.ts`

## Questions?

Open a discussion or DM [@laminesdev](https://github.com/laminesdev).
