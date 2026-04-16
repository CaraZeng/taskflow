const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function requireAuth(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function requireRole(role) {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user || user.role !== role) return res.status(403).json({ error: "Forbidden" });
      next();
    } catch { res.status(500).json({ error: "Internal server error" }); }
  };
}

module.exports = { requireAuth, requireRole };