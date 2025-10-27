const IORedis = require('ioredis');

const fromUrl = process.env.REDIS_URL;
const host = process.env.REDIS_HOST || 'redis';   // <- padrão dentro do Docker
const port = Number(process.env.REDIS_PORT || 6379);
const db = Number(process.env.REDIS_DB || 0);

const opts = { maxRetriesPerRequest: null, enableReadyCheck: true };

const redis = fromUrl
    ? new IORedis(fromUrl, opts)
    : new IORedis({ host, port, db, ...opts });

redis.on('connect', () => {
    console.log(`[redis] conectado em ${fromUrl ? fromUrl : `${host}:${port}`} db=${db}`);
});
redis.on('error', (e) => {
    console.error('[redis] erro:', e && e.message ? e.message : e);
});

module.exports = { redis };
