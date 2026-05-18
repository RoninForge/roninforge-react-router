import { data, Form, Link, isRouteErrorResponse, useNavigation } from "react-router";
import type { Route } from "./+types/products.$pid";
import { z } from "zod";
import { getProduct, updateProduct } from "~/.server/db";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.product.name ?? "Product" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const product = await getProduct(params.pid);
  if (!product) throw data({ message: "Product not found" }, { status: 404 });
  return { product };
}

const UpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const parsed = UpdateSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return data(
      { fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  try {
    await updateProduct(params.pid, parsed.data);
  } catch (e) {
    if (e instanceof Response) throw e;
    return data({ formError: "Update failed" }, { status: 500 });
  }
  return { ok: true };
}

export default function Product({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{loaderData.product.name}</h1>
      <Form method="post" className="mt-4 grid gap-2">
        <label>
          Name
          <input
            name="name"
            defaultValue={loaderData.product.name}
            className="border p-1"
          />
          {actionData && "fieldErrors" in actionData && actionData.fieldErrors.name && (
            <p role="alert">{actionData.fieldErrors.name[0]}</p>
          )}
        </label>
        {actionData && "formError" in actionData && actionData.formError && (
          <p role="alert">{actionData.formError}</p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </button>
      </Form>
      <p className="mt-4">
        <Link to="/" prefetch="intent">
          Back home
        </Link>
      </p>
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    const payload = error.data as { message?: string } | undefined;
    return (
      <main className="p-8">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{payload?.message ?? "Error"}</p>
      </main>
    );
  }
  return (
    <main className="p-8">
      <h1>Unexpected error</h1>
      <p>{error instanceof Error ? error.message : "Unknown"}</p>
    </main>
  );
}
