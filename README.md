# Task Printer

A receipt printer app for printing and tracking tasks. Print individual tasks or entire task lists with subtasks on receipt paper to track your progress!

## Features

- 📋 Hierarchical task management (tasks with unlimited subtasks)
- 🖨️ Print individual tasks in large text
- 📝 Print entire task lists with subtasks
- 💾 In-memory SQLite database (easily upgradeable to persistent storage)
- 🎨 Clean, modern UI
- 🌳 Visual task tree representation

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the application:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

## Usage

### Managing Tasks

- **Add a task:** Enter a task name and optionally select a parent task
- **View tasks:** Tasks are displayed in a hierarchical tree structure
- **Click on any task** to open the print/delete menu

### Printing

When you click on a task, you have two options:
1. **Print This Task Only** - Prints just the task name in large text (perfect for pinning to a board)
2. **Print With All Subtasks** - Prints the main task and all its subtasks (great for comprehensive lists)

### Connecting Your Munbyn ITPP047 Printer

The app is configured for the **Munbyn ITPP047** thermal receipt printer. To connect:

1. **Connect your printer via USB** and power it on

2. **Find your printer's USB IDs** (if the default doesn't work):
   ```bash
   ./find-printer.sh
   ```
   Or manually:
   ```bash
   system_profiler SPUSBDataType | grep -B 3 -A 10 -i "munbyn"
   ```

3. **Update printer IDs if needed** in `server/printer/printer.js`:
   ```javascript
   const vendorId = 0x0DD4;  // Your vendor ID
   const productId = 0x0006; // Your product ID
   ```

4. **Restart the server:**
   ```bash
   npm start
   ```

The server will automatically attempt to connect to the printer on startup. If it fails, the app continues in mock mode (console output only).

## Technologies Used

- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **Printer:** Munbyn ITPP047 - ESC/POS protocol
- **Frontend:** Vanilla JavaScript, HTML5, CSS3

## Project Structure

```
task-printer/
├── server/
│   ├── index.js           # Express server
│   ├── db.js              # SQLite database setup
│   ├── routes/
│   │   └── tasks.js       # Task CRUD endpoints
│   └── printer/
│       └── printer.js     # Printer service
├── public/
│   ├── index.html         # UI
│   ├── styles.css         # Styling
│   └── app.js             # Frontend JavaScript
├── package.json
└── README.md
```

## API Endpoints

- `GET /api/tasks` - Get all root tasks
- `GET /api/tasks/:id` - Get specific task
- `GET /api/tasks/:id/children` - Get task's children
- `GET /api/tasks-tree` - Get complete task tree
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/print/:id` - Print task (with optional subtasks)

## Receipt Printer Specifications

- Paper width: 80mm (79.5±0.5mm)
- Print speed: 200mm/sec
- Format: ESC/POS protocol

## Future Enhancements

- [ ] Persistent database (switch from in-memory to file-based)
- [ ] Task completion tracking
- [ ] Statistics and progress visualization
- [ ] Task import/export
- [ ] Multiple printer profiles
- [ ] Custom print templates
- [ ] Task scheduling/reminders

## Development

Run in development mode with auto-restart:
```bash
npm run dev
```

## License

ISC
