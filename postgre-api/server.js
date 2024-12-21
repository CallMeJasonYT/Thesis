const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3030;

const pool = new Pool({
  user: 'root',
  host: '173.18.0.4',
  database: 'postgres_thesis',
  password: 'root',
  port: 5432,
});

let user = "testuser";

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
      user = result.rows[0].username;
      res.json({ playerId, username: result.rows[0].username });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.post('/api/player/tutorialCompletion', async (req, res) => {
  console.log('Received request body:', req.body);

  const { Checkpoint1, Checkpoint2, Checkpoint3, Checkpoint4 } = req.body;
  if (Checkpoint1 === undefined || Checkpoint2 === undefined || Checkpoint3 === undefined || Checkpoint4 === undefined) {
    return res.status(400).send('Missing checkpoint data');
  }

  const checkpointData = {
    Checkpoint1: Checkpoint1 !== 0 ? Checkpoint1 : null,
    Checkpoint2: Checkpoint2 !== 0 ? Checkpoint2 : null,
    Checkpoint3: Checkpoint3 !== 0 ? Checkpoint3 : null,
    Checkpoint4: Checkpoint4 !== 0 ? Checkpoint4 : null,
  };

  const allCompleted = Object.values(checkpointData).every(time => time !== null);
  const finished = allCompleted ? true : false;

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO tutorial_completion( id, username, Checkpoint1, Checkpoint2, Checkpoint3, Checkpoint4, finished) VALUES (DEFAULT, $1, $2, $3, $4, $5, $6)`,
      [
        user,
        checkpointData.Checkpoint1,
        checkpointData.Checkpoint2,
        checkpointData.Checkpoint3,
        checkpointData.Checkpoint4,
        finished
      ]
    );

    await client.query('COMMIT');
    res.json({ user, finished, checkpointData });

  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error during transaction', err);
    res.status(500).send('Error updating checkpoint times');
  } finally {
    if (client) {
      client.release();
    }
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
