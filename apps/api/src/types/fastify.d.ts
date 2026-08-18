import "fastify";
import type { User } from "better-auth";

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
  }
}
