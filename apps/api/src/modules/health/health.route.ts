import { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  });
}
