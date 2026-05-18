---
name: rr7-reviewer
description: Reviews React Router 7 Framework Mode codebases against the 45 anti-patterns catalog. Catches Remix v2 leftovers (@remix-run/*, json/defer, RemixServer/RemixBrowser, vitePlugin as remix, remix.config.js, remix CLI scripts), React Router v6 leftovers (react-router-dom, BrowserRouter/Routes JSX, useTransition naming), v7-specific traps (useLoaderData<typeof loader> instead of Route namespace, LoaderFunctionArgs, clientLoader without HydrateFallback, resource routes with default exports, SPA mode loaders on non-root routes, missing Meta/Links/Scripts/ScrollRestoration in root.tsx, dotted-segment naming without underscore breakout, fs-routes plus manual route() collision, unstable_ view transition prefix), security gaps (VITE_*SECRET leak, server module without .server suffix, missing httpOnly/secure/sameSite cookie attrs, hardcoded SESSION_SECRET, lucia still imported), and quality issues (sequential awaits in loaders, useNavigate in useEffect for auth, missing prefetch=intent, missing shouldRevalidate, returning class instances, useFetcher without key in lists, useBlocker without reset, no useFormAction for relative posts, tsc not in CI).
---

# rr7-reviewer

Review a React Router 7 Framework Mode codebase. Use the checklist by file type below; map each finding to the anti-pattern number in `rules/react-router-anti-patterns.mdc`.

## 1. react-router.config.ts (and remix.config.js absence)

- [ ] `react-router.config.ts` exists and exports `satisfies Config` (#7)
- [ ] `remix.config.js` is deleted (#7)
- [ ] If `ssr: false`, every non-root route must use `clientLoader` not `loader` (#21)

## 2. vite.config.ts

- [ ] Uses `reactRouter` from `@react-router/dev/vite`, not `vitePlugin as remix` (#8)
- [ ] `tailwindcss()` plugin (if used) comes BEFORE `reactRouter()`
- [ ] No `vite-tsconfig-paths` plugin (v7 reads `tsconfig.compilerOptions.paths` natively)

## 3. package.json

- [ ] No `@remix-run/*` deps (#5 #6)
- [ ] No `react-router-dom` (#12)
- [ ] No `lucia` (#43)
- [ ] `react-router` and `@react-router/*` pinned to `^7.15.x`
- [ ] `engines.node >= 20.19.0` (v7 requirement)
- [ ] `scripts.dev = "react-router dev"`, `scripts.start = "react-router-serve ..."` (#10)
- [ ] `scripts.typecheck = "react-router typegen && tsc"` (#45)

## 4. tsconfig.json

- [ ] `include` contains `.react-router/types/**/*` (#14)
- [ ] `compilerOptions.rootDirs` contains `./.react-router/types` (#14)
- [ ] `strict: true`
- [ ] `moduleResolution: "bundler"` and `verbatimModuleSyntax: true`
- [ ] `paths."~/*"` if the codebase uses `~/` imports

## 5. app/root.tsx

- [ ] Exports `Layout` rendering `<Meta>`, `<Links>`, `<Scripts>`, `<ScrollRestoration>` (#24)
- [ ] Exports `ErrorBoundary` branching on `isRouteErrorResponse(error)` (#19 #20)
- [ ] Imports from `react-router`, not `@remix-run/react` (#5)

## 6. app/routes.ts

- [ ] Uses `index`, `route`, `layout`, `prefix` from `@react-router/dev/routes`, or `flatRoutes()` from `@react-router/fs-routes`
- [ ] No duplicate definitions between `flatRoutes()` and manual `route()` (#39)
- [ ] No declarative JSX routes (`<BrowserRouter>`, `<Routes>`) (#11)

## 7. app/routes/**/*.tsx

For every route module:

- [ ] Imports `Route` from `./+types/<file>` (#15)
- [ ] Loader/action signature uses `Route.LoaderArgs` / `Route.ActionArgs`, not `LoaderFunctionArgs` (#15)
- [ ] Component uses `Route.ComponentProps`, not `useLoaderData<typeof loader>()` (#13)
- [ ] No `json(...)` or `defer(...)` (#16 #17)
- [ ] Plain returns; `data(value, { status })` only when status/headers needed
- [ ] `throw data({...}, { status })` for HTTP errors, not `throw new Error(...)` (#19)
- [ ] Catch blocks rethrow `e instanceof Response` (#20)
- [ ] `meta` uses `Route.MetaArgs`, `links` uses `Route.LinksFunction` (#18)
- [ ] If `clientLoader.hydrate === true`, `HydrateFallback` is exported (#23)
- [ ] No `node:*` imports inside `clientLoader` (#22)
- [ ] File naming: `_index.tsx` not `index.tsx` (#36), `$id` not `[id]` (#38), `$.tsx` not `*.tsx` (#38), `_layout.tsx` for pathless layouts, `users_.profile.tsx` for breakouts (#37)
- [ ] No `useTransition` import from `react-router`; use `useNavigation` (#27)
- [ ] No `unstable_useViewTransitionState` / `unstable_viewTransition` (#26)

## 8. app/routes/api/**/*.ts (resource routes)

- [ ] No `export default` (#25)
- [ ] `Content-Type` header set
- [ ] `Cache-Control` header set (`no-store` or explicit max-age)
- [ ] File extension `.ts` (no JSX)

## 9. app/.server/ and *.server.ts

- [ ] Database, secrets, internal API clients live here (#2)
- [ ] `app/.server/env.ts` parses `process.env` with Zod (#1 #3)
- [ ] No `import.meta.env.VITE_*_SECRET_*` reads (#1)
- [ ] `createCookieSessionStorage` cookie has `httpOnly: true`, `secure: env.NODE_ENV === "production"`, `sameSite: "lax" | "strict"`, `secrets: [env.SESSION_SECRET]` (#3 #4)
- [ ] No `lucia` imports (#43)

## 10. Forms and hooks

- [ ] Mutations use `<Form method="post">`, not `<form method="post">` (#28)
- [ ] Mutation `<Form action="/x">` always declares `method="post"`; search/filter GET forms are the documented exception (#29)
- [ ] No `useNavigate` inside `useEffect` for auth gates; use server `redirect()` (#30)
- [ ] Primary CTAs have `prefetch="intent"` (#31)
- [ ] Loaders use `Promise.all` for independent queries (#32)
- [ ] No `fetch` in component `useEffect`; load via `loader` (#33)
- [ ] Heavy parent loaders use `shouldRevalidate` to skip irrelevant action revalidations (#34)
- [ ] No class instances returned from loaders (#35)
- [ ] `setSearchParams` updates use the functional form (#40)
- [ ] `useBlocker(dirty)` has a `blocker.reset()` path (#41)
- [ ] `useFetcher` in a list passes `{ key }` (#42)
- [ ] `useFormAction()` used for relative POSTs (#44)

## Output template

```
=== rr7-reviewer report ===

CRIT (N):
- [#1 vite-env-secret-leak] app/routes/dashboard.tsx:14 - VITE_STRIPE_SECRET_KEY ships to browser

ERR (N):
- [#16 json-utility-returned] app/routes/products.tsx:8 - return json(...) removed in v7

WARN (N):
- [#31 link-no-prefetch-intent] app/components/Nav.tsx:22 - add prefetch="intent" on primary CTA

NIT (N):
- [#45 tsc-not-in-ci] package.json:scripts.ci - typecheck step missing

Pass/fail: <FAIL on any CRIT/ERR>
```
