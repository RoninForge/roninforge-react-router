// ANTI-PATTERN: route returns json() AND has a default component using <form method="post">,
// useNavigate inside useEffect for an auth redirect, and reads VITE_*_SECRET in a loader.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { json, type LoaderFunctionArgs, type ActionFunction, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  // CRIT: secret in a VITE_* env var leaks to client bundle.
  const key = import.meta.env.VITE_STRIPE_SECRET_KEY;
  return json({ key, items: [{ id: 1 }, { id: 2 }] });
}

// AP #15 symmetric: ActionFunctionArgs is the generic args type instead of
// the per-route Route.ActionArgs.
export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
  return json({ saved: true });
};

export default function Items() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // ANTI-PATTERN: client-side auth redirect via useEffect.
  useEffect(() => {
    if (!data.key) navigate("/login");
  }, [data.key, navigate]);

  return (
    <div>
      {/* ANTI-PATTERN: plain <form> instead of <Form>; no method. */}
      <form action="/items">
        <input name="q" />
        <button type="submit">Search</button>
      </form>
      <ul>
        {data.items.map((i) => (
          <li key={i.id}>{i.id}</li>
        ))}
      </ul>
    </div>
  );
}
