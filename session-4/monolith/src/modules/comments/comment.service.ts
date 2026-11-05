import { NotFoundError } from "../../lib/http-error";
import type { CommentRepository } from "./comment.repository";
import type { PostRepository } from "../posts/post.repository";
import type { UserRepository } from "../users/user.repository";
import type { Comment, CommentWithAuthor, CreateCommentInput } from "./comment.entity";

export class CommentService {
  constructor(
    private readonly comments: CommentRepository,
    private readonly posts: PostRepository,
    private readonly users: UserRepository,
  ) {}

  async listByPost(postId: number): Promise<CommentWithAuthor[]> {
    const post = await this.posts.findById(postId);
    if (!post) throw new NotFoundError(`Post ${postId} not found`);
    return this.comments.findByPostIdWithAuthor(postId);
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    const [post, author] = await Promise.all([
      this.posts.findById(input.postId),
      this.users.findById(input.authorId),
    ]);
    if (!post) throw new NotFoundError(`Post ${input.postId} not found`);
    if (!author) throw new NotFoundError(`Author (user ${input.authorId}) not found`);
    return this.comments.create(input);
  }

  async remove(id: number): Promise<void> {
    const ok = await this.comments.remove(id);
    if (!ok) throw new NotFoundError(`Comment ${id} not found`);
  }
}
