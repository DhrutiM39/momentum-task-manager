const NodeCache = require("node-cache");

const TTL_SECONDS = 60;
const cache = new NodeCache({ stdTTL: TTL_SECONDS, checkperiod: 120 });

const allTasksCacheKey = (userId) => `tasks:${String(userId)}:all`;
const singleTaskCacheKey = (userId, taskId) =>
  `tasks:${String(userId)}:${String(taskId)}`;

const invalidateTaskCache = (userId, taskId) => {
  const keys = [allTasksCacheKey(userId)];
  if (taskId !== undefined && taskId !== null) {
    keys.push(singleTaskCacheKey(userId, taskId));
  }
  cache.del(keys);
};

module.exports = {
  cache,
  TTL_SECONDS,
  allTasksCacheKey,
  singleTaskCacheKey,
  invalidateTaskCache
};