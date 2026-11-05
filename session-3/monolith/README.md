# Social Monolith

A simple social media app (users, posts, comments) built as a **single Fastify
process** with **one SQLite database**, following clean architecture:

```
request -> controller -> service -> repository -> database (Drizzle + SQLite)
```

## Layout

```
src/
  db/           Drizzle schema, client, and seed
  lib/          shared helpers (HTTP error hierarchy)
  modules/
    users/      entity / repository / service / controller / routes
    posts/      entity / repository / service / controller / routes
    comments/   entity / repository / service / controller / routes
  app.ts        composition root (wires everything together)
  server.ts     entrypoint
```

## Run it

```bash
pnpm install
pnpm db:push     # create the SQLite schema
pnpm db:seed     # insert sample users, posts, comments
pnpm dev         # start on http://localhost:3000
```

### Bulk seed (for benchmarking)

`db:seed` inserts a tiny, hand-picked demo dataset. For load-testing there is a
`drizzle-seed`-based bulk seed that generates a large, deterministic,
FK-consistent dataset:

```bash
pnpm db:seed:bulk   # 1000 users, 20k posts, 100k comments (in one DB)
```

Tune the size with env vars:

```bash
SEED_USERS=100 SEED_POSTS_PER_USER=10 SEED_COMMENTS_PER_POST=5 pnpm db:seed:bulk
```

## Build & run with pm2

`dev`/`start` run the TypeScript directly with `tsx`. For production (or to run
under pm2), compile to `dist/` first:

```bash
pnpm build           # esbuild -> dist/server.js (dependencies stay external)
node dist/server.js  # or: pnpm start:dist
```

Run the built app with pm2:

```bash
pnpm build
pm2 start ecosystem.config.cjs      # or: pm2 start dist/server.js --name social-monolith
pm2 status
pm2 logs social-monolith
```

The `ecosystem.config.cjs` pins `cwd` to the project root so `dotenv` finds
`.env` and `file:local.db` resolves correctly (rather than inside `dist/`).

## Endpoints

| Method | Path                    | Notes                              |
| ------ | ----------------------- | ---------------------------------- |
| POST   | `/users`                | create user                        |
| GET    | `/users`                | list users                         |
| GET    | `/users/:id`            | get user                           |
| PATCH  | `/users/:id`            | update user                        |
| DELETE | `/users/:id`            | delete user                        |
| POST   | `/posts`                | create post                        |
| GET    | `/posts`                | list posts                         |
| GET    | `/posts/:id`            | post **+ author + comments** (JOIN)|
| PATCH  | `/posts/:id`            | update post                        |
| DELETE | `/posts/:id`            | delete post (cascades comments)    |
| POST   | `/posts/:postId/comments` | add comment                     |
| GET    | `/posts/:postId/comments` | list comments (with author)     |
| DELETE | `/comments/:id`         | delete comment                     |

`GET /posts/:id` returns author and comments in **one process** using SQL joins
— the same result the microservices gateway must assemble with several HTTP
round-trips.

## Benchmarking

```bash
ab -V || sudo apt-get install apache2-utils   # install ApacheBench if missing

# start the server (after db:seed or db:seed:bulk), then in another terminal:
curl -s http://localhost:3000/posts/1 > /dev/null   # warm-up

ab -n 5000 -c 50 -k http://localhost:3000/health
ab -n 5000 -c 50 -k http://localhost:3000/users
ab -n 5000 -c 50 -k http://localhost:3000/posts
ab -n 5000 -c 50 -k http://localhost:3000/posts/1
ab -n 5000 -c 50 -k http://localhost:3000/posts/1/comments
```

Read **`Requests per second`**, **`Time per request (mean)`**, the **percentiles**,
and confirm **`Failed requests`** is 0. See the microservices README for the
side-by-side comparison of the same commands against the gateway.
