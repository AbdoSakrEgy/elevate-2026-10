import Fastify from "fastify";
import type { FastifyError } from "fastify";
import { createDb } from "./db";
import { HttpError } from "./lib/http-error";

// Users
import { UserRepository } from "./modules/users/user.repository";
import { UserService } from "./modules/users/user.service";
import { UserController } from "./modules/users/user.controller";
import { registerUserRoutes } from "./modules/users/user.routes";

// Posts
import { PostRepository } from "./modules/posts/post.repository";
import { PostService } from "./modules/posts/post.service";
import { PostController } from "./modules/posts/post.controller";
import { registerPostRoutes } from "./modules/posts/post.routes";

// Comments
import { CommentRepository } from "./modules/comments/comment.repository";
import { CommentService } from "./modules/comments/comment.service";
import { CommentController } from "./modules/comments/comment.controller";
import { registerCommentRoutes } from "./modules/comments/comment.routes";

/**
 * Composition root. This is the ONLY place where concrete classes are wired
 * together (dependency injection). The dependency direction is strict:
 *
 *   controller -> service -> repository -> db
 */
export function buildApp() {
  const app = Fastify({ logger: true });

  // Infrastructure
  const db = createDb();

  // Repositories (data access)
  const userRepository = new UserRepository(db);
  const postRepository = new PostRepository(db);
  const commentRepository = new CommentRepository(db);

  // Services (business logic)
  const userService = new UserService(userRepository);
  const postService = new PostService(
    postRepository,
    userRepository,
    commentRepository,
  );
  const commentService = new CommentService(
    commentRepository,
    postRepository,
    userRepository,
  );

  // Controllers (HTTP)
  const userController = new UserController(userService);
  const postController = new PostController(postService);
  const commentController = new CommentController(commentService);

  // Routes
  registerUserRoutes(app, userController);
  registerPostRoutes(app, postController);
  registerCommentRoutes(app, commentController);

  app.get("/health", async () => ({ ok: true }));

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    if (error.validation) {
      return reply
        .status(400)
        .send({ error: "Validation failed", details: error.validation });
    }
    request.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  });

  return app;
}
