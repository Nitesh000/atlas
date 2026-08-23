import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { chatHandler } from "./chat.controller.js";
import { chatSchema } from "./chat.schema.js";

export async function chatRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // No requireAuth hook here. This is a public API protected by the API Key header.
  typedApp.post("/", { schema: chatSchema }, chatHandler);
}
