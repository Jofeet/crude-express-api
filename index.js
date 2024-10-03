const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); 

const { Pool } = require('pg');
const pool = new Pool({
    user: 'your_db_user',
    host: 'your_db_host',
    database: 'crud_api_db',
    password: 'your_db_password',
    port: 5432,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1); 
});

app.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM Users');
    res.json(rows); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM Users WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User  not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users', async (req, res) => {
  const { firstname, lastname, is_admin } = req.body; 
  try {
    const { rows } = await pool.query(
      'INSERT INTO Users (firstname, lastname, is_admin) VALUES ($1, $2, $3) RETURNING *',
      [firstname, lastname, is_admin]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, is_admin } = req.body; 
  try {
    const { rows } = await pool.query(
      'UPDATE Users SET firstname = $1, lastname = $2, is_admin = $3 WHERE id = $4 RETURNING *',
      [firstname, lastname, is_admin, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User  not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM Users WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User  not found' });
    }
    res.json({ message: 'User  deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});