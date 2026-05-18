// Stub server-only db module. Real code would import a driver from here.
// Lives under app/.server/ so the bundler keeps it off the client bundle.

type Product = { id: string; name: string };

const products = new Map<string, Product>([
  ["a-1", { id: "a-1", name: "Alpha" }],
  ["b-2", { id: "b-2", name: "Beta" }],
]);

export async function getProduct(id: string): Promise<Product | null> {
  return products.get(id) ?? null;
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
  const existing = products.get(id);
  if (!existing) throw new Response("Not Found", { status: 404 });
  const updated = { ...existing, ...patch };
  products.set(id, updated);
  return updated;
}
