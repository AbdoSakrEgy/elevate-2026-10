import type { User } from "../users/user.entity";

export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
}

export interface CommentWithAuthor extends Comment {
  author: User | null;
}

export type CreateCommentInput = Pick<Comment, "postId" | "authorId" | "content">;
