import express from 'express';
import pkg from 'pg';

const { Pool } = pkg;
export const app = express(); // Exportamos la app para el test
const port = process.env.PORT || 3000;

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/appdb';
export const pool = new Pool({ connectionString });

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
}

app.use(express.urlencoded({ extended: true }));

app.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY id DESC');
    const itemsList = rows.map(item => `<li>${item.name}</li>`).join('');
    res.send(`
      <html>
        <body>
          <h1>Items</h1>
          <ul>${itemsList}</ul>
          <form method="POST" action="/add">
            <input type="text" name="name" required />
            <button type="submit">Agregar</button>
          </form>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error en la base de datos');
  }
});

app.post('/add', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send('El nombre es requerido');
  await pool.query('INSERT INTO items (name) VALUES ($1)', [name]);
  res.redirect('/');
});

// Arrancar solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  initDb().then(() => {
    app.listen(port, () => {
      console.log(`Servidor en http://localhost:${port}`);
    });
  }).catch(err => {
    console.error('Error inicializando DB:', err);
    process.exit(1);
  });
}