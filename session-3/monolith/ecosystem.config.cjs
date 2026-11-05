// pm2 process definition for the built monolith.
//
// Usage (from this directory):
//   pnpm build
//   pm2 start ecosystem.config.cjs
//
// `cwd` is set explicitly so that `dotenv` finds `.env` and the SQLite file
// (`file:local.db`) resolves relative to the project root, not `dist/`.
module.exports = {
  apps: [
    {
      name: "social-monolith",
      script: "dist/server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
    },
  ],
};
