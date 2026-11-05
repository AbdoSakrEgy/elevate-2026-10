import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserService } from "./user.service";
import type { CreateUserInput, UpdateUserInput } from "./user.entity";

/**
 * HTTP adapter. Parses request input, delegates to the service, and shapes the
 * HTTP response. No business logic and no database access here.
 */
export class UserController {
  constructor(private readonly service: UserService) {}

  async list(_request: FastifyRequest, _reply: FastifyReply) {
    return this.service.list();
  }

  async get(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    return this.service.get(Number(request.params.id));
  }

  async create(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    const user = await this.service.create(request.body);
    return reply.code(201).send(user);
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserInput }>,
    _reply: FastifyReply,
  ) {
    return this.service.update(Number(request.params.id), request.body);
  }

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.remove(Number(request.params.id));
    return reply.code(204).send();
  }
}
