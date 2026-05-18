// ANTI-PATTERN: file is named index.tsx; flatRoutes() needs _index.tsx for "/".
// As named, this becomes "/index" not "/".
import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  return json({ message: "hello" });
};

export default function Index() {
  // ANTI-PATTERN: useLoaderData<typeof loader>() bypasses Single Fetch typing.
  const data = useLoaderData<typeof loader>();
  return <h1>{data.message}</h1>;
}
