import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import taskRoutes from './routes/tasks.js';
import printerService from './printer/printer.js';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', taskRoutes);

// Print endpoints
app.post('/api/print/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { includeSubtasks } = req.body;
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (includeSubtasks) {
      // Get all descendants
      const getAllDescendants = (taskId) => {
        const children = db.prepare('SELECT * FROM tasks WHERE parent_id = ? ORDER BY order_index').all(taskId);
        let descendants = [...children];
        
        children.forEach(child => {
          descendants = descendants.concat(getAllDescendants(child.id));
        });
        
        return descendants;
      };
      
      const subtasks = getAllDescendants(id);
      const result = await printerService.printTaskWithSubtasks(task, subtasks);
      res.json(result);
    } else {
      const result = await printerService.printTask(task.name);
      res.json(result);
    }
  } catch (error) {
    console.error('Print error:', error);
    res.status(500).json({ error: 'Failed to print task' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Task Printer API is running' });
});

// Initialize printer connection on startup
async function initializePrinter() {
  try {
    await printerService.connect();
  } catch (error) {
    console.log('\n Printer connection failed - running in mock mode');
    console.log('The app will still work, but printing will only show in console\n');
  }
}

app.listen(PORT, async () => {
  console.log(`Task Printer server running on http://localhost:${PORT}`);
  console.log('Open your browser to start managing and printing tasks!');
  console.log('\nInitializing printer connection...');
  await initializePrinter();
});
