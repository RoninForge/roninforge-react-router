import { Link } from "react-router";
import type { Route } from "./+types/not-found";

export function meta(_args: Route.MetaArgs) {
  return [{ title: "Not Found" }];
}

export async function loader(_args: Route.LoaderArgs) {
  throw new Response("Not Found", { status: 404 });
}

export default function NotFound(_props: Route.ComponentProps) {
  return (
    <main className="p-8">
      <h1>404</h1>
      <p>That page does not exist.</p>
      <Link to="/" prefetch="intent">
        Home
      </Link>
    </main>
  );
}
