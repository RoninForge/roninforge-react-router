// ANTI-PATTERN: no .server suffix. Bundler may ship to client.
// The connection string may end up in the client bundle.
export const db = {
  url: process.env.DATABASE_URL,
  find: async (id: string) => ({ id, name: "stub" }),
};
