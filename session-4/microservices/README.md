# Social Microservices

The same social media app split into **independent services**, each with its own
process, its own SQLite database, and its own copy of the clean-architecture
layers.

## Services

| Service           | Port | Database    | Owns            |
| ----------------- | ---- | ----------- | --------------- |
| `users-service`   | 3001 | `users.db`  | users           |
| `posts-service`   | 3002 | `posts.db`  | posts           |
| `comments-service`| 3003 | `comments.db`| comments        |
| `gateway`         | 3000 | —           | public API      |

## Key differences from the monolith

- **No shared database.** `posts.authorId` and `comments.postId`/`authorId` are
  plain integers — there are **no foreign keys** across services. Referential
  integrity is gone; a service can store an `authorId` that does not exist.
- **No cross-service validation.** `posts-service` cannot check that an author
  exists, because users live in `users-service`.
- **Composition happens over HTTP.** The gateway assembles `GET /posts/:id` by
  calling `posts-service`, then `users-service` (author), then
  `comments-service` (comments) — three round-trips instead of one SQL JOIN.

## Run it

```bash
pnpm install
pnpm db:push     # push the schema for all three services
pnpm db:seed     # seed all three services (IDs line up across services)
pnpm dev         # run all four processes on ports 3000-3003
```

Then hit the gateway: `http://localhost:3000`.

### Bulk seed (for benchmarking)

`db:seed` inserts a tiny, hand-picked demo dataset. For load-testing there is a
`drizzle-seed`-based bulk seed per service (each service seeds its own database):

```bash
pnpm db:seed:bulk   # 1000 users, 20k posts, 100k comments (across 3 DBs)
```

The bulk seeds constrain `authorId`/`postId` to valid ranges so references line
up across services, just like the demo seed. Tune sizes with env vars:

```bash
SEED_USERS=100 SEED_POSTS=2000 SEED_COMMENTS=10000 pnpm db:seed:bulk
```

## Public API (via the gateway)

Same surface as the monolith:

| Method | Path                      |
| ------ | ------------------------- |
| POST/GET/PATCH/DELETE | `/users`, `/users/:id` |
| POST/GET | `/posts` |
| GET/PATCH/DELETE | `/posts/:id` (GET aggregates author + comments) |
| POST/GET | `/posts/:postId/comments` (GET enriches with author) |
| DELETE | `/comments/:id` |

## Benchmarking

```bash
ab -V || sudo apt-get install apache2-utils   # install ApacheBench if missing

# start the stack (after db:seed or db:seed:bulk), then in another terminal:
curl -s http://localhost:3000/posts/1 > /dev/null   # warm-up

ab -n 5000 -c 50 -k http://localhost:3000/health
ab -n 5000 -c 50 -k http://localhost:3000/users
ab -n 5000 -c 50 -k http://localhost:3000/posts
ab -n 5000 -c 50 -k http://localhost:3000/posts/1
ab -n 5000 -c 50 -k http://localhost:3000/posts/1/comments

# hit one service directly, bypassing the gateway:
ab -n 5000 -c 50 -k http://localhost:3002/posts/1
```

Read **`Requests per second`**, **`Time per request (mean)`**, the **percentiles**,
and confirm **`Failed requests`** is 0.

### What the numbers mean

Run the same commands against the monolith and compare. The interesting
endpoint is **`GET /posts/1`**:

- **Monolith** — one process, SQL `leftJoin` for author + comments.
- **Gateway (microservices)** — `posts-service` → `users-service` (author) →
  `comments-service` (comments) → one more `users-service` call *per comment*.
  On a post with 2 comments that's 5 HTTP round-trips inside one client request.

Expect the monolith to be several times faster on `/posts/1` and
`/posts/1/comments`, while `/health`, `/users`, and `/posts` stay close (the
gateway is a thin proxy there). Both apps run under `tsx`, so it's a fair
monolith-vs-microservices comparison (not an absolute production number).

**Note:** run one app at a time — both bind port `3000`.
