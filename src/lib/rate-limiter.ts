type RateLimitRecord = {
  timestamps: number[];
};

const limiters = new Map<string, RateLimitRecord>();

// Periodic cleanup of very old records (every 10 minutes)
if (typeof globalThis !== 'undefined') {
  const intervalKey = '_rate_limit_cleanup_interval';
  if (!(globalThis as any)[intervalKey]) {
    (globalThis as any)[intervalKey] = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of limiters.entries()) {
        // Keep only timestamps from the last 2 hours to be safe
        const active = record.timestamps.filter((ts) => now - ts < 2 * 60 * 60 * 1000);
        if (active.length === 0) {
          limiters.delete(key);
        } else {
          record.timestamps = active;
        }
      }
    }, 10 * 60 * 1000);
  }
}

/**
 * Checks if a request from a specific IP violates a rate limit.
 * 
 * @param ip The IP address of the client
 * @param type The rate limit category ("global", "auth", "contact")
 * @param limit The maximum number of allowed requests
 * @param windowMs The time window in milliseconds (e.g. 60000 for 1 minute)
 * @returns boolean true if the request is ALLOWED, false if BLOCKED
 */
export function checkRateLimit(
  ip: string,
  type: "global" | "auth" | "contact",
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `${ip}:${type}`;
  
  if (!limiters.has(key)) {
    limiters.set(key, { timestamps: [now] });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }
  
  const record = limiters.get(key)!;
  
  // Remove timestamps outside of the window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
  
  if (record.timestamps.length >= limit) {
    const oldestInWindow = record.timestamps[0];
    const resetTime = oldestInWindow + windowMs;
    return { allowed: false, remaining: 0, resetTime };
  }
  
  record.timestamps.push(now);
  const remaining = limit - record.timestamps.length;
  const oldestInWindow = record.timestamps[0];
  const resetTime = oldestInWindow + windowMs;
  
  return { allowed: true, remaining, resetTime };
}
