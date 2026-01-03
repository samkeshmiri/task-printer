import Database from 'better-sqlite3';

// Initialize in-memory database
const db = new Database(':memory:');

// Create tasks table with hierarchical structure
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE
  );

  CREATE INDEX idx_parent_id ON tasks(parent_id);
`);

// Insert some sample data
const insertTask = db.prepare('INSERT INTO tasks (name, parent_id, order_index) VALUES (?, ?, ?)');

// Root tasks
const cleanHouse = insertTask.run('Clean the house', null, 0);
const workTasks = insertTask.run('Work tasks', null, 1);
const exercise = insertTask.run('Exercise routine', null, 2);

// Clean house subtasks
const cleanBedroom = insertTask.run('Clean bedroom', cleanHouse.lastInsertRowid, 0);
const cleanKitchen = insertTask.run('Clean kitchen', cleanHouse.lastInsertRowid, 1);
const cleanBathroom = insertTask.run('Clean bathroom', cleanHouse.lastInsertRowid, 2);

// Clean bedroom subtasks
insertTask.run('Make bed', cleanBedroom.lastInsertRowid, 0);
insertTask.run('Vacuum floor', cleanBedroom.lastInsertRowid, 1);
insertTask.run('Organize closet', cleanBedroom.lastInsertRowid, 2);

// Clean kitchen subtasks
insertTask.run('Wash dishes', cleanKitchen.lastInsertRowid, 0);
insertTask.run('Wipe counters', cleanKitchen.lastInsertRowid, 1);
insertTask.run('Mop floor', cleanKitchen.lastInsertRowid, 2);

// Exercise subtasks
insertTask.run('Warm up', exercise.lastInsertRowid, 0);
insertTask.run('Cardio', exercise.lastInsertRowid, 1);
insertTask.run('Strength training', exercise.lastInsertRowid, 2);
insertTask.run('Cool down', exercise.lastInsertRowid, 3);

console.log('Database initialized with sample tasks');

export default db;
