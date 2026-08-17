import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
});

export const refreshTTL = async (sandboxId) => {
    await redis.expire(`sandbox:${sandboxId}`, 120); // Reset TTL to 120 seconds
}