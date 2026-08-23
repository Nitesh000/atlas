#### Please try to follow these rules for all the development of this project

- we'll use the TDD(Test Driven Development) if necessary for any module, if it's not then we'll not use it.
- we'll keep the folder structure very modular so a particular module will be responsible for particular set of tasks.
- we'll not put any magin number/string in the project, these are the reason for weird bugs.
- don't write any type of code and run which will clear any type of data which we've prepared/added for our project. before deleting anything ask multiple times to be sure.
- we'll try to use the pragmatic approach for our coading practice.
- we'll put comments on the functions when it's necessary, like if it's a simple date formatter then we'll just put a simple comment, we don't need rather complecated text for what the function is doing in very detail.
- the names of the variables should be very clear and understandable according to what purpose they serve.

## Architecture Rules

- use domain-first modular structure for all apps.
- do not use large global `controllers/` and `services/` folders for the api.
- each backend domain must live in `apps/api/src/modules/<domain>/`.
- a backend module may contain:
  - `<domain>.route.ts`
  - `<domain>.controller.ts`
  - `<domain>.service.ts`
  - `<domain>.repository.ts`
  - `<domain>.schema.ts`
  - `<domain>.types.ts`
  - `<domain>.constants.ts`
  - `helpers/` if needed
- keep file size small; extract helpers when a file becomes crowded.
- `@atlas/config` is only for env parsing and config values. no db/auth/redis clients there.
- `@atlas/database` owns drizzle client, schema, and db lifecycle.
- `@atlas/auth` owns better auth setup and auth-specific utilities.
- `@atlas/queue` owns redis/bullmq connections, queue names, and queue builders.
- shared zod contracts reused by frontend/backend go in `packages/validation`.
- shared TypeScript-only types go in `packages/types`.
- never access `process.env` outside `@atlas/config`.
- all shutdown flows must be graceful:
  - close fastify
  - close postgres client
  - close redis/bullmq connections
- use constants/enums instead of magic strings/numbers.
- prefer clear naming over short naming.
- add jsdoc on non-trivial public functions and services.
- tdd is encouraged for core business logic, auth flows, jobs, and integrations.
