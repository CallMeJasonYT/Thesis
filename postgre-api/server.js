const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.API_PORT;

const pool = new Pool({
  user: "root",
  host: "host.docker.internal",
  database: "postgres_thesis",
  password: "root",
  port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

app.get("/api/web/overview-card-stats", async (req, res) => {
  try {
    // Fetching data from the database for player stats
    const totalPlayersQuery = `SELECT COUNT(*) FROM public."user" AS total_players`;
    const totalRoomsQuery = `SELECT COUNT(*) FROM public.level_completion`;
    const tutorialRoomStatsQuery = `
      SELECT COUNT(DISTINCT username) AS total_players, 
             ROUND(AVG(completed::int), 2) AS completion_rate, 
             ROUND(AVG("time_elapsed"), 0) AS avg_time
      FROM public.level_completion 
      WHERE level_type = 'Tutorial'`;
    const trainingRoomStatsQuery = `
      SELECT COUNT(DISTINCT username) AS total_players, 
             ROUND(AVG(completed::int), 2) AS completion_rate, 
             ROUND(AVG("time_elapsed"), 0) AS avg_time
      FROM public.level_completion 
      WHERE level_type = 'Training'`;
    const escapeRoomStatsQuery = `
      SELECT COUNT(DISTINCT username) AS total_players, 
             ROUND(AVG(completed::int), 2) AS completion_rate, 
             ROUND(AVG("time_elapsed"), 0) AS avg_time
      FROM public.level_completion 
      WHERE level_type = 'Escape Room'`;

    const totalPlayersResult = await pool.query(totalPlayersQuery);
    //const onlinePlayersResult = await client.query(onlinePlayersQuery);
    const totalRoomsResult = await pool.query(totalRoomsQuery);
    const tutorialRoomStatsResult = await pool.query(tutorialRoomStatsQuery);
    const trainingRoomStatsResult = await pool.query(trainingRoomStatsQuery);
    const escapeRoomStatsResult = await pool.query(escapeRoomStatsQuery);

    res.json({
      totalPlayers: totalPlayersResult.rows[0].count,
      totalRooms: totalRoomsResult.rows[0].count,
      //onlinePlayers: onlinePlayersResult.rows[0].count,
      tutorialRoomStats: tutorialRoomStatsResult.rows[0],
      trainingRoomStats: trainingRoomStatsResult.rows[0],
      escapeRoomStats: escapeRoomStatsResult.rows[0],
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    res.status(500).json({ error: "Failed to fetch player stats" });
  }
});

app.get("/api/web/player-table", async (req, res) => {
  try {
    const leaderboardQuery = `
    SELECT username, score AS highest_score, time_elapsed, "timestamp" 
      FROM (
          SELECT username, time_elapsed, score, "timestamp",
                RANK() OVER (PARTITION BY username ORDER BY score DESC) AS rnk
          FROM public.level_completion
          WHERE level_type = 'Escape Room'
      ) ranked
    WHERE rnk = 1
    ORDER BY highest_score DESC;`;

    const leaderboardResult = await pool.query(leaderboardQuery);

    const formattedData = leaderboardResult.rows.map((row) => ({
      ...row,
      timestamp: row.timestamp
        ? row.timestamp.toISOString().slice(0, 19).replace("T", " ")
        : null,
    }));

    res.json({ leaderboardData: formattedData });
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard data" });
  }
});

app.post("/api/player/validate", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  try {
    const result = await pool.query(
      'SELECT uuid FROM "user" WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const uuid = result.rows[0].uuid;
      console.log(uuid);
      res.json({ playerUUID: uuid });
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/api/player/uuid", async (req, res) => {
  const { username } = req.body;

  try {
    const result = await pool.query(
      'SELECT UUID FROM "user" WHERE username = $1',
      [username]
    );

    if (result.rows.length > 0) {
      const uuid = result.rows[0].id;
      res.json({ userID: uuid });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/api/player/tutorialCompletion", async (req, res) => {
  console.log("Received request body:", req.body);

  const { Checkpoint1, Checkpoint2, Checkpoint3, Checkpoint4 } = req.body;
  if (
    Checkpoint1 === undefined ||
    Checkpoint2 === undefined ||
    Checkpoint3 === undefined ||
    Checkpoint4 === undefined
  ) {
    return res.status(400).send("Missing checkpoint data");
  }

  const checkpointData = {
    Checkpoint1: Checkpoint1 !== 0 ? Checkpoint1 : null,
    Checkpoint2: Checkpoint2 !== 0 ? Checkpoint2 : null,
    Checkpoint3: Checkpoint3 !== 0 ? Checkpoint3 : null,
    Checkpoint4: Checkpoint4 !== 0 ? Checkpoint4 : null,
  };

  const allCompleted = Object.values(checkpointData).every(
    (time) => time !== null
  );
  const finished = allCompleted ? true : false;

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO tutorial_completion( id, username, Checkpoint1, Checkpoint2, Checkpoint3, Checkpoint4, finished) VALUES (DEFAULT, $1, $2, $3, $4, $5, $6)`,
      [
        user,
        checkpointData.Checkpoint1,
        checkpointData.Checkpoint2,
        checkpointData.Checkpoint3,
        checkpointData.Checkpoint4,
        finished,
      ]
    );

    await client.query("COMMIT");
    res.json({ user, finished, checkpointData });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Error during transaction", err);
    res.status(500).send("Error updating checkpoint times");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.get("/api/web/players", async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username FROM "user"');

    if (result.rows.length > 0) {
      const players = result.rows.map((player) => ({
        id: player.id,
        username: player.username,
        online: false,
        lastSeen: null,
      }));
      res.json(players);
    } else {
      res.status(404).send("No players found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
