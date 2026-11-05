import type { FastifyInstance } from "fastify";
import type { PostController } from "./post.controller";

const createPostSchema = {
  type: "object",
  required: ["authorId", "title", "content"],
  additionalProperties: false,
  properties: {
    authorId: { type: "integer", minimum: 1 },
    title: { type: "string", minLength: 1 },
    content: { type: "string", minLength: 1 },
  },
} as const;

const updatePostSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 1 },
    content: { type: "string", minLength: 1 },
  },
} as const;

const idParamsSchema = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "integer", minimum: 1 } },
} as const;

export function registerPostRoutes(app: FastifyInstance, controller: PostController) {
  app.post("/posts", { schema: { body: createPostSchema } }, controller.create.bind(controller));
  app.get("/posts", controller.list.bind(controller));
  app.get("/posts/:id", { schema: { params: idParamsSchema } }, controller.get.bind(controller));
  app.patch(
    "/posts/:id",
    { schema: { params: idParamsSchema, body: updatePostSchema } },
    controller.update.bind(controller),
  );
  app.delete("/posts/:id", { schema: { params: idParamsSchema } }, controller.remove.bind(controller));
}
