import IORedis from "ioredis";

class FakeRedis {
  constructor() {
    this.store = new Map();
    this.expires = new Map();
    this.status = "ready";
  }

  purgeExpired(key) {
    const exp = this.expires.get(key);
    if (exp && Date.now() > exp) {
      this.store.delete(key);
      this.expires.delete(key);
    }
  }

  async set(key, value, ...args) {
    this.purgeExpired(key);
    const normalizedArgs = args.map((arg) => String(arg).toUpperCase());
    const nxIndex = normalizedArgs.findIndex((arg) => arg === "NX");
    if (nxIndex !== -1 && this.store.has(key)) {
      return null;
    }

    if (args && args.length >= 2) {
      const exIndex = normalizedArgs.findIndex((arg) => arg === "EX");
      if (exIndex !== -1 && args[exIndex + 1] != null) {
        const seconds = Number(args[exIndex + 1]);
        const expireAt = Date.now() + seconds * 1000;
        this.expires.set(key, expireAt);
      } else {
        this.expires.delete(key);
      }
    } else {
      this.expires.delete(key);
    }
    this.store.set(key, value);
    return "OK";
  }

  async get(key) {
    this.purgeExpired(key);
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async del(key) {
    const existed = this.store.has(key) ? 1 : 0;
    this.store.delete(key);
    this.expires.delete(key);
    return existed;
  }

  async incr(key) {
    this.purgeExpired(key);
    const nextValue = Number(this.store.get(key) || 0) + 1;
    this.store.set(key, String(nextValue));
    return nextValue;
  }

  async expire(key, seconds) {
    if (!this.store.has(key)) return 0;
    this.expires.set(key, Date.now() + Number(seconds) * 1000);
    return 1;
  }

  on() {
    /* no-op in tests */
  }

  quit() {
    this.status = "end";
    return Promise.resolve();
  }

  ping() {
    return Promise.resolve("PONG");
  }
}

const createRedisClient = () => {
  const redisEnabled = String(process.env.REDIS_ENABLED || "").toLowerCase() === "true";

  if (process.env.NODE_ENV === "test" || !redisEnabled) {
    const fakeRedis = new FakeRedis();
    fakeRedis.connectRedis = async () => {};
    fakeRedis.closeRedis = async () => {};
    return fakeRedis;
  }

  const host = process.env.REDIS_HOST || "127.0.0.1";
  const port = Number(process.env.REDIS_PORT || 6379);
  const password = process.env.REDIS_PASSWORD || undefined;
  const url = process.env.REDIS_URL || null;

  const redis = url
    ? new IORedis(url, { maxRetriesPerRequest: null })
    : new IORedis({
        host,
        port,
        password,
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error(
              "Redis connection failed after 3 retries. Please check your Redis configuration."
            );
            return null;
          }
          return Math.min(times * 200, 2000);
        },
        enableReadyCheck: true,
        lazyConnect: true,
      });

  redis.on("connect", () => {
    console.log("Connected to Redis");
  });

  redis.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });

  redis.on("close", () => {
    console.log("Redis connection closed");
  });

  redis.connectRedis = async () => {
    if (redis.status === "ready") {
      await redis.ping();
      return;
    }
    if (redis.status === "wait") {
      await redis.connect();
    } else {
      await new Promise((resolve, reject) => {
        if (redis.status === "ready") {
          resolve();
          return;
        }
        redis.once("ready", resolve);
        redis.once("error", reject);
      });
    }
    await redis.ping();
  };

  redis.closeRedis = async () => {
    if (redis.status === "end") return;
    await redis.quit();
  };

  return redis;
};

const redis = createRedisClient();

export default redis;
export const connection = redis;
