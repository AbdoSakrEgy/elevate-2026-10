import type { FastifyInstance } from "fastify";
import type { UserController } from "./user.controller";

const createUserSchema = {
  type: "object",
  required: ["username", "email", "fullName"],
  additionalProperties: false,
  properties: {
    username: { type: "string", minLength: 2 },
    email: { type: "string", format: "email" },
    fullName: { type: "string", minLength: 1 },
  },
} as const;

const updateUserSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    username: { type: "string", minLength: 2 },
    email: { type: "string", format: "email" },
    fullName: { type: "string", minLength: 1 },
  },
} as const;

const idParamsSchema = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "integer", minimum: 1 } },
} as const;

export function registerUserRoutes(app: FastifyInstance, controller: UserController) {
  app.post("/users", { schema: { body: createUserSchema } }, controller.create.bind(controller));
  app.get("/users", controller.list.bind(controller));
  app.get("/users/:id", { schema: { params: idParamsSchema } }, controller.get.bind(controller));
  app.patch(
    "/users/:id",
    { schema: { params: idParamsSchema, body: updateUserSchema } },
    controller.update.bind(controller),
  );
  app.delete("/users/:id", { schema: { params: idParamsSchema } }, controller.remove.bind(controller));
}
