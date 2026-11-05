import "dotenv/config";
import { buildApp } from "./app";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const app = buildApp();

app
  .listen({ port, host })
  .then(() => {
    app.log.info(`Monolith listening on http://${host}:${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
