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
             ROUND(AVG(completed::int)*100, 2) AS completion_rate, 
             ROUND(AVG("time_elapsed"), 0) AS avg_time
      FROM public.level_completion 
      WHERE level_type = 'Tutorial'`;
    const trainingRoomStatsQuery = `
      SELECT COUNT(DISTINCT username) AS total_players, 
             ROUND(AVG(completed::int)*100, 2) AS completion_rate, 
             ROUND(AVG("time_elapsed"), 0) AS avg_time
      FROM public.level_completion 
      WHERE level_type = 'Training'`;
    const escapeRoomStatsQuery = `
      SELECT COUNT(DISTINCT username) AS total_players, 
             ROUND(AVG(completed::int)*100, 2) AS completion_rate, 
             ROUND(AVG("time_elapsed"), 0) AS avg_time
      FROM public.level_completion 
      WHERE level_type = 'Escape Room'`;

    const totalPlayersResult = await pool.query(totalPlayersQuery);
    const totalRoomsResult = await pool.query(totalRoomsQuery);
    const tutorialRoomStatsResult = await pool.query(tutorialRoomStatsQuery);
    const trainingRoomStatsResult = await pool.query(trainingRoomStatsQuery);
    const escapeRoomStatsResult = await pool.query(escapeRoomStatsQuery);

    res.json({
      totalPlayers: totalPlayersResult.rows[0].count,
      totalRooms: totalRoomsResult.rows[0].count,
      tutorialRoomStats: tutorialRoomStatsResult.rows[0],
      trainingRoomStats: trainingRoomStatsResult.rows[0],
      escapeRoomStats: escapeRoomStatsResult.rows[0],
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    res.status(500).json({ error: "Failed to fetch player stats" });
  }
});

app.get("/api/web/leaderboard-table", async (req, res) => {
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

app.get("/api/web/groups", async (req, res) => {
  try {
    const groupQuery = `
    SELECT DISTINCT u."group" FROM "user" u 
    WHERE u."group" IS NOT NULL
    ORDER BY u."group" ASC`;

    const groupResult = await pool.query(groupQuery);
    res.json({
      groupData: groupResult.rows,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

app.get("/api/web/player-table", async (req, res) => {
  try {
    const playerQuery = `
    SELECT DISTINCT u."username", 
           TO_CHAR(lc."timestamp", 'FMMonth DD, YYYY HH12:MI:SS AM') AS "lastPlayed", 
           u."group"
    FROM "user" u
    INNER JOIN "level_completion" lc 
        ON lc."username" = u."username"
    WHERE lc."timestamp" = (
        SELECT MAX(lc2."timestamp") 
        FROM "level_completion" lc2
        WHERE lc2."username" = u."username") 
    AND u."group" IS NOT NULL;`;

    const playerResult = await pool.query(playerQuery);
    res.json({
      playerData: playerResult.rows,
    });
  } catch (error) {
    console.error("Error fetching player data:", error);
    res.status(500).json({ error: "Failed to fetch player data" });
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

app.post("/api/web/levelStats", async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Start date and end date are required." });
  }

  // Convert dates to ISO format for SQL query comparison
  const startDateISO = new Date(startDate).toISOString();
  const endDateISO = new Date(endDate).toISOString();

  try {
    const tutorialRoomStatsQuery = `
      SELECT 
        TO_CHAR("timestamp", 'DD/MM/YYYY') AS date, 
        COUNT(DISTINCT username) AS total_players, 
        ROUND(AVG(completed::int)*100, 2) AS completion_rate, 
        ROUND(AVG("time_elapsed"), 0) AS avg_time
      FROM public.level_completion 
      WHERE level_type = 'Tutorial'
        AND "timestamp" BETWEEN $1 AND $2
      GROUP BY TO_CHAR("timestamp", 'DD/MM/YYYY')
      ORDER BY date;`;

    const trainingRoomStatsQuery = `
      SELECT 
        TO_CHAR("timestamp", 'DD/MM/YYYY') AS date, 
        COUNT(DISTINCT username) AS total_players, 
        ROUND(AVG(completed::int)*100, 2) AS completion_rate, 
        ROUND(AVG("time_elapsed"), 0) AS avg_time
      FROM public.level_completion 
      WHERE level_type = 'Training'
        AND "timestamp" BETWEEN $1 AND $2
      GROUP BY TO_CHAR("timestamp", 'DD/MM/YYYY')
      ORDER BY date;`;

    const escapeRoomStatsQuery = `
      SELECT 
        TO_CHAR("timestamp", 'DD/MM/YYYY') AS date, 
        COUNT(DISTINCT username) AS total_players, 
        ROUND(AVG(completed::int)*100, 2) AS completion_rate, 
        ROUND(AVG("time_elapsed"), 0) AS avg_time
      FROM public.level_completion 
      WHERE level_type = 'Escape Room'
        AND "timestamp" BETWEEN $1 AND $2
      GROUP BY TO_CHAR("timestamp", 'DD/MM/YYYY')
      ORDER BY date;`;

    // Execute all the queries
    const tutorialRoomStats = await pool.query(tutorialRoomStatsQuery, [
      startDateISO,
      endDateISO,
    ]);
    const trainingRoomStats = await pool.query(trainingRoomStatsQuery, [
      startDateISO,
      endDateISO,
    ]);
    const escapeRoomStats = await pool.query(escapeRoomStatsQuery, [
      startDateISO,
      endDateISO,
    ]);

    // Format the result
    const result = {
      tutorial: tutorialRoomStats.rows,
      training: trainingRoomStats.rows,
      escapeRoom: escapeRoomStats.rows,
    };

    // Send the stats data as the response
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error fetching stats from the database." });
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
