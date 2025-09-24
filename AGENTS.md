# Repository Guidelines

## Project Structure & Module Organization
- `src/`: application code
  - `views/`: pages (Dashboard, Projects, Reports, Settings, Login)
  - `components/`: reusable Vue components
  - `router/`: Vue Router setup and guards
  - `stores/`: Pinia stores (`user.ts`, `project.ts`, `review.ts`)
  - `api/`: Axios instance and API modules (`request.ts`, `index.ts`)
  - `assets/`, `style.css`, `main.ts`, `App.vue`
- `public/`: static files served as-is
- Tooling: `vite.config.ts`, `postcss.config.js`, `tsconfig*.json`
- See `Architecture-Overview.md` for higher-level context.

## Build, Test, and Development Commands
- `npm run dev`: start Vite dev server with HMR.
- `npm run build`: type-check via `vue-tsc` and build production bundle.
- `npm run preview`: serve the built app locally.
Notes: Node.js ≥ 18 is recommended for Vite 5.

## Coding Style & Naming Conventions
- Language: TypeScript; Vue 3 SFC with `<script setup lang="ts">`.
- Indentation: 2 spaces; avoid lines > 120 chars.
- Components: PascalCase filenames (e.g., `UserCard.vue`).
- Routes: named in PascalCase; paths in kebab-case.
- Stores: one file per domain in `src/stores` (e.g., `user.ts`).
- Styles: Tailwind CSS via PostCSS; keep component-scoped styles minimal.

## Testing Guidelines
- Test runner is not yet configured. Recommended stack: Vitest + Vue Test Utils.
- Placement: `tests/` or `__tests__/` near sources; pattern `*.spec.ts`.
- Scope: unit tests for Pinia stores and `api/`; smoke tests for key views.
- Start with ~60% coverage and raise incrementally.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- Keep commits focused; subjects in imperative mood (≤ 72 chars).
- PRs: clear description, linked issues, screenshots/GIFs for UI, steps to verify, and any risk/roll-back notes.

## Security & Configuration Tips
- Env: set `VITE_API_BASE_URL` and `VITE_API_TIMEOUT` in `.env.local`.
- Auth: Axios adds `Authorization: Bearer <token>`; on 401 it logs out and redirects to `/login`.
- GitLab: optional `PRIVATE-TOKEN` header from `localStorage['gitlab_token']`.
- Do not commit secrets; use `VITE_`-prefixed vars only (client-exposed).

