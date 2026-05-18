// ANTI-PATTERN: remix.config.js is ignored by RR7. Should be react-router.config.ts.
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
};
