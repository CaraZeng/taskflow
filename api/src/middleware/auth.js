const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Verifies token cookie; attaches userId to req
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// Must be used after requireAuth; checks user role
function requireRole(role) {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user || user.role !== role) {
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}

module.exports = { requireAuth, requireRole };