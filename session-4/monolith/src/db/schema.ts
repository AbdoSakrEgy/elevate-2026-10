import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

/**
 * A single schema for the whole monolith.
 *
 * Because users, posts and comments live in the SAME database, we can declare
 * real foreign keys here and rely on SQLite for referential integrity and
 * cascading deletes.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  fullName: text("fullName").notNull(),
  createdAt: text("createdAt").notNull(),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorId: integer("authorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: text("createdAt").notNull(),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("postId")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  authorId: integer("authorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: text("createdAt").notNull(),
});
