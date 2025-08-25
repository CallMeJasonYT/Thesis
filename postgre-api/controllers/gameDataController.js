import pool from "../config/db.js";
import { queryDB } from "../utils/dbHelper.js";
import { validateRequestBody } from "../utils/requirementsValidator.js";

export const validatePlayer = async (req, res) => {
  const requiredFields = ["username", "password"];
  const validation = validateRequestBody(req.body, requiredFields);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.message });
  }

  const { username, password } = req.body;
  const { rows, error } = await queryDB(
    "SELECT uuid FROM public.users WHERE username = $1 AND password = $2",
    [username, password]
  );

  if (error) return res.status(500).send("Database error");
  if (rows.length === 0) return res.status(401).send("Invalid credentials");
  res.json({ playerUUID: rows[0].uuid });
};

export const saveLevelCompletion = async (req, res) => {
  const requiredFields = [
    "user_id",
    "stage_times",
    "level_name",
    "end_time",
    "elapsed_time",
  ];
  const validation = validateRequestBody(req.body, requiredFields);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.message });
  }

  const { user_id, stage_times, level_name, end_time, elapsed_time } = req.body;
  let isLevelCompleted = true;

  if (end_time === 0 || stage_times.some((stage) => stage.value === 0)) {
    isLevelCompleted = false;
  }
  // Fetch level_id based on level_name
  const { rows: levelRows, error: levelError } = await queryDB(
    "SELECT level_id FROM public.levels WHERE level_name = $1",
    [level_name]
  );
  if (totalPlayersError || totalGamesError || roomStatsError)
    return res.status(500).json("Failed to fetch overview data");
  if (levelRows.length === 0) {
    return res.status(400).json({ error: "Level not found." });
  }

  level_id = levelRows[0].level_id;

  const { rows: levelCompletionRows, error: levelCompletionError } =
    await queryDB(
      `INSERT INTO public.level_completion (user_id, level_id, level_completed, level_timestamp, total_elapsed_time)
    VALUES ($1, $2, $3, to_timestamp($4), $5) RETURNING id`,
      [user_id, level_id, isLevelCompleted, end_time, elapsed_time]
    );

  const levelCompletionId = levelCompletionRows[0].id;
  console.log("Level Completion ID:", levelCompletionId);

  try {
    // Loop through stage_times array (now objects with key-value)
    for (let stageEntry of stage_times) {
      const stageIndex = parseInt(stageEntry.key) + 1; // Convert "key" to an integer
      const stageElapsedTime = stageEntry.value;

      let stageCompleted = stageElapsedTime > 0;

      // Fetch stage_id using level_id and stage index
      const stageQuery = `
        SELECT stage_id FROM public.stages WHERE level_id = $1 AND stage_name = $2
      `;
      const stageResult = await pool.query(stageQuery, [
        level_id,
        `Stage ${stageIndex}`, // Adjusting index to match DB format
      ]);

      if (stageResult.rows.length === 0) {
        return res
          .status(400)
          .json({ error: `Stage ${stageIndex} not found.` });
      }

      const stage_id = stageResult.rows[0].stage_id;

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
};
