import type { User } from "../users/user.entity";
import type { CommentWithAuthor } from "../comments/comment.entity";

export interface Post {
  id: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface PostWithAuthor extends Post {
  author: User | null;
}

export interface PostWithDetails extends Post {
  author: User | null;
  comments: CommentWithAuthor[];
}

export type CreatePostInput = Pick<Post, "authorId" | "title" | "content">;
export type UpdatePostInput = Partial<Pick<Post, "title" | "content">>;
