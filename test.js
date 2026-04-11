const request = require('supertest');
const app = require('./app');

describe('App Tests', () => {

    test('GET / should return welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Hello from Node.js CI/CD Pipeline!');
        expect(res.body.status).toBe('running');
    });

    test('GET /health should return healthy status', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('healthy');
    });

});