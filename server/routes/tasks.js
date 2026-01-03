import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Get all root tasks (no parent)
router.get('/tasks', (_req, res) => {
  const tasks = db.db.prepare('SELECT * FROM tasks WHERE parent_id IS NULL ORDER BY order_index').all();
  res.json(tasks);
});

// Get task by ID with its children
router.get('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json(task);
});

// Get all subtasks of a task
router.get('/tasks/:id/children', (req, res) => {
  const { id } = req.params;
  const children = db.prepare('SELECT * FROM tasks WHERE parent_id = ? ORDER by order_index').all(id);
  res.json(children);
});

// Get task tree (recursive)
function getTaskTree(parentId = null) {
  const tasks = db.prepare('SELECT * FROM tasks WHERE parent_id IS ? ORDER BY order_index').all(parentId);
  
  return tasks.map(task => ({
    ...task,
    children: getTaskTree(task.id)
  }));
}

router.get('/tasks-tree', (req, res) => {
  const tree = getTaskTree(null);
  res.json(tree);
});

// Get all descendants of a task (for printing)
function getAllDescendants(taskId) {
  const children = db.prepare('SELECT * FROM tasks WHERE parent_id = ? ORDER BY order_index').all(taskId);
  let descendants = [...children];
  
  children.forEach(child => {
    descendants = descendants.concat(getAllDescendants(child.id));
  });
  
  return descendants;
}

router.get('/tasks/:id/descendants', (req, res) => {
  const { id } = req.params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const descendants = getAllDescendants(id);
  res.json({ task, descendants });
});

// Create new task
router.post('/tasks', (req, res) => {
  const { name, parent_id } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Task name is required' });
  }
  
  // Get the max order_index for siblings
  const maxOrder = db.prepare(
    'SELECT COALESCE(MAX(order_index), -1) as max_order FROM tasks WHERE parent_id IS ?'
  ).get(parent_id || null);
  
  const result = db.prepare('INSERT INTO tasks (name, parent_id, order_index) VALUES (?, ?, ?)').run(
    name,
    parent_id || null,
    maxOrder.max_order + 1
  );
  
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newTask);
});

// Update task
router.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { name, parent_id, order_index } = req.body;
  
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const updates = [];
  const values = [];
  
  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  
  if (parent_id !== undefined) {
    updates.push('parent_id = ?');
    values.push(parent_id || null);
  }
  
  if (order_index !== undefined) {
    updates.push('order_index = ?');
    values.push(order_index);
  }
  
  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  
  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(updatedTask);
});

// Delete task
router.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.json({ message: 'Task deleted successfully' });
});

export default router;
