// ANTI-PATTERN: Next.js bracket convention. RR7 needs $id (products.$id.tsx).
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  // ANTI-PATTERN: throwing a plain Error instead of a Response.
  if (!params.id) throw new Error("Not Found");
  return json({ id: params.id });
}

export default function Product() {
  const data = useLoaderData<typeof loader>();
  return <p>{data.id}</p>;
}
