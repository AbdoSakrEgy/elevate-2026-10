import { asc, eq } from "drizzle-orm";
import { posts, users } from "../../db/schema";
import type { Database } from "../../db";
import type { CreatePostInput, Post, PostWithAuthor, UpdatePostInput } from "./post.entity";

export class PostRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Post[]> {
    return this.db.select().from(posts).orderBy(asc(posts.id));
  }

  async findById(id: number): Promise<Post | undefined> {
    const rows = await this.db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return rows[0];
  }

  /** Because the monolith shares one DB, a single JOIN fetches the author. */
  async findByIdWithAuthor(id: number): Promise<PostWithAuthor | undefined> {
    const rows = await this.db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return undefined;
    return { ...row.posts, author: row.users };
  }

  async findByAuthorId(authorId: number): Promise<Post[]> {
    return this.db.select().from(posts).where(eq(posts.authorId, authorId)).orderBy(asc(posts.id));
  }

  async create(input: CreatePostInput): Promise<Post> {
    const rows = await this.db
      .insert(posts)
      .values({ ...input, createdAt: new Date().toISOString() })
      .returning();
    return rows[0];
  }

  async update(id: number, input: UpdatePostInput): Promise<Post | undefined> {
    const rows = await this.db.update(posts).set(input).where(eq(posts.id, id)).returning();
    return rows[0];
  }

  async remove(id: number): Promise<boolean> {
    const rows = await this.db.delete(posts).where(eq(posts.id, id)).returning();
    return rows.length > 0;
  }
}
