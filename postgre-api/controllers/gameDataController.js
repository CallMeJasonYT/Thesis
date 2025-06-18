import pool from "../config/db.js";

export const validatePlayer = async (req, res) => {
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
};

export const saveLevelCompletion = async (req, res) => {
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

export const saveHint = async (req, res) => {
  const { username, hintText } = req.body;
  var uuid = "";

  try {
    const getUUIDQuery = `SELECT * FROM get_userid_from_username($1)`;
    const getUUIDResults = await pool.query(getUUIDQuery, [username]);
    uuid = getUUIDResults.rows[0].uuid;
    console.log(uuid);
  } catch (error) {
    console.error("Error fetching UUID:", error);
    res.status(500).json({ error: "Error fetching stats from the database." });
  }

  try {
    const insertHintQuery = `INSERT INTO public.hints (user_id, timestamp, hint_text) VALUES ($1, $2, $3)`;

    await pool.query(insertHintQuery, [
      uuid,
      new Date().toISOString(),
      hintText,
    ]);

    res.status(200).json({ message: "Hint data saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Database error");
  }
};
