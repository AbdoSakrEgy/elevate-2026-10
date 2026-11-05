import type { FastifyInstance } from "fastify";
import type { CommentController } from "./comment.controller";

const createCommentSchema = {
  type: "object",
  required: ["authorId", "content"],
  additionalProperties: false,
  properties: {
    authorId: { type: "integer", minimum: 1 },
    content: { type: "string", minLength: 1 },
  },
} as const;

const postIdParamsSchema = {
  type: "object",
  required: ["postId"],
  properties: { postId: { type: "integer", minimum: 1 } },
} as const;

const idParamsSchema = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "integer", minimum: 1 } },
} as const;

export function registerCommentRoutes(app: FastifyInstance, controller: CommentController) {
  app.post(
    "/posts/:postId/comments",
    { schema: { params: postIdParamsSchema, body: createCommentSchema } },
    controller.create.bind(controller),
  );
  app.get(
    "/posts/:postId/comments",
    { schema: { params: postIdParamsSchema } },
    controller.listByPost.bind(controller),
  );
  app.delete("/comments/:id", { schema: { params: idParamsSchema } }, controller.remove.bind(controller));
}
