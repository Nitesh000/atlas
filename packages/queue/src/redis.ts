import { env } from "@atlas/config";
import RedisModule from "ioredis";

const RedisConstructor = RedisModule as unknown as {
  new (
    url: string,
    options: {
      maxRetriesPerRequest: null;
    },
  ): any;
};

export const redisClient = new RedisConstructor(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});
