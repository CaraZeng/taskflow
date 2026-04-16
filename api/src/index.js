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

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ── Health ───────────────────────────────────────────────────────────────────
app.get("/ping", (req, res) => res.json({ message: "pong" }));

// ── Auth ─────────────────────────────────────────────────────────────────────
app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "All fields are required." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Invalid email format." });
  if (password.length < 8)
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  if (!/[A-Z]/.test(password))
    return res.status(400).json({ error: "Password must contain an uppercase letter." });
  if (name.trim().length < 2)
    return res.status(400).json({ error: "Name must be at least 2 characters." });
  try {
    if (await prisma.user.findUnique({ where: { email } }))
      return res.status(400).json({ error: "Email already in use." });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name: name.trim(), role: "user" },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch { res.status(500).json({ error: "Internal server error." }); }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Invalid credentials." });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch { res.status(500).json({ error: "Internal server error." }); }
});

app.post("/logout", (req, res) => { res.clearCookie("token"); res.json({ message: "Logged out." }); });

app.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch { res.status(500).json({ error: "Internal server error." }); }
});

// ── Projects ─────────────────────────────────────────────────────────────────
app.get("/projects", requireAuth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { tasks: true } } },
    });
    res.json(projects);
  } catch { res.status(500).json({ error: "Failed to fetch projects." }); }
});

app.post("/projects", requireAuth, async (req, res) => {
  const { title, description } = req.body;
  if (!title || title.trim().length < 2)
    return res.status(400).json({ error: "Title must be at least 2 characters." });
  try {
    const project = await prisma.project.create({
      data: { title: title.trim(), description: description?.trim() || null, userId: req.userId },
    });
    res.status(201).json(project);
  } catch { res.status(500).json({ error: "Failed to create project." }); }
});

app.put("/projects/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description } = req.body;
  if (!title || title.trim().length < 2)
    return res.status(400).json({ error: "Title must be at least 2 characters." });
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found." });
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (project.userId !== req.userId && user.role !== "admin")
      return res.status(403).json({ error: "Forbidden." });
    const updated = await prisma.project.update({
      where: { id },
      data: { title: title.trim(), description: description?.trim() || null },
    });
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to update project." }); }
});

app.delete("/projects/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found." });
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (project.userId !== req.userId && user.role !== "admin")
      return res.status(403).json({ error: "Forbidden." });
    await prisma.project.delete({ where: { id } });
    res.json({ message: "Deleted." });
  } catch { res.status(500).json({ error: "Failed to delete project." }); }
});

// ── Tasks ────────────────────────────────────────────────────────────────────
// GET /tasks?limit=&offset=&search=&status=
app.get("/tasks", async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 10, 50);
  const offset = parseInt(req.query.offset) || 0;
  const search = req.query.search?.trim() || "";
  const status = req.query.status || "";

  const where = {};
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  try {
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where, skip: offset, take: limit,
        orderBy: { createdAt: "desc" },
        include: { project: { select: { title: true, userId: true } } },
      }),
      prisma.task.count({ where }),
    ]);
    res.json({ tasks, total, limit, offset });
  } catch { res.status(500).json({ error: "Failed to fetch tasks." }); }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { project: { select: { id: true, title: true, userId: true } } },
    });
    if (!task) return res.status(404).json({ error: "Task not found." });
    res.json(task);
  } catch { res.status(500).json({ error: "Failed to fetch task." }); }
});

app.post("/tasks", requireAuth, async (req, res) => {
  const { title, description, status, dueDate, projectId } = req.body;
  if (!title || typeof title !== "string" || title.trim().length < 2)
    return res.status(400).json({ error: "Title must be at least 2 characters." });
  if (!projectId || isNaN(Number(projectId)))
    return res.status(400).json({ error: "A valid projectId is required." });
  const validStatuses = ["todo", "in-progress", "done"];
  if (status && !validStatuses.includes(status))
    return res.status(400).json({ error: "Status must be todo, in-progress, or done." });
  if (dueDate && isNaN(Date.parse(dueDate)))
    return res.status(400).json({ error: "Invalid due date." });
  try {
    const project = await prisma.project.findUnique({ where: { id: Number(projectId) } });
    if (!project || project.userId !== req.userId)
      return res.status(403).json({ error: "Forbidden: project not found or not yours." });
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
  } catch { res.status(500).json({ error: "Failed to create task." }); }
});

app.put("/tasks/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, status, dueDate } = req.body;
  if (!title || title.trim().length < 2)
    return res.status(400).json({ error: "Title must be at least 2 characters." });
  const validStatuses = ["todo", "in-progress", "done"];
  if (status && !validStatuses.includes(status))
    return res.status(400).json({ error: "Invalid status." });
  if (dueDate && isNaN(Date.parse(dueDate)))
    return res.status(400).json({ error: "Invalid due date." });
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!task) return res.status(404).json({ error: "Task not found." });
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (task.project.userId !== req.userId && user.role !== "admin")
      return res.status(403).json({ error: "Forbidden." });
    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || task.status,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to update task." }); }
});

app.delete("/tasks/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
    if (!task) return res.status(404).json({ error: "Task not found." });
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (task.project.userId !== req.userId && user.role !== "admin")
      return res.status(403).json({ error: "Forbidden." });
    await prisma.task.delete({ where: { id } });
    res.json({ message: "Deleted." });
  } catch { res.status(500).json({ error: "Failed to delete task." }); }
});

// ── Admin ────────────────────────────────────────────────────────────────────
app.get("/admin/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch { res.status(500).json({ error: "Failed to fetch users." }); }
});

app.put("/admin/users/:id/role", requireAuth, requireRole("admin"), async (req, res) => {
  const id = parseInt(req.params.id);
  const { role } = req.body;
  if (!["user", "admin"].includes(role))
    return res.status(400).json({ error: "Role must be 'user' or 'admin'." });
  if (id === req.userId)
    return res.status(400).json({ error: "Cannot change your own role." });
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to update role." }); }
});

app.delete("/admin/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.userId)
    return res.status(400).json({ error: "Cannot delete yourself." });
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted." });
  } catch { res.status(500).json({ error: "Failed to delete user." }); }
});

// GET /stats — dashboard statistics
app.get("/stats", requireAuth, async (req, res) => {
  try {
    const [total, todo, inProgress, done, projects] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: "todo" } }),
      prisma.task.count({ where: { status: "in-progress" } }),
      prisma.task.count({ where: { status: "done" } }),
      prisma.project.count({ where: { userId: req.userId } }),
    ]);
    res.json({ total, todo, inProgress, done, projects });
  } catch { res.status(500).json({ error: "Failed to fetch stats." }); }
});

app.get("/stats", requireAuth, async (req, res) => {
  try {
    const [total, todo, inProgress, done, projects] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: "todo" } }),
      prisma.task.count({ where: { status: "in-progress" } }),
      prisma.task.count({ where: { status: "done" } }),
      prisma.project.count({ where: { userId: req.userId } }),
    ]);
    res.json({ total, todo, inProgress, done, projects });
  } catch { res.status(500).json({ error: "Failed to fetch stats." }); }
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));