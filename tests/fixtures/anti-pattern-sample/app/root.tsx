// ANTI-PATTERN: missing Scripts and ScrollRestoration; uses @remix-run/react.
import { Outlet, Meta, Links } from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
}
