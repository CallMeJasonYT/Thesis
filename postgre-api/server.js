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

// Corrected
app.get("/api/web/overview-card-stats", async (req, res) => {
  try {
    const totalPlayersQuery = `SELECT COUNT(*) FROM public.users AS total_players`;
    const totalGamesQuery = `SELECT COUNT(*) FROM public.level_completion`;
    const roomStatsQuery = `
      SELECT 
    l.level_name,
    COUNT(DISTINCT lc.user_id) AS total_players,
    ROUND((COUNT(*) FILTER (WHERE lc.level_completed = TRUE) * 100.0) / COUNT(*)) AS completion_rate,
    ROUND(AVG(lc.total_elapsed_time)) AS avg_time
    FROM public.level_completion lc
    JOIN public.levels l ON lc.level_id = l.level_id
    GROUP BY l.level_name, lc.level_id;`;

    const totalPlayersResult = await pool.query(totalPlayersQuery);
    const totalGamesResult = await pool.query(totalGamesQuery);
    const roomStatsResult = await pool.query(roomStatsQuery);

    res.json({
      totalPlayers: totalPlayersResult.rows[0].count,
      totalRooms: totalGamesResult.rows[0].count,
      roomStats: roomStatsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    res.status(500).json({ error: "Failed to fetch player stats" });
  }
});

// Corrected
app.get("/api/web/groups", async (req, res) => {
  try {
    const groupQuery = `
    SELECT DISTINCT u.group_name FROM public.users u 
    WHERE u.group_name IS NOT NULL
    ORDER BY u.group_name ASC`;

    const groupResult = await pool.query(groupQuery);
    res.json({
      groupData: groupResult.rows,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// Corrected
app.get("/api/web/player-table", async (req, res) => {
  try {
    const playerQuery = `
    SELECT DISTINCT ON (u.uuid) 
       u.username, 
       TO_CHAR(lc.level_timestamp, 'FMMonth DD, YYYY HH12:MI:SS AM') AS last_played, 
       u.group_name
    FROM public.users u
    JOIN public.level_completion lc 
        ON lc.user_id = u.uuid
    WHERE u.group_name IS NOT NULL
    ORDER BY u.uuid, lc.level_timestamp DESC`;

    const playerResult = await pool.query(playerQuery);
    res.json({
      playerData: playerResult.rows,
    });
  } catch (error) {
    console.error("Error fetching player data:", error);
    res.status(500).json({ error: "Failed to fetch player data" });
  }
});

// Corrected
app.post("/api/player/validate", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  try {
    const result = await pool.query(
      "SELECT uuid FROM public.users WHERE username = $1 AND password = $2",
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

// Corrected
app.post("/api/web/GrouplevelStats", async (req, res) => {
  const { startDate, endDate, group } = req.body;

  if (!startDate || !endDate || !group) {
    return res
      .status(400)
      .json({ error: "Start date and end date are required." });
  }

  const startDateISO = new Date(startDate).toISOString();
  const endDateISO = new Date(endDate).toISOString();

  try {
    const groupLevelStatsQuery = `
    SELECT 
      TO_CHAR(lc.level_timestamp, 'DD/MM/YYYY') AS date, 
      u.username, 
      l.level_name, 
      ROUND(AVG(lc.total_elapsed_time), 0) AS avg_time
    FROM public.level_completion lc
      JOIN public.users u ON lc.user_id = u.uuid
      JOIN public.levels l ON lc.level_id = l.level_id
    WHERE u.group_name = $1
    AND lc.level_timestamp BETWEEN $2 AND $3
    GROUP BY date, u.username, l.level_name
    ORDER BY date, l.level_name, avg_time`;

    const groupLevelResults = await pool.query(groupLevelStatsQuery, [
      group,
      startDateISO,
      endDateISO,
    ]);

    const result = { groupLevelStats: groupLevelResults.rows };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error fetching stats from the database." });
  }
});

app.post("/api/level_completion/submit", async (req, res) => {
  const { user_id, stage_times, level_name, end_time, elapsed_time } = req.body;

  console.log(req.body);
  let isLevelCompleted = true;

  if (end_time === 0 || stage_times.some((stage) => stage.value === 0)) {
    isLevelCompleted = false;
  }

  try {
    // Fetch level_id based on level_name
    const levelQuery =
      "SELECT level_id FROM public.levels WHERE level_name = $1";
    const levelResult = await pool.query(levelQuery, [level_name]);

    if (levelResult.rows.length === 0) {
      return res.status(400).json({ error: "Level not found." });
    }

    const level_id = levelResult.rows[0].level_id;

    // Insert into level_completion table
    const levelCompletionQuery = `
      INSERT INTO public.level_completion (user_id, level_id, level_completed, level_timestamp, total_elapsed_time)
      VALUES ($1, $2, $3, to_timestamp($4), $5) RETURNING id
    `;
    const levelCompletionResult = await pool.query(levelCompletionQuery, [
      user_id,
      level_id,
      isLevelCompleted,
      end_time,
      elapsed_time,
    ]);

    const levelCompletionId = levelCompletionResult.rows[0].id;
    console.log("Level Completion ID:", levelCompletionId);

    // Loop through stage_times array (now objects with key-value)
    for (let stageEntry of stage_times) {
      const stageIndex = parseInt(stageEntry.key); // Convert "key" to an integer
      const stageElapsedTime = stageEntry.value;

      let stageCompleted = stageElapsedTime > 0;

      // Fetch stage_id using level_id and stage index
      const stageQuery = `
        SELECT stage_id FROM public.stages WHERE level_id = $1 AND stage_name = $2
      `;
      const stageResult = await pool.query(stageQuery, [
        level_id,
        `Stage ${stageIndex + 1}`, // Adjusting index to match DB format
      ]);

      if (stageResult.rows.length === 0) {
        return res
          .status(400)
          .json({ error: `Stage ${stageIndex + 1} not found.` });
      }

      const stage_id = stageResult.rows[0].stage_id;

      // Insert into stage_completion table
      const stageCompletionQuery = `
        INSERT INTO public.stage_completion (user_id, level_id, stage_id, stage_completed, stage_elapsed_time, level_completion_id)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await pool.query(stageCompletionQuery, [
        user_id,
        level_id,
        stage_id,
        stageCompleted,
        stageElapsedTime,
        levelCompletionId,
      ]);
    }

    res
      .status(200)
      .json({ message: "Level and stage data saved successfully!" });
  } catch (error) {
    console.error("Error saving level completion data:", error);
    res.status(500).json({ error: "An error occurred while saving the data." });
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
