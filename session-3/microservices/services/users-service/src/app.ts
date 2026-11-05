import Fastify from "fastify";
import type { FastifyError } from "fastify";
import { createDb } from "./db";
import { HttpError } from "./lib/http-error";
import { UserRepository } from "./users/user.repository";
import { UserService } from "./users/user.service";
import { UserController } from "./users/user.controller";
import { registerUserRoutes } from "./users/user.routes";

export function buildApp() {
  const app = Fastify({ logger: true });

  const db = createDb();
  const repository = new UserRepository(db);
  const service = new UserService(repository);
  const controller = new UserController(service);

  registerUserRoutes(app, controller);

  app.get("/health", async () => ({ ok: true }));

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    if (error.validation) {
      return reply.status(400).send({ error: "Validation failed", details: error.validation });
    }
    request.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  });

  return app;
}
