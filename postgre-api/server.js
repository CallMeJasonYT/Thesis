const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3030;

const pool = new Pool({
  user: 'root',
  host: '173.18.0.4',
  database: 'postgres',
  password: 'root',
  port: 5432,
});

app.use(cors());
app.use(express.json());

app.post('/api/player/validate', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  
  try {
    const result = await pool.query(
      'SELECT id FROM "user" WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const playerId = result.rows[0].id;
      res.json({ playerId, username: result.rows[0].username });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.get('/api/players', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username FROM "user"');
    
    if (result.rows.length > 0) {
      const players = result.rows.map(player => ({
        id: player.id,
        username: player.username,
        online: false,
        lastSeen: null,
      }));
      res.json(players);
    } else {
      res.status(404).send('No players found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
