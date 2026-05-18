---
name: rr7-migrate-from-remix
description: Stage-by-stage migration of a Remix v2 (or React Router v6) project to React Router 7 Framework Mode. Runs the official codemod (npx codemod remix/2/react-router/upgrade), then rewrites package.json, scripts, vite.config.ts, react-router.config.ts, entry.server, entry.client, all imports from @remix-run/* to react-router, replaces json()/defer() with plain returns + data(), swaps LoaderFunctionArgs for Route.LoaderArgs, replaces useLoaderData<typeof loader>() with Route.ComponentProps, and points at the remaining manual diffs.
---

# rr7-migrate-from-remix

Migrates an existing Remix v2 or React Router v6 project to React Router 7.15+ Framework Mode.

## When to use

User says: "migrate from Remix", "upgrade Remix v2 to React Router 7", "we are on @remix-run/* and want to move", "react-router-dom v6 to v7".

## Stage 0: dry run the codemod

```bash
npx codemod remix/2/react-router/upgrade
git diff --stat
```

The codemod handles the bulk of the imports, the config file rename, and the script swaps. Review the diff before continuing.

## Stage 1: package.json

```diff
- "@remix-run/react": "^2.17.4",
- "@remix-run/node": "^2.17.4",
- "@remix-run/dev": "^2.17.4",
- "@remix-run/serve": "^2.17.4",
- "react-router-dom": "^6.30.0",
+ "react-router": "^7.15.1",
+ "@react-router/node": "^7.15.1",
+ "@react-router/dev": "^7.15.1",
+ "@react-router/serve": "^7.15.1",

  "scripts": {
-   "dev": "remix vite:dev",
-   "build": "remix vite:build",
-   "start": "remix-serve ./build/server/index.js",
+   "dev": "react-router dev",
+   "build": "react-router build",
+   "start": "react-router-serve ./build/server/index.js",
+   "typecheck": "react-router typegen && tsc"
  }
```

`pnpm install`.

## Stage 2: config files

Delete `remix.config.js`. Create:

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";
export default { ssr: true } satisfies Config;
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
});
```

## Stage 3: entry files

```diff
// app/entry.server.tsx
- import { RemixServer } from "@remix-run/react";
+ import { ServerRouter } from "react-router";
- <RemixServer context={remixContext} url={request.url} />
+ <ServerRouter context={remixContext} url={request.url} />

// app/entry.client.tsx
- import { RemixBrowser } from "@remix-run/react";
+ import { HydratedRouter } from "react-router/dom";
- hydrateRoot(document, <RemixBrowser />);
+ hydrateRoot(document, <HydratedRouter />);
```

## Stage 4: root.tsx

Ensure `<Meta>`, `<Links>`, `<Scripts>`, `<ScrollRestoration>` from `react-router` are present in the Layout export.

## Stage 5: route modules

For each `app/routes/**/*.tsx`:

```diff
- import type { LoaderFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
- import { json, defer, useLoaderData } from "@remix-run/react";
+ import type { Route } from "./+types/<file>";
+ import { data } from "react-router";

- export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
-   return json({ user: await getUser(request) });
- };
+ export async function loader({ request }: Route.LoaderArgs) {
+   return { user: await getUser(request) };
+ }

- export default function Page() {
-   const data = useLoaderData<typeof loader>();
-   return <div>{data.user.name}</div>;
- }
+ export default function Page({ loaderData }: Route.ComponentProps) {
+   return <div>{loaderData.user.name}</div>;
+ }
```

`throw new Error("Not Found")` becomes `throw data({ message: "Not Found" }, { status: 404 })`.

## Stage 6: tsconfig

```diff
  "include": [
    "**/*.ts",
    "**/*.tsx",
+   ".react-router/types/**/*"
  ],
  "compilerOptions": {
+   "rootDirs": [".", "./.react-router/types"],
  }
```

Add `.react-router/` to `.gitignore`.

## Stage 7: verify

```bash
pnpm react-router typegen
pnpm typecheck
pnpm build
pnpm dev
```

Visit every route. Submit every form. Check the network tab for `_data` queries (Single Fetch is automatic; no extra wiring).

## Stage 8: optional cleanup

- Replace `unstable_useViewTransitionState` with `useViewTransitionState`.
- Replace `useFetcher()` in lists with `useFetcher({ key })`.
- Add `prefetch="intent"` to primary nav links.
- Replace any remaining `useTransition` (imported from `react-router`) with `useNavigation`.

## Refuse

- Half-migration that leaves `@remix-run/*` and `react-router` side-by-side. The Vite plugin will not pick up both plugins; routes from the wrong package never mount.
- Skipping the typegen step in CI. `Route` namespace types resolve to `any` and the migration breaks silently.

Source: https://reactrouter.com/upgrading/remix
