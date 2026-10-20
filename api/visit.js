// Unique visitor counter API — 1 user = 1 count, never per-visit.
// Storage: Upstash Redis over REST.
//   Env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
// POST /api/visit — register this visitor once (deduped server-side by a
//   salted hash of their IP) and return the total unique count.
// GET  /api/visit — return the current total without registering.
// If the store is not configured yet, returns { count: null } and the
// site falls back to its local per-browser number.
const crypto = require("crypto");

async function redis(commands) {
  const r = await fetch(process.env.UPSTASH_REDIS_REST_URL + "/pipeline", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.UPSTASH_REDIS_REST_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error("redis " + r.status);
  return r.json();
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const configured = !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  if (!configured)
    return res.status(200).json({ count: null, configured: false });
  try {
    if (req.method === "POST") {
      const ip =
        (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        "unknown";
      const salt = process.env.VISITOR_SALT || "sri-by-rahman-pasha";
      const h = crypto
        .createHash("sha256")
        .update(salt + "|" + ip)
        .digest("hex");
      const added = await redis([["SADD", "uv:ips", h]]);
      const isNew = !!(added && added[0] && added[0].result === 1);
      let count;
      if (isNew) {
        const inc = await redis([["INCR", "uv:count"]]);
        count = inc[0].result;
      } else {
        const got = await redis([["GET", "uv:count"]]);
        count = parseInt((got && got[0] && got[0].result) || "0", 10);
      }
      return res
        .status(200)
        .json({ count: count, configured: true, registered: isNew });
    }
    const got = await redis([["GET", "uv:count"]]);
    return res.status(200).json({
      count: parseInt((got && got[0] && got[0].result) || "0", 10),
      configured: true,
    });
  } catch (e) {
    return res
      .status(200)
      .json({ count: null, configured: true, error: "store_unreachable" });
  }
};
