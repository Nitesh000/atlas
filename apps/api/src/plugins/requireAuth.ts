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
  
  // Debug logs to see what's actually reaching Better Auth
  console.log("=== REQUIRE AUTH DEBUG ===");
  console.log("URL:", request.url);
  console.log("Host Header:", request.headers.host);
  console.log("X-Forwarded-Host:", request.headers["x-forwarded-host"]);
  console.log("Cookie String:", request.headers.cookie);
  
  const session = await auth.api.getSession({
    headers: headers,
  });

  console.log("Session Result:", JSON.stringify(session));
  console.log("==========================");

  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  request.user = session.user;
}
