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
            ui:           'GET  /ui',
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

// ── UI ──
app.get('/ui', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Task Manager — DevOps Capstone</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: Arial, sans-serif;
                background: #f0f4f8;
                padding: 40px 20px;
            }
            .container { max-width: 860px; margin: 0 auto; }
            header {
                background: #1F4E79;
                color: white;
                padding: 24px 30px;
                border-radius: 10px;
                margin-bottom: 30px;
            }
            header h1 { font-size: 24px; margin-bottom: 6px; }
            header p  { font-size: 13px; opacity: 0.8; }
            .stats {
                display: flex;
                gap: 16px;
                margin-bottom: 30px;
            }
            .stat-card {
                flex: 1;
                background: white;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            }
            .stat-card .number {
                font-size: 36px;
                font-weight: bold;
                color: #1F4E79;
            }
            .stat-card .label {
                font-size: 13px;
                color: #666;
                margin-top: 4px;
            }
            .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #1F4E79;
                margin-bottom: 14px;
            }
            .task-card {
                background: white;
                border-radius: 10px;
                padding: 18px 20px;
                margin-bottom: 12px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.07);
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-left: 5px solid #ccc;
            }
            .task-card.completed  { border-left-color: #28a745; }
            .task-card.in-progress { border-left-color: #2E75B6; }
            .task-card.pending    { border-left-color: #ffc107; }
            .task-title { font-size: 15px; font-weight: bold; color: #333; }
            .task-id    { font-size: 12px; color: #999; margin-top: 3px; }
            .badges { display: flex; gap: 8px; align-items: center; }
            .badge {
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 12px;
                color: white;
                font-weight: bold;
            }
            .badge.high     { background: #dc3545; }
            .badge.medium   { background: #fd7e14; }
            .badge.low      { background: #28a745; }
            .badge.completed  { background: #28a745; }
            .badge.in-progress { background: #2E75B6; }
            .badge.pending    { background: #ffc107; color: #333; }
            .pipeline {
                background: white;
                border-radius: 10px;
                padding: 20px 24px;
                margin-top: 30px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.07);
            }
            .pipeline-steps {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                margin-top: 14px;
            }
            .step {
                background: #1F4E79;
                color: white;
                padding: 8px 14px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: bold;
            }
            .arrow { color: #1F4E79; font-size: 18px; font-weight: bold; }
            .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #999;
            }
            .loading { text-align: center; color: #666; padding: 40px; }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>🚀 Task Manager — DevOps Capstone Project</h1>
                <p>Node.js REST API | Jenkins CI/CD | Docker | AWS EC2 | SonarQube | Prometheus & Grafana</p>
            </header>

            <div class="stats" id="stats">
                <div class="loading">Loading tasks...</div>
            </div>

            <div class="section-title">📋 All Tasks</div>
            <div id="tasks"><div class="loading">Loading...</div></div>

            <div class="pipeline">
                <div class="section-title">⚙️ CI/CD Pipeline</div>
                <div class="pipeline-steps">
                    <div class="step">GitHub</div>
                    <div class="arrow">→</div>
                    <div class="step">Jenkins</div>
                    <div class="arrow">→</div>
                    <div class="step">SonarQube</div>
                    <div class="arrow">→</div>
                    <div class="step">Docker Hub</div>
                    <div class="arrow">→</div>
                    <div class="step">AWS EC2</div>
                    <div class="arrow">→</div>
                    <div class="step">Prometheus</div>
                    <div class="arrow">→</div>
                    <div class="step">Grafana</div>
                </div>
            </div>

            <div class="footer">
                DevOps Capstone Project | Pavithra | April 2026
            </div>
        </div>

        <script>
            fetch('/tasks')
                .then(r => r.json())
                .then(data => {
                    const tasks = data.tasks;
                    const completed  = tasks.filter(t => t.status === 'completed').length;
                    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
                    const pending    = tasks.filter(t => t.status === 'pending').length;

                    document.getElementById('stats').innerHTML = \`
                        <div class="stat-card">
                            <div class="number">\${tasks.length}</div>
                            <div class="label">Total Tasks</div>
                        </div>
                        <div class="stat-card">
                            <div class="number" style="color:#28a745">\${completed}</div>
                            <div class="label">Completed</div>
                        </div>
                        <div class="stat-card">
                            <div class="number" style="color:#2E75B6">\${inProgress}</div>
                            <div class="label">In Progress</div>
                        </div>
                        <div class="stat-card">
                            <div class="number" style="color:#ffc107">\${pending}</div>
                            <div class="label">Pending</div>
                        </div>
                    \`;

                    document.getElementById('tasks').innerHTML = tasks.map(t => \`
                        <div class="task-card \${t.status}">
                            <div>
                                <div class="task-title">\${t.title}</div>
                                <div class="task-id">Task #\${t.id}</div>
                            </div>
                            <div class="badges">
                                <span class="badge \${t.priority}">\${t.priority}</span>
                                <span class="badge \${t.status}">\${t.status}</span>
                            </div>
                        </div>
                    \`).join('');
                })
                .catch(() => {
                    document.getElementById('tasks').innerHTML = 
                        '<div class="loading">Failed to load tasks.</div>';
                });
        </script>
    </body>
    </html>
    `);
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
    const task = tasks.find(t => t.id === Number.parseInt(req.params.id));
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
    const task = tasks.find(t => t.id === Number.parseInt(req.params.id));
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
    const index = tasks.findIndex(t => t.id === Number.parseInt(req.params.id));
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