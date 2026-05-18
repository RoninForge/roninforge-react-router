---
name: rr7-new-route
description: Scaffold a new React Router 7 Framework Mode route module at app/routes/<name>.tsx with loader, action, default Component, and ErrorBoundary, all typed via the per-route Route namespace from ./+types/<name>. Returns plain values from loader and action, uses data() only for status overrides, throws data() for 404. Registers the route in app/routes.ts. Refuses Remix v2 leftovers (json(), defer(), @remix-run/*, LoaderFunction, MetaFunction) and v6 leftovers (useLoaderData<typeof loader>(), useTransition, BrowserRouter).
---

# rr7-new-route

Scaffolds a canonical React Router 7 Framework Mode route module.

## When to use

User asks: "add a new route", "scaffold a route module", "create a /<path> page in this RR7 app".

## Inputs

- `path` (URL segment, e.g. `products` or `products/:pid`)
- `file` (file base name under `app/routes/`, e.g. `products.$pid`)
- Whether the route needs an `action` (default: yes for forms, no for read-only)

## Output template

```tsx
// app/routes/<file>.tsx
import { data, Form, Link, isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/<file>";
import { z } from "zod";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.title ?? "<Title>" }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  // load data here
  const item = await getItem(params.<id>);
  if (!item) throw data({ message: "Not Found" }, { status: 404 });
  return { item, title: item.name };
}

const InputSchema = z.object({ name: z.string().min(1) });

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const parsed = InputSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return data({ fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  await update(params.<id>, parsed.data);
  return { ok: true };
}

export default function <Component>({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <article>
      <h1>{loaderData.item.name}</h1>
      <Form method="post">
        <input name="name" defaultValue={loaderData.item.name} />
        {actionData && "fieldErrors" in actionData && (
          <p role="alert">{actionData.fieldErrors.name?.[0]}</p>
        )}
        <button type="submit">Save</button>
      </Form>
      <Link to="/" prefetch="intent">Back</Link>
    </article>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    const message =
      typeof error.data === "object" && error.data && "message" in error.data
        ? String((error.data as { message?: unknown }).message ?? "")
        : "";
    return <div role="alert">{error.status} {error.statusText}: {message}</div>;
  }
  return <div role="alert">Unexpected error</div>;
}
```

Also append to `app/routes.ts`:

```ts
import { type RouteConfig, route } from "@react-router/dev/routes";
export default [
  // existing routes...
  route("<path>", "routes/<file>.tsx"),
] satisfies RouteConfig;
```

## Refuse

If the user pastes any of the following, replace with the canonical equivalent and explain:

- `import { json } from "react-router"` -> `import { data }` and return plain or `data(value, init)`
- `import { defer } from "react-router"` -> return Promise property; consume via `<Await>`
- `useLoaderData<typeof loader>()` -> `Route.ComponentProps`
- `import { ... } from "@remix-run/react"` -> `from "react-router"`
- `LoaderFunction`, `LoaderFunctionArgs`, `ActionFunction`, `MetaFunction` -> `Route.LoaderArgs`, `Route.ActionArgs`, `Route.MetaArgs`
- `throw new Error("Not Found")` -> `throw data({ message: "Not Found" }, { status: 404 })`
- `<form method="post">` -> `<Form method="post">`

## After scaffolding

1. `pnpm react-router typegen` to materialize `Route` types
2. `pnpm typecheck`
3. Visit the URL; verify SSR HTML contains expected content
