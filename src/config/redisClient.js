const Redis = require("ioredis");

const redisClient = new Redis({
  host: "127.0.0.1", // Replace with your Redis server if hosted remotely
  port: 6379,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = redisClient;
