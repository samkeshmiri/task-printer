import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import taskRoutes from "./routes/tasks.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api", taskRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Task Printer API is running" });
});

app.listen(PORT, () => {
  console.log(`\n🖨️  Task Printer server running on http://localhost:${PORT}`);
  console.log("📋 Open your browser to start printing tasks instantly!");
  console.log(
    "\n💡 This simplified version prints tasks directly - no database storage needed"
  );
});
