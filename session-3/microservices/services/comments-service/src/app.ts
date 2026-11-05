import Fastify from "fastify";
import type { FastifyError } from "fastify";
import { createDb } from "./db";
import { HttpError } from "./lib/http-error";
import { CommentRepository } from "./comments/comment.repository";
import { CommentService } from "./comments/comment.service";
import { CommentController } from "./comments/comment.controller";
import { registerCommentRoutes } from "./comments/comment.routes";

export function buildApp() {
  const app = Fastify({ logger: true });

  const db = createDb();
  const repository = new CommentRepository(db);
  const service = new CommentService(repository);
  const controller = new CommentController(service);

  registerCommentRoutes(app, controller);

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
