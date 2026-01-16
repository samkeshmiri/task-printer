import { Router } from "express";
import printerService from "../printer/printer.js";

const router = Router();

// Print task directly
router.post("/print", async (req, res) => {
  const { taskName } = req.body;

  if (!taskName || !taskName.trim()) {
    return res.status(400).json({ error: "Task name is required" });
  }

  try {
    // Try to connect to printer if not already connected
    if (!printerService.printer) {
      try {
        await printerService.connect();
      } catch (error) {
        console.log("Printer not available, using mock mode");
      }
    }

    // Print the task
    await printerService.printTask(taskName.trim());

    console.log(`Printed task: "${taskName.trim()}"`);
    res.json({ message: "Task printed successfully" });
  } catch (error) {
    console.error("Print error:", error);
    res.status(500).json({ error: "Failed to print task" });
  }
});

export default router;
