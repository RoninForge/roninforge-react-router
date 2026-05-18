import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Home" },
    { name: "description", content: "RR7 correct sample home" },
  ];
}

export async function loader(_args: Route.LoaderArgs) {
  return {
    greeting: "Welcome",
    featured: [
      { id: "a-1", name: "Alpha" },
      { id: "b-2", name: "Beta" },
    ],
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{loaderData.greeting}</h1>
      <ul>
        {loaderData.featured.map((item) => (
          <li key={item.id}>
            <Link to={`/products/${item.id}`} prefetch="intent">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <p>
        <Link to="/about" prefetch="intent">
          About
        </Link>
      </p>
    </main>
  );
}
