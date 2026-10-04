# Hackathon Finder — frontend

Vite + React + TypeScript + Tailwind CSS + React Router + Framer Motion + Lucide.
Frontend only: all data and auth are mocked so you can plug in your FastAPI backend later.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

## Where to connect your backend

Everything that would talk to a server lives in **`src/services/api.ts`**. Every function is async and
typed, so replacing the body with a `fetch(...)` call does not require touching pages or components.

| Mock                       | Location                       | Replace with        |
| -------------------------- | ------------------------------ | ------------------- |
| `hackathonApi.search`      | `src/services/api.ts`          | your search API     |
| `hackathonApi.getById`     | `src/services/api.ts`          | your details API    |
| `hackathonApi.list/getByIds` | `src/services/api.ts`        | list APIs           |
| `savedApi.*`               | `src/services/api.ts`          | saved-items API     |
| `authApi.login/register/logout/getSession/loginWithProvider` | `src/services/api.ts` | your auth |
| Mock hackathon data        | `src/data/hackathons.ts`       | delete when done    |

Search, filtering and sorting logic for the mock is in `src/utils/search.ts` (your backend will do this server-side).
No endpoints were invented; every mock is marked `TODO(backend)`.

The `Hackathon` and `User` shapes are in `src/types/index.ts`. Adjust them to match your API response.

## Demo helpers

- Any valid email + any password logs in. Password `wrongpass` shows the login error state.
- In the browser console, `window.__HF_FAIL__ = true` makes mock fetches fail so you can see the error UI.
  Set it back to `false` and press "Try again".
- Landing page stats (`WhySection.tsx`) and the profile "Completed" count are placeholders.

## Structure

```
src/
  animations/   shared Framer Motion variants
  components/   ui/ (buttons, badges, states, skeletons), layout/, hackathon/, home/, auth/
  context/      Auth, Saved (localStorage) and Toast providers
  data/         mock hackathons + categories
  hooks/        useAsync, useScrolled, useLockBody, useEscape
  layouts/      RootLayout (navbar, page transitions, ⌘/Ctrl K palette)
  pages/        one file per route
  services/     mock API layer  <-- swap for FastAPI here
  types/        Hackathon, User, Filters, Category
  utils/        dates, formatting, search
```

## Motion and accessibility

- `<MotionConfig reducedMotion="user">` in `App.tsx` plus a CSS `prefers-reduced-motion` block in `index.css`.
- Skip link, visible focus rings, semantic landmarks, labelled controls, `aria-live` toasts and result counts.
