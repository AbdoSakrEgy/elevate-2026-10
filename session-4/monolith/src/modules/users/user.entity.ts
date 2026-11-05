/**
 * Domain types for the User aggregate.
 *
 * Entities are plain data — no framework, no ORM, no HTTP concerns.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export type CreateUserInput = Pick<User, "username" | "email" | "fullName">;
export type UpdateUserInput = Partial<CreateUserInput>;
