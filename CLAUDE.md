@AGENTS.md

# Londri — Project Rules

## Routing
- Next.js App Router only — no Pages Router patterns
- Route groups: `(auth)` for unauthenticated screens, `(dashboard)` for post-login screens

## TypeScript
- Strict mode — no implicit `any`, no type assertions (`as X`) without a comment explaining why
- All shared types live in `src/types/index.ts`

## Components
- shadcn/ui components only — never build a component that shadcn already has
- Lucide React for all icons — no other icon libraries
- One component per file
- Component filenames are PascalCase

## Styling
- Tailwind only — no inline styles, no CSS modules
- All colors via CSS variables — never hardcode hex or raw color values
- Dark mode via the `.dark` class variant

## State
- Zustand for UI/client-only state (wizard steps, local toggles) — store is in `lib/mock/store.ts`
- Redux Toolkit (RTK Query) for server/API state — root API slice in `redux/apiManager.ts`, one domain file per feature in `redux/api/`
- Mock data lives in `lib/mock/` — never hardcode data inside components

## Git
- Do not commit
