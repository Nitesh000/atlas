import type { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "@atlas/auth";
import { UnauthorizedError } from "../common/errors/index.js";

/**
 * Validates Better Auth session and attaches user to request.
 */
export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: request.headers as Record<string, string>,
  });

  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  request.user = session.user;
}
