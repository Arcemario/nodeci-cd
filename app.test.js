import request from 'supertest';
import { app, pool, initDb } from './app.js';

beforeAll(async () => {
  await initDb();
});

afterAll(async () => {
  await pool.end();
});

describe('Endpoints de la API', () => {
  it('GET / debería responder con HTML', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('<h1>Items</h1>');
  });

  it('POST /add debería insertar un item y redireccionar', async () => {
    const res = await request(app)
      .post('/add')
      .send('name=TestItem');
    expect(res.statusCode).toEqual(302);
  });
});