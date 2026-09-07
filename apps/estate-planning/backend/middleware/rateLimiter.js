const rateLimit = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }
    // Normalize IPv6-mapped IPv4 addresses
    const ip = req.ip || 'unknown';
    return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded. You can make 20 AI requests per hour.',
    });
  },
  validate: {
    xForwardedForHeader: false,
    keyGeneratorIpFallback: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimiter };
