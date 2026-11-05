import Fastify from "fastify";
import type { FastifyError } from "fastify";
import { createDb } from "./db";
import { HttpError } from "./lib/http-error";
import { PostRepository } from "./posts/post.repository";
import { PostService } from "./posts/post.service";
import { PostController } from "./posts/post.controller";
import { registerPostRoutes } from "./posts/post.routes";

export function buildApp() {
  const app = Fastify({ logger: true });

  const db = createDb();
  const repository = new PostRepository(db);
  const service = new PostService(repository);
  const controller = new PostController(service);

  registerPostRoutes(app, controller);

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
