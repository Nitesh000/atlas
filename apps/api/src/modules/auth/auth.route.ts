import type { FastifyInstance } from "fastify";
import { auth } from "@atlas/auth";
import { env } from "@atlas/config";
import { fromNodeHeaders } from "better-auth/node";

export async function authRoutes(app: FastifyInstance) {
  app.route({
    method: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    url: "/*",
    async handler(request, reply) {
      try {
        // Construct request URL
        const url = new URL(request.url, env.BETTER_AUTH_URL);

        // Convert Fastify headers to standard Headers object
        const headers = fromNodeHeaders(request.headers);

        // Create Fetch API-compatible request
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });

        // Process authentication request
        const response = await auth.handler(req);

        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        return reply.send(response.body ? await response.text() : null);
      } catch (error) {
        request.log.error({ err: error }, "Authentication Error");
        return reply.status(500).send({ error: "Authentication failed" });
      }
    },
  });
}
