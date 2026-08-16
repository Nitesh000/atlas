import { FastifyInstance } from "fastify";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@atlas/auth";

export async function authRoutes(app: FastifyInstance) {
  const authHandler = toNodeHandler(auth);

  app.all("/*", async (request, reply) => {
    reply.hijack();
    await authHandler(request.raw, reply.raw);
  });
}
