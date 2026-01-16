// API Base URL
const API_URL = "/api";

// DOM Elements
const taskInput = document.getElementById("taskInput");
const printBtn = document.getElementById("printBtn");
const status = document.getElementById("status");

// Initialize app
function init() {
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  printBtn.addEventListener("click", handlePrint);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handlePrint();
    }
  });
}

// Handle print
async function handlePrint() {
  const taskName = taskInput.value.trim();

  if (!taskName) {
    showStatus("Please enter a task name", "error");
    return;
  }

  const originalText = printBtn.textContent;
  printBtn.textContent = "Printing...";
  printBtn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/print`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskName }),
    });

    if (response.ok) {
      taskInput.value = "";
      showStatus("Task printed successfully!", "success");
      // Clear input focus for better UX
      taskInput.focus();
    } else {
      throw new Error("Print failed");
    }
  } catch (error) {
    console.error("Error printing:", error);
    showStatus("Failed to print task", "error");
  } finally {
    printBtn.textContent = originalText;
    printBtn.disabled = false;
  }
}

// Show status message
function showStatus(message, type = "info") {
  status.textContent = message;
  status.className = `status-message ${type}`;
  
  // Clear status after 3 seconds
  setTimeout(() => {
    status.textContent = "";
    status.className = "status-message";
  }, 3000);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", init);
