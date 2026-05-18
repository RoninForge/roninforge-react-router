import { createCookieSessionStorage } from "react-router";
import { env } from "./env";

export const sessionStorage = createCookieSessionStorage<{ userId: string }>({
  cookie: {
    name: "__session",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secrets: [env.SESSION_SECRET],
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
