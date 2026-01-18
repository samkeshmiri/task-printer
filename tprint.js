#!/usr/bin/env node

/**
 * tprint - Command Line Task Printer
 *
 * Usage:
 *   tprint "Buy groceries"
 *   tprint "Buy groceries" "Walk the dog" "Finish report"
 *   tprint --help
 */

import printerService from "./server/printer/printer.js";

// Get command line arguments (skip 'node' and script name)
const tasks = process.argv.slice(2);

// Help text
function showHelp() {
  console.log(`\n🖨️  Task Printer CLI\n`);
  console.log("Usage:");
  console.log('  tprint "<task name>"                    Print a single task');
  console.log('  tprint "<task1>" "<task2>" "<task3>"    Print multiple tasks');
  console.log("  tprint --help                          Show this help\n");
  console.log("Examples:");
  console.log('  tprint "Buy groceries"');
  console.log('  tprint "Buy groceries" "Walk the dog" "Finish report"');
  console.log("\n📋 Each argument will be printed as a separate task slip.\n");
}

// Main function
async function main() {
  // Handle help or no arguments
  if (tasks.length === 0 || tasks.includes("--help") || tasks.includes("-h")) {
    showHelp();
    return;
  }

  console.log(`\n🖨️  Preparing to print ${tasks.length} task(s)...`);

  try {
    // Try to connect to printer
    await printerService.connect();
    console.log("Printer connected");
  } catch (error) {
    console.log("Printer not available - using mock mode\n");
  }

  // Print each task
  for (let i = 0; i < tasks.length; i++) {
    const taskName = tasks[i].trim();
    await printerService.printTask(taskName);

    if (i < tasks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  await printerService.disconnect();
  process.exit(0);
}

// Handle process termination gracefully
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Printing interrupted by user");
  await printerService.disconnect();
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.error("\n❌ Fatal error:", error.message);
  process.exit(1);
});
