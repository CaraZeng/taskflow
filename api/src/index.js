require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { requireAuth, requireRole } = require("./middleware/auth");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ── Health check ────────────────────────────────────────────────────────────
app.get("/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date().toISOString() });
});

// ── Auth endpoints ──────────────────────────────────────────────────────────

// POST /register
app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  // Server-side validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: "All fields are required." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ error: "Name must be at least 2 characters." });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: "user" },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch {
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch {
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /logout
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out." });
});

// GET /me — returns current user (used by client on load)
app.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Internal server error." });
  }
});

// ── Tasks endpoints ─────────────────────────────────────────────────────────

// GET /tasks — list all tasks with pagination (public-readable)
app.get("/tasks", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = parseInt(req.query.offset) || 0;

  try {
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { project: { select: { title: true } } },
      }),
      prisma.task.count(),
    ]);

    res.json({ tasks, total, limit, offset });
  } catch {
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

// POST /tasks — create a task (auth required)
app.post("/tasks", requireAuth, async (req, res) => {
  const { title, description, status, dueDate, projectId } = req.body;

  // Server-side validation
  if (!title || typeof title !== "string" || title.trim().length < 2) {
    return res.status(400).json({ error: "Title must be at least 2 characters." });
  }
  if (!projectId || isNaN(Number(projectId))) {
    return res.status(400).json({ error: "A valid projectId is required." });
  }
  const validStatuses = ["todo", "in-progress", "done"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status must be todo, in-progress, or done." });
  }
  if (dueDate && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({ error: "Invalid due date." });
  }

  try {
    // Verify the project belongs to the authenticated user
    const project = await prisma.project.findUnique({ where: { id: Number(projectId) } });
    if (!project || project.userId !== req.userId) {
      return res.status(403).json({ error: "Forbidden: project not found or not yours." });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || "todo",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: Number(projectId),
      },
    });

    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: "Failed to create task." });
  }
});

// ── Projects endpoints (needed so task creation works) ──────────────────────

// GET /projects — list projects for current user
app.get("/projects", requireAuth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: "Failed to fetch projects." });
  }
});

// POST /projects — create a project
app.post("/projects", requireAuth, async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim().length < 2) {
    return res.status(400).json({ error: "Title must be at least 2 characters." });
  }

  try {
    const project = await prisma.project.create({
      data: { title: title.trim(), description: description?.trim() || null, userId: req.userId },
    });
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: "Failed to create project." });
  }
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));