// API Base URL
const API_URL = "/api";

// State
let allTasks = [];
let selectedTaskId = null;

// DOM Elements
const taskNameInput = document.getElementById("taskNameInput");
const parentTaskSelect = document.getElementById("parentTaskSelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskTree = document.getElementById("taskTree");
const modal = document.getElementById("taskModal");
const modalTaskName = document.getElementById("modalTaskName");
const closeModal = document.querySelector(".close");
const printSingleBtn = document.getElementById("printSingleBtn");
const printWithSubtasksBtn = document.getElementById("printWithSubtasksBtn");
const deleteTaskBtn = document.getElementById("deleteTaskBtn");

// Initialize app
async function init() {
  await loadTasks();
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  addTaskBtn.addEventListener("click", handleAddTask);
  taskNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  printSingleBtn.addEventListener("click", () => handlePrint(false));
  printWithSubtasksBtn.addEventListener("click", () => handlePrint(true));
  deleteTaskBtn.addEventListener("click", handleDeleteTask);
}

// Load all tasks
async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks-tree`);
    allTasks = await response.json();
    renderTasks();
    updateParentSelect();
  } catch (error) {
    console.error("Error loading tasks:", error);
    showNotification("Failed to load tasks", "error");
  }
}

// Render tasks in tree structure
function renderTasks() {
  if (allTasks.length === 0) {
    taskTree.innerHTML =
      '<div class="empty-state">No tasks yet. Add your first task above!</div>';
    return;
  }

  taskTree.innerHTML = allTasks.map((task) => renderTaskItem(task)).join("");
}

// Render a single task item with children
function renderTaskItem(task) {
  const hasChildren = task.children && task.children.length > 0;

  return `
    <div class="task-item" onclick="openTaskModal(${
      task.id
    }, '${task.name.replace(/'/g, "\\'")}')">
      <div class="task-item-header">
        <span class="task-name">${task.name}</span>
        ${
          hasChildren
            ? `<span style="color: #9ca3af; font-size: 0.9em;">${task.children.length} subtask(s)</span>`
            : ""
        }
      </div>
      ${
        hasChildren
          ? `
        <div class="task-children">
          ${task.children.map((child) => renderTaskItem(child)).join("")}
        </div>
      `
          : ""
      }
    </div>
  `;
}

// Update parent task dropdown
function updateParentSelect() {
  const options = ['<option value="">No Parent (Root Task)</option>'];

  function addTaskOptions(tasks, indent = "") {
    tasks.forEach((task) => {
      options.push(`<option value="${task.id}">${indent}${task.name}</option>`);
      if (task.children && task.children.length > 0) {
        addTaskOptions(task.children, indent + "  ");
      }
    });
  }

  addTaskOptions(allTasks);
  parentTaskSelect.innerHTML = options.join("");
}

// Handle add task
async function handleAddTask() {
  const taskName = taskNameInput.value.trim();

  if (!taskName) {
    showNotification("Please enter a task name", "error");
    return;
  }

  const parentId = parentTaskSelect.value || null;

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: taskName,
        parent_id: parentId,
      }),
    });

    if (response.ok) {
      taskNameInput.value = "";
      parentTaskSelect.value = "";
      await loadTasks();
      showNotification("Task added successfully!", "success");
    } else {
      throw new Error("Failed to add task");
    }
  } catch (error) {
    console.error("Error adding task:", error);
    showNotification("Failed to add task", "error");
  }
}

// Open task modal
function openTaskModal(taskId, taskName) {
  selectedTaskId = taskId;
  modalTaskName.textContent = taskName;
  modal.style.display = "block";
}

// Handle print
async function handlePrint(includeSubtasks) {
  if (!selectedTaskId) return;

  const originalText = includeSubtasks
    ? printWithSubtasksBtn.textContent
    : printSingleBtn.textContent;
  const button = includeSubtasks ? printWithSubtasksBtn : printSingleBtn;

  button.textContent = "Printing...";
  button.disabled = true;

  try {
    const response = await fetch(`${API_URL}/print/${selectedTaskId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includeSubtasks }),
    });

    if (response.ok) {
      const result = await response.json();
      showNotification(
        includeSubtasks
          ? `Printed task with ${result.subtaskCount} subtask(s)`
          : "Task printed successfully!",
        "success"
      );
      modal.style.display = "none";
    } else {
      throw new Error("Print failed");
    }
  } catch (error) {
    console.error("Error printing:", error);
    showNotification("Failed to print task", "error");
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Handle delete task
async function handleDeleteTask() {
  if (!selectedTaskId) return;

  if (
    !confirm(
      "Are you sure you want to delete this task? This will also delete all subtasks."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tasks/${selectedTaskId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      modal.style.display = "none";
      await loadTasks();
      showNotification("Task deleted successfully!", "success");
    } else {
      throw new Error("Delete failed");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    showNotification("Failed to delete task", "error");
  }
}

// Show notification
function showNotification(message, type = "info") {
  // Simple console notification for now
  console.log(`[${type.toUpperCase()}] ${message}`);

  // You could enhance this with a toast notification library
  if (type === "error") {
    alert(message);
  }
}

// Make openTaskModal available globally
window.openTaskModal = openTaskModal;

// Initialize on page load
document.addEventListener("DOMContentLoaded", init);
