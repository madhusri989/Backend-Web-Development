'use strict';

const Redis = require('ioredis');

// lazyConnect starts the connection when the first command is issued.
// Keep Redis failures from taking down requests; the helpers below degrade gracefully.
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  lazyConnect: true,
  maxRetriesPerRequest: 1,
});

redis.on('error', (err) => {
  console.error('[cache] Redis error:', err.message);
});

async function cacheGet(key) {
  try {
    const value = await redis.get(key);
    return value === null ? null : JSON.parse(value);
  } catch (err) {
    console.error('[cache] get failed:', err.message);
    return null;
  }
}

async function cacheSet(key, data, ttlSeconds) {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error('[cache] set failed:', err.message);
  }
}

async function cacheDel(key) {
  try {
    await redis.del(key);
  } catch (err) {
    console.error('[cache] delete failed:', err.message);
  }
}

module.exports = { cacheGet, cacheSet, cacheDel };
