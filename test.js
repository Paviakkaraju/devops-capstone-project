const request = require('supertest');
const app = require('./app');

describe('Task Manager API Tests', () => {

    // ── Root ──
    describe('GET /', () => {
        test('should return API info with all endpoints listed', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body.app).toBe('Task Manager API');
            expect(res.body.version).toBe('1.0.0');
            expect(res.body.endpoints).toBeDefined();
        });
    });

    // ── Health ──
    describe('GET /health', () => {
        test('should return healthy status with uptime and timestamp', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('healthy');
            expect(res.body.uptime).toBeDefined();
            expect(res.body.timestamp).toBeDefined();
        });
    });

    // ── Get All Tasks ──
    describe('GET /tasks', () => {
        test('should return all tasks with total count', async () => {
            const res = await request(app).get('/tasks');
            expect(res.statusCode).toBe(200);
            expect(res.body.total).toBeDefined();
            expect(Array.isArray(res.body.tasks)).toBe(true);
        });
    });

    // ── Get Task by ID ──
    describe('GET /tasks/:id', () => {
        test('should return a task by valid ID', async () => {
            const res = await request(app).get('/tasks/1');
            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.title).toBeDefined();
        });

        test('should return 404 for non-existent task', async () => {
            const res = await request(app).get('/tasks/9999');
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Task not found');
        });
    });

    // ── Get Tasks by Status ──
    describe('GET /tasks/status/:status', () => {
        test('should return tasks filtered by valid status', async () => {
            const res = await request(app).get('/tasks/status/completed');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.tasks)).toBe(true);
            res.body.tasks.forEach(t => expect(t.status).toBe('completed'));
        });

        test('should return 400 for invalid status', async () => {
            const res = await request(app).get('/tasks/status/invalid');
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });
    });

    // ── Create Task ──
    describe('POST /tasks', () => {
        test('should create a new task with title and priority', async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ title: 'Write unit tests', priority: 'high' });
            expect(res.statusCode).toBe(201);
            expect(res.body.id).toBeDefined();
            expect(res.body.title).toBe('Write unit tests');
            expect(res.body.status).toBe('pending');
            expect(res.body.priority).toBe('high');
        });

        test('should return 400 if title is missing', async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ priority: 'low' });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Title is required');
        });

        test('should return 400 for invalid priority', async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ title: 'Test task', priority: 'critical' });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });
    });

    // ── Update Task ──
    describe('PUT /tasks/:id', () => {
        test('should update task status successfully', async () => {
            const res = await request(app)
                .put('/tasks/1')
                .send({ status: 'in-progress' });
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('in-progress');
        });

        test('should return 404 for non-existent task update', async () => {
            const res = await request(app)
                .put('/tasks/9999')
                .send({ status: 'completed' });
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Task not found');
        });

        test('should return 400 for invalid status on update', async () => {
            const res = await request(app)
                .put('/tasks/1')
                .send({ status: 'done' });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Invalid status');
        });
    });

    // ── Delete Task ──
    describe('DELETE /tasks/:id', () => {
        test('should delete an existing task', async () => {
            const res = await request(app).delete('/tasks/2');
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Task deleted');
            expect(res.body.task.id).toBe(2);
        });

        test('should return 404 when deleting non-existent task', async () => {
            const res = await request(app).delete('/tasks/9999');
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Task not found');
        });
    });

});