import { asc, eq } from "drizzle-orm";
import { comments, users } from "../../db/schema";
import type { Database } from "../../db";
import type { Comment, CommentWithAuthor, CreateCommentInput } from "./comment.entity";

export class CommentRepository {
  constructor(private readonly db: Database) {}

  async findByPostId(postId: number): Promise<Comment[]> {
    return this.db.select().from(comments).where(eq(comments.postId, postId)).orderBy(asc(comments.id));
  }

  /** Shared DB -> one JOIN to attach each comment's author. */
  async findByPostIdWithAuthor(postId: number): Promise<CommentWithAuthor[]> {
    const rows = await this.db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.id));
    return rows.map((row) => ({ ...row.comments, author: row.users }));
  }

  async findById(id: number): Promise<Comment | undefined> {
    const rows = await this.db.select().from(comments).where(eq(comments.id, id)).limit(1);
    return rows[0];
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    const rows = await this.db
      .insert(comments)
      .values({ ...input, createdAt: new Date().toISOString() })
      .returning();
    return rows[0];
  }

  async remove(id: number): Promise<boolean> {
    const rows = await this.db.delete(comments).where(eq(comments.id, id)).returning();
    return rows.length > 0;
  }
}
