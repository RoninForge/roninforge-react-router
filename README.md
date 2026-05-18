# roninforge-react-router

Cursor plugin for **React Router 7 Framework Mode** (formerly Remix). 45 anti-patterns, 10 rules, 5 skills, a reviewer agent, two fixtures, and a structural validator.

Targets `react-router@^7.15.1` (released 2026-05-14). Framework Mode is the canonical default; Data Mode and Declarative Mode are documented as migration targets only.

## Why this exists

React Router v7 shipped November 2024 as the merge of Remix and React Router. The package surface changed (`@remix-run/*` to `react-router` + `@react-router/*`), the helpers changed (`json()` and `defer()` removed), the type system changed (per-route `Route` namespace via `react-router typegen`), and the entry components changed (`RemixServer` to `ServerRouter`, `RemixBrowser` to `HydratedRouter`).

LLMs trained on pre-Nov-2024 data still produce Remix v2 and React Router v6 idioms when targeting a v7 project. This plugin encodes the 45 most common breakages, the canonical fixes, and a validator that fails the build when leftovers slip in.

## Quick install

```bash
git clone https://github.com/RoninForge/roninforge-react-router.git

# -n preserves any existing rule of the same name.
cp -rn roninforge-react-router/rules/*  your-project/.cursor/rules/
cp -rn roninforge-react-router/skills/* your-project/.cursor/skills/
cp -rn roninforge-react-router/agents/* your-project/.cursor/agents/
```

Or vendor the whole repo as a git submodule under `your-project/.cursor/plugins/`.

Restart Cursor; the rules attach to `app/**/*.{ts,tsx}`, `react-router.config.{ts,js}`, `vite.config.{ts,js}`, `routes.ts`, and `package.json`.

## What is inside

### Rules

| File                                              | Scope                                      |
|---------------------------------------------------|--------------------------------------------|
| `rules/react-router-anti-patterns.mdc`            | Centerpiece. All 45 anti-patterns.         |
| `rules/react-router-route-modules.mdc`            | Canonical route module shape (9 exports). |
| `rules/react-router-type-safety.mdc`              | typegen, tsconfig, Route namespace.        |
| `rules/react-router-routing-config.mdc`           | `app/routes.ts` and `flatRoutes()`.        |
| `rules/react-router-data-flow.mdc`                | plain returns, `data()`, `redirect()`.    |
| `rules/react-router-client-data.mdc`              | `clientLoader`, `HydrateFallback`, SPA.    |
| `rules/react-router-forms.mdc`                    | `<Form>`, `<fetcher.Form>`, `useFormAction`. |
| `rules/react-router-sessions-and-env.mdc`         | Cookie security, `.server` modules, Zod env. |
| `rules/react-router-navigation-and-pending.mdc`   | `useNavigation`, `useFetcher`, view transitions. |
| `rules/react-router-migration-from-remix.mdc`     | Stage-by-stage Remix v2 to RR7 migration. |

### Skills

| Skill                          | Purpose                                                          |
|--------------------------------|------------------------------------------------------------------|
| `rr7-new-route`                | Scaffold a typed route module with loader/action/Component.      |
| `rr7-new-resource-route`       | Scaffold a no-default-export JSON/RSS/sitemap endpoint.          |
| `rr7-new-action-form`          | Scaffold a `<Form method="post">` + Zod-validated action.        |
| `rr7-migrate-from-remix`       | Stage-by-stage Remix v2 to RR7 migration.                        |
| `rr7-validate`                 | Run validator + typegen + tsc + grep audit.                     |

### Agent

`agents/rr7-reviewer.md` reviews a codebase against all 45 anti-patterns, grouped by file type, with output template.

## Anti-pattern summary

| Severity | Count | Examples                                                                 |
|----------|-------|--------------------------------------------------------------------------|
| CRIT     | 4     | VITE_*SECRET leak, server module in client, hardcoded SESSION_SECRET, insecure cookie |
| ERR      | 23    | `@remix-run/*`, `json()`/`defer()`, `RemixServer`, `LoaderFunctionArgs`, `useLoaderData<typeof loader>`, `unstable_useViewTransitionState` |
| WARN     | 16    | `<form>` for mutations, `useFetcher` no key, `useBlocker` no reset, sequential awaits |
| NIT      | 2     | no `useFormAction`, `tsc` not in CI                                      |
| **Total**| **45**|                                                                          |

## Pinned versions

| Package                | Version    |
|------------------------|------------|
| react-router           | ^7.15.1    |
| @react-router/node     | ^7.15.1    |
| @react-router/serve    | ^7.15.1    |
| @react-router/dev      | ^7.15.1    |
| @react-router/fs-routes| ^7.15.1    |
| react                  | ^19.2.6    |
| react-dom              | ^19.2.6    |
| vite                   | ^8.0.13    |
| tailwindcss            | ^4.3.0     |
| typescript             | ^6.0.3     |
| zod                    | ^4.4.3     |
| node                   | >=20.19.0  |

## Validator

```bash
bash tests/validation/validate-plugin.sh
```

Checks:

1. `plugin.json` valid JSON, name matches.
2. Every rule has frontmatter with `description` and `globs`.
3. Every skill has frontmatter with `name` (matching dir) and `description`.
4. Every agent has frontmatter with `name` and `description`.
5. `correct-sample/` is free of all 18 forbidden patterns and forbidden files.
6. `anti-pattern-sample/` contains every marker (negative test for the reviewer).
7. `correct-sample/package.json` pins `react-router ^7.15` and `node >=20.19`.
8. `correct-sample/app/root.tsx` contains `<Meta>`, `<Links>`, `<Scripts>`, `<ScrollRestoration>`.
9. No em dashes in any rule, skill, agent, or README.
10. No emojis in any rule, skill, agent, or README.

Exit 0 prints `ALL CHECKS PASSED`.

## Links

- React Router v7 docs: https://reactrouter.com
- Framework Mode quickstart: https://reactrouter.com/start/framework/installation
- Upgrading from Remix v2: https://reactrouter.com/upgrading/remix
- Upgrading from React Router v6: https://reactrouter.com/upgrading/v6
- Type safety explanation: https://reactrouter.com/explanation/type-safety
- File-name conventions: https://api.reactrouter.com/v7/functions/_react_router_fs_routes.flatRoutes.html
- Codemod: https://codemod.com/registry/remix-2-react-router-upgrade

## License

MIT. See [LICENSE](LICENSE).
