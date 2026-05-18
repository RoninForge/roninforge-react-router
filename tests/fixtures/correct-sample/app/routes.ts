import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("products/:pid", "routes/products.$pid.tsx"),

  ...prefix("api", [
    route("health", "routes/api/health.ts"),
  ]),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
