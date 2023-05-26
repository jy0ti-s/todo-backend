const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'todos',
  password: 'password',
  port: 5432, // default PostgreSQL port
});

const app = express();

// Parse JSON request bodies
app.use(express.json());
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE',
  );
  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type',
  );
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

// GET all todos
app.get('/todos', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM todos');
    const todos = result.rows;
    client.release();
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// POST a new todo
app.post('/todos', async (req, res) => {
  const { title, description, priority, category, deadline } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO todos (title, description, priority, category, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, priority, category, deadline],
    );
    const newTodo = result.rows[0];
    client.release();
    res.json(newTodo);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// PATCH a new todo
app.patch('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const client = await pool.connect();
    await client.query('UPDATE todos SET completed = $1 WHERE id = $2', [
      completed,
      id,
    ]);
    client.release();
    res.status(200).json({ message: 'Todo updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// DELETE a new todo
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM todos WHERE id = $1', [id]);
    client.release();
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(3001, () => {
  console.log('Server started on port 3001');
});
