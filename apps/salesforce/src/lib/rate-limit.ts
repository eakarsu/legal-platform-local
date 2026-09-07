const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function rateLimiter(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimit.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimit.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: limit - record.count }
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of Array.from(rateLimit.entries())) {
    if (now > value.resetTime) {
      rateLimit.delete(key)
    }
  }
}, 60 * 1000)
