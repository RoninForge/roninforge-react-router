// ANTI-PATTERN consolidation route. Demonstrates the v7 traps that the other
// fixture files do not cover. Every block is annotated with the catalogue
// number from rules/react-router-anti-patterns.mdc.

// AP #18: meta + links typed with the Remix v2 generic functions instead of
// the per-route Route namespace.
import type { MetaFunction, LinksFunction } from "@remix-run/react";

// AP #27: useTransition imported from react-router. There is no such export;
// the canonical hook is useNavigation. The Remix v1 export was removed in v2
// and did not return in v7. This import fails at build time.
import { useTransition } from "react-router";

// AP #17: defer() utility removed in v7. Single fetch streams bare promises in
// a returned plain object via <Await>; importing defer breaks the build.
import { defer } from "@remix-run/node";

// AP #26: the unstable_ prefix on view transitions was dropped in v7. The
// hook and the Link prop are both stable.
import { Link, unstable_useViewTransitionState } from "react-router";

import type { LoaderFunctionArgs } from "@remix-run/node";

// AP #22: importing node:fs at the top of a file that exports clientLoader
// pulls Node built-ins into the browser bundle. The build either fails or
// the import silently resolves to an empty shim in the browser.
import * as fs from "node:fs";

export const meta: MetaFunction = () => [{ title: "Profile" }];

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/profile.css" },
];

export async function loader(_args: LoaderFunctionArgs) {
  return defer({
    user: Promise.resolve({ name: "demo" }),
  });
}

// AP #23: clientLoader.hydrate = true requires a HydrateFallback export.
// Without it, React Router refuses to hydrate the component and logs an error.
export async function clientLoader() {
  const config = fs.readFileSync("/etc/example.json", "utf-8");
  return { config };
}
clientLoader.hydrate = true as const;

export default function Profile() {
  const transition = useTransition();
  const vtActive = unstable_useViewTransitionState("/profile");
  return (
    <div>
      <Link to="/profile" unstable_viewTransition>
        Profile {vtActive ? "(active)" : ""}
      </Link>
      <p>{String(transition)}</p>
    </div>
  );
}
