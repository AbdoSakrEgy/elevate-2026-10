import type { FastifyReply, FastifyRequest } from "fastify";
import type { CommentService } from "./comment.service";

interface CreateCommentBody {
  authorId: number;
  content: string;
}

export class CommentController {
  constructor(private readonly service: CommentService) {}

  async listByPost(request: FastifyRequest<{ Params: { postId: string } }>, _reply: FastifyReply) {
    return this.service.listByPost(Number(request.params.postId));
  }

  async create(
    request: FastifyRequest<{ Params: { postId: string }; Body: CreateCommentBody }>,
    reply: FastifyReply,
  ) {
    const comment = await this.service.create({
      postId: Number(request.params.postId),
      ...request.body,
    });
    return reply.code(201).send(comment);
  }

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.remove(Number(request.params.id));
    return reply.code(204).send();
  }
}
