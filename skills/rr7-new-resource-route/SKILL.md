---
name: rr7-new-resource-route
description: Scaffold a no-default-export resource route under app/routes/api/<name>.ts that returns a raw Response (Response.json, text, RSS, sitemap, image, etc.) with Content-Type and Cache-Control headers. Resource routes must not export a default React component; doing so makes the framework treat the file as a UI route and the loader response is discarded. Registers the route under the api prefix in app/routes.ts.
---

# rr7-new-resource-route

Scaffolds a raw-Response resource route.

## When to use

User asks: "add an API endpoint", "expose a JSON API", "make a sitemap route", "create a webhook handler", "RSS feed", "/api/<name>".

## Inputs

- `path` (URL, e.g. `api/health`, `sitemap.xml`)
- `file` (file under `app/routes/`, e.g. `api/health.ts`)
- HTTP methods served (GET via `loader`, POST/PUT/DELETE via `action`)

## Output template

```ts
// app/routes/api/health.ts
// The +types/ folder is always a sibling of the route file. For a route at
// app/routes/api/health.ts the import path is "./+types/health" (NOT the URL).
import type { Route } from "./+types/health";

export async function loader(_args: Route.LoaderArgs) {
  return Response.json(
    { status: "ok", timestamp: new Date().toISOString() },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
  }
  const body = await request.json();
  await recordEvent(body);
  return new Response(null, { status: 204 });
}
```

Register in `app/routes.ts`:

```ts
import { type RouteConfig, route, prefix } from "@react-router/dev/routes";
export default [
  // existing...
  ...prefix("api", [
    route("health", "routes/api/health.ts"),
  ]),
] satisfies RouteConfig;
```

## Mandatory

- No `export default`. Resource routes must not export a default React component.
- Set `Content-Type` explicitly.
- Set `Cache-Control` (use `no-store` for dynamic, a max-age for cacheable).
- Use the file extension `.ts` (no JSX).

## Refuse

- `export default function Foo() { return null; }` to "satisfy" the type. The route becomes a UI route and the loader response is discarded.
- Returning `json({...})`. Removed in v7. Use `Response.json(value, init)` or `data(value, init)`.
- Forgetting `Content-Type`. Browsers may sniff and misinterpret.

## After scaffolding

1. `curl -i http://localhost:5173/api/health` and inspect headers
2. `pnpm typecheck`
