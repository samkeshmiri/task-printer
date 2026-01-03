// Munbyn ITPP047 receipt printer configuration

import escpos from "escpos";
import usb from "usb";

// Custom USB adapter for ES modules compatibility
class USBAdapter {
  constructor(vendorId, productId) {
    const device = usb.findByIds(vendorId, productId);
    if (!device) {
      throw new Error('USB device not found');
    }
    this.device = device;
  }

  open(callback) {
    try {
      this.device.open();
      if (callback) callback(null);
    } catch (error) {
      if (callback) callback(error);
      else throw error;
    }
  }

  write(data, callback) {
    try {
      const iface = this.device.interfaces[0];
      if (iface.isKernelDriverActive()) {
        iface.detachKernelDriver();
      }
      iface.claim();
      
      const endpoint = iface.endpoints.find(e => e.direction === 'out');
      if (!endpoint) {
        const error = new Error('No output endpoint found');
        if (callback) return callback(error);
        throw error;
      }
      
      endpoint.transfer(data, callback);
    } catch (error) {
      if (callback) callback(error);
      else throw error;
    }
  }

  close(callback) {
    try {
      this.device.close();
      if (callback) callback(null);
    } catch (error) {
      if (callback) callback(error);
      else throw error;
    }
  }
}

class PrinterService {
  constructor() {
    this.device = null;
    this.printer = null;
    // 80mm paper width ≈ 48 characters in normal mode, 24 in double width
  }

  /**
   * Initialize printer connection for Munbyn ITPP047
   *
   * To find your printer's vendor/product ID if these don't work:
   * 1. Connect your printer via USB
   * 2. Run: system_profiler SPUSBDataType (macOS)
   * 3. Look for "Munbyn" or "Printer" device
   * 4. Update the IDs below
   */
  async connect() {
    try {
      // Munbyn ITPP047 - Actual USB IDs from your device
      const vendorId = 0x0483; // Your printer's vendor ID
      const productId = 0x5743; // Your printer's product ID

      console.log(
        `Attempting to connect to Munbyn ITPP047 (Vendor: 0x${vendorId.toString(
          16
        )}, Product: 0x${productId.toString(16)})...`
      );

      // Create USB device using custom adapter
      const device = new USBAdapter(vendorId, productId);
      this.device = device;
      device.open();

      // Create printer instance
      this.printer = new escpos.Printer(device);

      console.log("✓ Printer connected successfully!");
      console.log("Printer instance created:", this.printer ? "YES" : "NO");
      return true;
    } catch (error) {
      console.error("Failed to connect to printer:", error.message);
      console.log("\nTroubleshooting:");
      console.log("1. Make sure the printer is connected via USB");
      console.log("2. Check printer is powered on");
      console.log(
        '3. Run: system_profiler SPUSBDataType | grep -A 10 -i "printer\\|munbyn"'
      );
      console.log("4. Update vendor/product IDs in printer.js if needed");
      throw error;
    }
  }

  /**
   * Print a single task in large text
   * @param {string} taskName - The name of the task to print
   */
  async printTask(taskName) {
    // Mock printing to console
    const formattedTask = this._formatTaskForPrint(taskName);
    console.log(formattedTask);
    console.log("------------------------");
    console.log("=== CUT HERE ===\n");

    // Actual printer output
    if (this.printer) {
      try {
        await new Promise((resolve, _reject) => {
          // Wrap text to fit on paper (16 chars for double-width to be safe)
          const wrappedLines = this._wrapText(taskName, 16);
          
          this.printer
            .font("a")
            .align("ct")
            .style("bu")
            .size(2, 2);
          
          // Print each line
          wrappedLines.forEach(line => {
            this.printer.text(line);
          });
          
          this.printer
            .feed(4)
            .cut()
            .flush(() => {
              console.log("✓ Task printed successfully!");
              resolve();
            });
        });
      } catch (error) {
        console.error("Print error:", error);
        throw error;
      }
    } else {
      console.log("(Mock mode - printer not connected)");
    }

    return { success: true, task: taskName };
  }

  /**
   * Print multiple tasks (task + all subtasks)
   * Each subtask gets its own tearable section with large text
   * @param {Object} mainTask - The main task object
   * @param {Array} subtasks - Array of subtask objects
   */
  async printTaskWithSubtasks(mainTask, subtasks) {
    // Print main task
    console.log("MAIN TASK:");
    console.log(this._formatTaskForPrint(mainTask.name));
    console.log("------------------------");
    console.log("=== CUT HERE ===");

    // Print each subtask as its own section
    if (subtasks && subtasks.length > 0) {
      subtasks.forEach((subtask, index) => {
        console.log("");
        console.log(`SUBTASK ${index + 1}:`);
        console.log(this._formatTaskForPrint(subtask.name));
        console.log("------------------------");
        console.log("=== CUT HERE ===");
      });
    }
    console.log("");

    // Actual printer output
    if (this.printer) {
      try {
        await new Promise((resolve, reject) => {
          // Main task in large text with cut
          const mainTaskLines = this._wrapText(mainTask.name, 16);
          this.printer
            .font("a")
            .align("ct")
            .style("bu")
            .size(2, 2);
          
          mainTaskLines.forEach(line => {
            this.printer.text(line);
          });
          
          this.printer.feed(2).cut();

          // Each subtask in its own section with large text
          if (subtasks && subtasks.length > 0) {
            subtasks.forEach((subtask, index) => {
              const subtaskLines = this._wrapText(subtask.name, 16);
              this.printer
                .font("a")
                .align("ct")
                .style("bu")
                .size(2, 2);
              
              subtaskLines.forEach(line => {
                this.printer.text(line);
              });
              
              this.printer.feed(2).cut();
            });
          }

          this.printer.flush(() => {
            console.log(
              `✓ Task list printed successfully! (${subtasks.length} subtasks, each in its own section)`
            );
            resolve();
          });
        });
      } catch (error) {
        console.error("Print error:", error);
        throw error;
      }
    } else {
      console.log("(Mock mode - printer not connected)");
    }

    return {
      success: true,
      mainTask: mainTask.name,
      subtaskCount: subtasks.length,
    };
  }

  /**
   * Format task name for printing (centered, large)
   */
  _formatTaskForPrint(taskName) {
    const lines = this._wrapText(taskName, 16); // 16 chars for double-width text
    return lines
      .map((line) => {
        const padding = Math.floor((16 - line.length) / 2);
        return " ".repeat(padding) + line.toUpperCase();
      })
      .join("\n");
  }

  /**
   * Wrap text to fit within character limit
   */
  _wrapText(text, maxChars) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? currentLine + " " + word : word;
      if (testLine.length <= maxChars) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        // If single word is too long, break it
        if (word.length > maxChars) {
          let remaining = word;
          while (remaining.length > maxChars) {
            lines.push(remaining.substring(0, maxChars));
            remaining = remaining.substring(maxChars);
          }
          currentLine = remaining;
        } else {
          currentLine = word;
        }
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /**
   * Get indentation for nested tasks
   */
  _getTaskIndent(task, allTasks) {
    // Simple indentation - could be enhanced to show hierarchy
    return "  ";
  }

  /**
   * Disconnect from printer
   */
  async disconnect() {
    if (this.printer) {
      this.printer.close();
      console.log("Printer disconnected");
    }
  }
}

export default new PrinterService();
