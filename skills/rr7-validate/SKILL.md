---
name: rr7-validate
description: Validate a React Router 7 Framework Mode project. Runs tests/validation/validate-plugin.sh to check plugin structure, then react-router typegen + tsc for end-to-end type safety, then a grep audit for the most common Remix v2 / RR v6 leftovers (@remix-run/*, json(), defer(), useLoaderData<typeof, BrowserRouter, react-router-dom, LoaderFunctionArgs, RemixServer, vitePlugin as remix, lucia, hardcoded SESSION_SECRET, VITE_*SECRET).
---

# rr7-validate

End-to-end validation of an RR7 Framework Mode codebase.

## When to use

User asks: "validate this RR7 project", "audit our React Router setup", "check for Remix leftovers", "is this v7-clean".

## Steps

### 1. Plugin structure

```bash
bash tests/validation/validate-plugin.sh
```

Checks: plugin.json, rules/*.mdc frontmatter, skills/*/SKILL.md frontmatter, agents/*.md frontmatter, fixture cleanliness, em-dash and emoji audit.

### 2. Typegen + typecheck

```bash
pnpm react-router typegen
pnpm exec tsc --noEmit
```

A clean type-check confirms every `Route` namespace import resolves, every loader/action signature is typed, and every Component receives correctly-typed `loaderData`.

### 3. Grep audit

```bash
# CRIT / ERR patterns (must NOT appear in app/)
grep -rEn '@remix-run/'                     app/ && echo "FAIL: @remix-run/* still imported"
grep -rEn 'useLoaderData<typeof'            app/ && echo "FAIL: useLoaderData<typeof loader>"
grep -rEn '\bjson\(|\bdefer\('              app/ && echo "FAIL: json()/defer() removed in v7"
grep -rEn 'RemixServer|RemixBrowser'        app/ && echo "FAIL: rename to ServerRouter/HydratedRouter"
grep -rEn 'BrowserRouter|<Routes>'          app/ && echo "FAIL: JSX routing in Framework Mode"
grep -rEn 'react-router-dom'                app/ package.json && echo "FAIL: drop react-router-dom"
grep -rEn '\bLoaderFunction\b|\bActionFunction\b|\bLoaderFunctionArgs\b' app/ && echo "FAIL: use Route namespace"
grep -rEn 'vitePlugin as remix'             vite.config.* && echo "FAIL: use reactRouter() from @react-router/dev/vite"
grep -rEn "from 'lucia'|from \"lucia\""     app/ && echo "FAIL: lucia deprecated"
grep -rEn 'import\.meta\.env\.VITE_[A-Z_]*SECRET' app/ && echo "CRIT: secret in VITE_* env var"
grep -rEn 'process\.env\.SESSION_SECRET!'   app/ && echo "CRIT: non-null assertion on SESSION_SECRET, validate with Zod"
grep -rEn 'throw new Error\(.*Not Found'    app/ && echo "FAIL: throw data({...}, { status: 404 })"
[ -f remix.config.js ] && echo "FAIL: delete remix.config.js"
[ -f app/routes/index.tsx ] && echo "FAIL: rename to _index.tsx"
```

### 4. Required files

```bash
[ -f react-router.config.ts ] || echo "FAIL: missing react-router.config.ts"
[ -f app/root.tsx ]            || echo "FAIL: missing app/root.tsx"
grep -q '<Meta'              app/root.tsx || echo "FAIL: root.tsx missing <Meta>"
grep -q '<Links'             app/root.tsx || echo "FAIL: root.tsx missing <Links>"
grep -q '<Scripts'           app/root.tsx || echo "FAIL: root.tsx missing <Scripts>"
grep -q '<ScrollRestoration' app/root.tsx || echo "FAIL: root.tsx missing <ScrollRestoration>"
```

### 5. Cookie security

```bash
grep -rEn 'createCookieSessionStorage' app/ -A 12 | grep -q 'httpOnly: true'              || echo "CRIT: cookie missing httpOnly"
grep -rEn 'createCookieSessionStorage' app/ -A 12 | grep -q 'sameSite:'                   || echo "CRIT: cookie missing sameSite"
grep -rEn 'createCookieSessionStorage' app/ -A 12 | grep -q 'secrets: \['                 || echo "CRIT: cookie missing secrets"
```

## Report

Group findings by severity (CRIT, ERR, WARN, NIT), map each to its anti-pattern number from `rules/react-router-anti-patterns.mdc`, and include the file path + line.
