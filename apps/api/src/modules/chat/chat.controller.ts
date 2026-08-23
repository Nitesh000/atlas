import type { FastifyReply, FastifyRequest } from "fastify";
import type { ChatInput } from "./chat.types.js";
import { processChat } from "./chat.service.js";

export async function chatHandler(
  request: FastifyRequest<{
    Headers: { "x-atlas-api-key": string };
    Body: ChatInput;
  }>,
  reply: FastifyReply,
) {
  const apiKey = request.headers["x-atlas-api-key"];
  const origin = request.headers.origin || request.headers.referer;

  const response = await processChat(apiKey, request.body, origin);

  return reply.status(200).send(response);
}
