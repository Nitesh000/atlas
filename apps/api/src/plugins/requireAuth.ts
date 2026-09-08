import type { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "@atlas/auth";
import { fromNodeHeaders } from "better-auth/node";
import { UnauthorizedError } from "../common/errors/index.js";

/**
 * Validates Better Auth session and attaches user to request.
 */
export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  const headers = fromNodeHeaders(request.headers);
  const session = await auth.api.getSession({
    headers: headers,
  });

  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  request.user = session.user;
}
