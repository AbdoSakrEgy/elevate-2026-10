import "dotenv/config";
import { reset, seed } from "drizzle-seed";
import { createDb } from "./index";
import * as schema from "./schema";

/**
 * Bulk seed for load-testing / benchmarking.
 *
 * Unlike `seed.ts` (a tiny, hand-picked demo dataset), this uses `drizzle-seed`
 * to generate a large, deterministic, FK-consistent dataset. Because the
 * monolith keeps real foreign keys, `drizzle-seed` can generate the whole tree
 * (users -> posts -> comments) with correct relationships.
 *
 * Tune with env vars:
 *   SEED_USERS                (default 1000)
 *   SEED_POSTS_PER_USER       (default 20)
 *   SEED_COMMENTS_PER_POST    (default 5)
 */
export async function bulkSeed() {
  const usersCount = Number(process.env.SEED_USERS ?? 1000);
  const postsPerUser = Number(process.env.SEED_POSTS_PER_USER ?? 20);
  const commentsPerPost = Number(process.env.SEED_COMMENTS_PER_POST ?? 5);

  const db = createDb();

  await reset(db, schema);
  await seed(db, schema, { seed: 42 }).refine((f) => ({
    users: {
      count: usersCount,
      with: { posts: postsPerUser },
    },
    posts: {
      with: { comments: commentsPerPost },
    },
  }));

  return {
    users: usersCount,
    posts: usersCount * postsPerUser,
    comments: usersCount * postsPerUser * commentsPerPost,
  };
}

const isMain = process.argv[1]?.endsWith("seed-bulk.ts");
if (isMain) {
  bulkSeed()
    .then((counts) => {
      console.log("Bulk seed complete:", counts);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Bulk seed failed:", error);
      process.exit(1);
    });
}
