import type { Route } from "./+types/about";

export function meta(_args: Route.MetaArgs) {
  return [{ title: "About" }];
}

export async function loader(_args: Route.LoaderArgs) {
  return { tagline: "Correct RR7 sample" };
}

export default function About({ loaderData }: Route.ComponentProps) {
  return (
    <main className="p-8">
      <h1>About</h1>
      <p>{loaderData.tagline}</p>
    </main>
  );
}
