import "dotenv/config";
import { createDb } from "./index";
import { comments, posts, users } from "./schema";

/** Deterministic ISO timestamp helper so seed data is reproducible. */
const iso = (minutes: number) =>
  new Date(Date.UTC(2026, 10, 5, 9, 0, 0) + minutes * 60_000).toISOString();

export async function seed() {
  const db = createDb();

  // Reset in child-first order so foreign keys never block the deletes.
  await db.delete(comments);
  await db.delete(posts);
  await db.delete(users);

  const seededUsers = await db
    .insert(users)
    .values([
      { id: 1, username: "alice", email: "alice@example.com", fullName: "Alice Johnson", createdAt: iso(0) },
      { id: 2, username: "bob", email: "bob@example.com", fullName: "Bob Smith", createdAt: iso(1) },
      { id: 3, username: "carol", email: "carol@example.com", fullName: "Carol White", createdAt: iso(2) },
      { id: 4, username: "dave", email: "dave@example.com", fullName: "Dave Brown", createdAt: iso(3) },
    ])
    .returning();

  const seededPosts = await db
    .insert(posts)
    .values([
      { id: 1, authorId: 1, title: "Hello, world!", content: "My first post on this demo social network.", createdAt: iso(10) },
      { id: 2, authorId: 1, title: "Why I like Drizzle", content: "Type-safe SQL with a tiny footprint. What's not to like?", createdAt: iso(20) },
      { id: 3, authorId: 2, title: "Clean architecture with Fastify", content: "Controller -> Service -> Repository keeps the layers honest.", createdAt: iso(30) },
      { id: 4, authorId: 3, title: "Monolith vs microservices", content: "Start with a monolith, split when you outgrow it.", createdAt: iso(40) },
      { id: 5, authorId: 4, title: "SQLite for local development", content: "Zero setup and it behaves like production SQL.", createdAt: iso(50) },
      { id: 6, authorId: 2, title: "Seeding your database", content: "Deterministic seed data makes demos and tests reliable.", createdAt: iso(60) },
    ])
    .returning();

  const seededComments = await db
    .insert(comments)
    .values([
      { id: 1, postId: 1, authorId: 2, content: "Welcome!", createdAt: iso(15) },
      { id: 2, postId: 1, authorId: 3, content: "Nice first post.", createdAt: iso(16) },
      { id: 3, postId: 2, authorId: 3, content: "Drizzle is awesome.", createdAt: iso(25) },
      { id: 4, postId: 2, authorId: 4, content: "Agreed.", createdAt: iso(26) },
      { id: 5, postId: 3, authorId: 1, content: "Great architecture.", createdAt: iso(35) },
      { id: 6, postId: 3, authorId: 4, content: "Clean code!", createdAt: iso(36) },
      { id: 7, postId: 4, authorId: 1, content: "Interesting comparison.", createdAt: iso(45) },
      { id: 8, postId: 4, authorId: 2, content: "Microservices are hard, though.", createdAt: iso(46) },
      { id: 9, postId: 5, authorId: 1, content: "SQLite is perfect for demos.", createdAt: iso(55) },
      { id: 10, postId: 5, authorId: 3, content: "Zero setup!", createdAt: iso(56) },
      { id: 11, postId: 6, authorId: 1, content: "Seeding makes demos easy.", createdAt: iso(65) },
      { id: 12, postId: 6, authorId: 3, content: "Thanks for the tip.", createdAt: iso(66) },
    ])
    .returning();

  return {
    users: seededUsers.length,
    posts: seededPosts.length,
    comments: seededComments.length,
  };
}

// Allow `tsx src/db/seed.ts` to run directly.
const isMain = process.argv[1]?.endsWith("seed.ts");
if (isMain) {
  seed()
    .then((counts) => {
      console.log("Seed complete:", counts);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}
