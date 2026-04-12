const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory task store
let tasks = [
    { id: 1, title: 'Setup Jenkins Pipeline', status: 'completed', priority: 'high' },
    { id: 2, title: 'Configure SonarQube', status: 'completed', priority: 'high' },
    { id: 3, title: 'Deploy to AWS EC2', status: 'in-progress', priority: 'medium' },
];
let nextId = 4;

// ── Root ──
app.get('/', (req, res) => {
    res.json({
        app: 'Task Manager API',
        version: '1.0.0',
        description: 'A DevOps Capstone Project — Node.js REST API with CI/CD Pipeline',
        endpoints: {
            health:       'GET  /health',
            getAllTasks:   'GET  /tasks',
            getTask:      'GET  /tasks/:id',
            createTask:   'POST /tasks',
            updateTask:   'PUT  /tasks/:id',
            deleteTask:   'DELETE /tasks/:id',
            getByStatus:  'GET  /tasks/status/:status',
        }
    });
});

// ── Health Check ──
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ── Get All Tasks ──
app.get('/tasks', (req, res) => {
    res.json({
        total: tasks.length,
        tasks
    });
});

// ── Get Task by ID ──
app.get('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
});

// ── Get Tasks by Status ──
app.get('/tasks/status/:status', (req, res) => {
    const validStatuses = ['pending', 'in-progress', 'completed'];
    const { status } = req.params;
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Use: pending, in-progress, completed' });
    }
    const filtered = tasks.filter(t => t.status === status);
    res.json({ total: filtered.length, tasks: filtered });
});

// ── Create Task ──
app.post('/tasks', (req, res) => {
    const { title, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    const task = {
        id: nextId++,
        title,
        status: 'pending',
        priority: priority || 'medium'
    };
    tasks.push(task);
    res.status(201).json(task);
});

// ── Update Task ──
app.put('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const validStatuses = ['pending', 'in-progress', 'completed'];
    const validPriorities = ['low', 'medium', 'high'];

    if (req.body.status && !validStatuses.includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    if (req.body.priority && !validPriorities.includes(req.body.priority)) {
        return res.status(400).json({ error: 'Invalid priority' });
    }

    if (req.body.title)    task.title    = req.body.title;
    if (req.body.status)   task.status   = req.body.status;
    if (req.body.priority) task.priority = req.body.priority;

    res.json(task);
});

// ── Delete Task ──
app.delete('/tasks/:id', (req, res) => {
    const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Task not found' });
    const deleted = tasks.splice(index, 1);
    res.json({ message: 'Task deleted', task: deleted[0] });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Task Manager API running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

module.exports = app;