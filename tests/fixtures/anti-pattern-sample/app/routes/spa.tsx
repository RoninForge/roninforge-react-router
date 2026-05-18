// ANTI-PATTERN #11: declarative JSX routing inside a Framework Mode app.
// BrowserRouter + Routes never mount when app/routes.ts is in charge.
//
// ANTI-PATTERN #21: server `loader` on a non-root route under `ssr: false`.
// In SPA Mode only the root route may export a server loader; every other
// route must use `clientLoader`. The build fails at config validation.
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(_args: LoaderFunctionArgs) {
  return { mode: "spa-non-root" };
}

function Home() {
  return <p>SPA Home</p>;
}
function Other() {
  return <p>Other</p>;
}

export default function Spa() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/other" element={<Other />} />
      </Routes>
    </BrowserRouter>
  );
}
