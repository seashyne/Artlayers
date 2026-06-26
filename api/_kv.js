const getRedisConfig = () => {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    const error = new Error("Cloud storage is not configured.");
    error.statusCode = 503;
    throw error;
  }

  return { url, token };
};

export const kvCommand = async (command) => {
  const { url, token } = getRedisConfig();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  const payload = await response.json();

  if (!response.ok || payload.error) {
    const error = new Error(payload.error || "Cloud storage request failed.");
    error.statusCode = response.status || 500;
    throw error;
  }

  return payload.result;
};

export const getJson = async (key, fallback = null) => {
  const value = await kvCommand(["GET", key]);
  return value ? JSON.parse(value) : fallback;
};

export const setJson = (key, value) => kvCommand(["SET", key, JSON.stringify(value)]);
