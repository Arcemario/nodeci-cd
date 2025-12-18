import express from 'express';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 3000;

const connectionString =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/appdb';
const pool = new Pool({ connectionString });

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
}

app.use(express.urlencoded({ extended: true }));

app.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM items ORDER BY id DESC');
  const itemsList = rows.map(item => `<li>${item.name}</li>`).join('');
  res.send(`
    <html>
      <head><title>App Web Simple</title></head>
      <body>
        <h1>Items</h1>
        <ul>${itemsList}</ul>
        <h2>Agregar nuevo item</h2>
        <form method="POST" action="/add">
          <input type="text" name="name" placeholder="Nombre del item" required />
          <button type="submit">Agregar</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/add', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.send('El nombre es requerido');
  await pool.query('INSERT INTO items (name) VALUES ($1)', [name]);
  res.redirect('/');
});

app.get('/delete/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.send('ID inválido');
  await pool.query('DELETE FROM items WHERE id = $1', [id]);
  res.redirect('/');
});


initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`App web simple escuchando en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error inicializando DB:', err);
    process.exit(1);
  });
