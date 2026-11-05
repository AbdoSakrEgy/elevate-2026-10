import { NotFoundError } from "../../lib/http-error";
import type { PostRepository } from "./post.repository";
import type { UserRepository } from "../users/user.repository";
import type { CommentRepository } from "../comments/comment.repository";
import type { CreatePostInput, Post, PostWithDetails, UpdatePostInput } from "./post.entity";

/**
 * PostService orchestrates across repositories. In the monolith this stays
 * in-process and synchronous against a shared database — the same result a
 * microservices gateway has to build with several HTTP round-trips.
 */
export class PostService {
  constructor(
    private readonly posts: PostRepository,
    private readonly users: UserRepository,
    private readonly comments: CommentRepository,
  ) {}

  async list(): Promise<Post[]> {
    return this.posts.findAll();
  }

  async get(id: number): Promise<PostWithDetails> {
    const post = await this.posts.findByIdWithAuthor(id);
    if (!post) throw new NotFoundError(`Post ${id} not found`);
    const comments = await this.comments.findByPostIdWithAuthor(id);
    return { ...post, comments };
  }

  async create(input: CreatePostInput): Promise<Post> {
    // The monolith CAN validate referential integrity right here, because the
    // user table is in the same database.
    const author = await this.users.findById(input.authorId);
    if (!author) throw new NotFoundError(`Author (user ${input.authorId}) not found`);
    return this.posts.create(input);
  }

  async update(id: number, input: UpdatePostInput): Promise<Post> {
    const updated = await this.posts.update(id, input);
    if (!updated) throw new NotFoundError(`Post ${id} not found`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const ok = await this.posts.remove(id);
    if (!ok) throw new NotFoundError(`Post ${id} not found`);
  }
}
