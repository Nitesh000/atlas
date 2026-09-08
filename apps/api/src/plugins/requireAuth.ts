import type { FastifyReply, FastifyRequest } from "fastify";
import { dbClient, authSchema } from "@atlas/database";
import { eq } from "drizzle-orm";
import { UnauthorizedError } from "../common/errors/index.js";

/**
 * Validates Better Auth session and attaches user to request.
 */
export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  let token = "";

  // 1. Try to extract token from Authorization header (Bearer token)
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1] || "";
  }

  // 2. Fallback: extract token directly from cookies
  if (!token && request.headers.cookie) {
    const cookies = request.headers.cookie.split(";").map((c) => c.trim());
    const sessionCookie = cookies.find((c) => c.startsWith("better-auth.session_token="));
    if (sessionCookie) {
      token = sessionCookie.split("=")[1] || "";
    }
  }

  if (!token) {
    throw new UnauthorizedError("Authentication required (No token provided)");
  }

  // 3. Manually query the database to bypass Better Auth's internal strict CORS/Host checks
  const [sessionRecord] = await dbClient
    .select()
    .from(authSchema.session)
    .where(eq(authSchema.session.token, token));

  if (!sessionRecord || sessionRecord.expiresAt < new Date()) {
    throw new UnauthorizedError("Authentication required (Invalid or expired token)");
  }

  const [userRecord] = await dbClient
    .select()
    .from(authSchema.user)
    .where(eq(authSchema.user.id, sessionRecord.userId));

  if (!userRecord) {
    throw new UnauthorizedError("Authentication required (User not found)");
  }

  request.user = userRecord;
}
