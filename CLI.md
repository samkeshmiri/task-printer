# Task Printer CLI

Quick command-line printing for your receipt printer.

## Installation

```bash
cd /path/to/task-printer
npm link
```

## Usage

### Basic Printing
```bash
# Print a single task
tprint "Buy groceries"

# Print multiple tasks (each becomes a separate slip)
tprint "Buy groceries" "Walk the dog" "Finish report"
```

### Task Separation
Each argument is treated as a **separate task** that gets printed on its own receipt slip:

- `tprint "Task 1" "Task 2" "Task 3"` → 3 separate printouts
- Tasks are printed sequentially with a small delay between them
- Each task gets its own tearable receipt slip

### Examples

```bash
# Daily tasks
tprint "Morning workout" "Check emails" "Team meeting at 2pm"

# Shopping list (each item separate)
tprint "Milk" "Bread" "Eggs" "Apples"

# Work tasks
tprint "Review PR #123" "Update documentation" "Fix bug in auth module"
```

### Options

```bash
tprint --help     # Show help information
tprint -h         # Show help information  
```

## Features

- **Multiple task printing**: Each argument = separate printed slip
- **Auto-connect**: Automatically connects to Munbyn ITPP047 printer
- **Mock mode**: Works without printer for testing
- **Error handling**: Graceful failure for individual tasks
- **Progress feedback**: Shows status for each task
- **Interrupt handling**: Ctrl+C safely disconnects printer

## Integration with Notion

Perfect for printing tasks from Notion via automation:

```bash
# From a Notion automation/webhook
tprint "$(notion-query --today)"

# Or pipe from other sources
echo "Important task" | xargs tprint
```