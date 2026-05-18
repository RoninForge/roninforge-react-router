import type { Route } from "./+types/health";

export async function loader(_args: Route.LoaderArgs) {
  return Response.json(
    { status: "ok", timestamp: new Date().toISOString() },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
