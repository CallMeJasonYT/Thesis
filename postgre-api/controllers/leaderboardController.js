import pool from "../config/db.js";

export const getLeaderboardRecords = async (req, res) => {
  const {
    selectedLevel,
    startDate,
    endDate,
    selectedFilter,
    attributeInputs,
    stageInputs,
  } = req.body;

  if (!startDate || !endDate || !selectedLevel || !selectedFilter) {
    return res.status(400).json({ error: "Required Parameters are missing!" });
  }

  try {
    const startDateISO = new Date(startDate).toISOString();
    const endDateISO = new Date(endDate).toISOString();

    let stages = [];
    if (selectedFilter === "advanced") {
      const stagesQuery = `
        SELECT s.stage_id, s.stage_name 
        FROM public.stages s
        JOIN public.levels l ON l.level_id = s.level_id
        WHERE l.level_name = $1
        ORDER BY s.stage_id
      `;
      const stageResult = await pool.query(stagesQuery, [selectedLevel]);
      stages = stageResult.rows;
    }

    let stageColumns = "";
    stages.forEach((stage) => {
      stageColumns += `,
        MAX(CASE WHEN s.stage_id = ${stage.stage_id} THEN sc.stage_elapsed_time END) AS "${stage.stage_name} Time",
        MAX(CASE WHEN s.stage_id = ${stage.stage_id} THEN COALESCE(m.mistake_count, 0) END) AS "${stage.stage_name} Mistakes"`;
    });

    const query = `
      SELECT 
        lc.id AS "Run ID",
        u.username,
        TO_CHAR(lc.level_timestamp, 'DD/MM/YYYY') AS date,
        SUM(COALESCE(m.mistake_count, 0)) AS "Mistakes",
        lc.total_elapsed_time AS "Total Time"
        ${stageColumns}
      FROM public.level_completion lc
      JOIN public.users u ON lc.user_id = u.uuid
      JOIN public.levels l ON lc.level_id = l.level_id
      JOIN public.stage_completion sc ON lc.id = sc.level_completion_id
      JOIN public.stages s ON sc.stage_id = s.stage_id
      LEFT JOIN public.mistakes m ON lc.id = m.level_completion_id AND m.stage_id = s.stage_id
      WHERE l.level_name = $1
        AND lc.level_timestamp BETWEEN $2 AND $3
        AND lc.level_completed = true
      GROUP BY lc.id, u.username, lc.level_timestamp
    `;

    const { rows: rawResults } = await pool.query(query, [
      selectedLevel,
      startDateISO,
      endDateISO,
    ]);

    let minRawScore = Infinity;
    let maxRawScore = -Infinity;

    if (selectedFilter === "advanced" && stageInputs && attributeInputs) {
      // First pass: calculate raw scores
      rawResults.forEach((record) => {
        let score = 0;

        for (const stageName in stageInputs) {
          const stageWeight = stageInputs[stageName] / 100;
          let stageScore = 0;

          for (const attrName in attributeInputs) {
            const attrWeight = attributeInputs[attrName] / 100;
            let attrValue = 0;

            if (attrName === "Total Time") {
              const timeKey = `${stageName} Time`;
              attrValue = parseInt(record[timeKey]) || 0;
            } else if (attrName === "Mistakes") {
              const mistakesKey = `${stageName} Mistakes`;
              attrValue = (parseInt(record[mistakesKey]) || 0) * 10;
            }

            stageScore += attrWeight * attrValue;
          }

          score += stageWeight * stageScore;
        }

        record._rawScore = score;
        if (score < minRawScore) minRawScore = score;
        if (score > maxRawScore) maxRawScore = score;
      });

      // Second pass: normalize to 0–1000 (higher is better)
      rawResults.forEach((record) => {
        let normalized = 1000;
        if (maxRawScore !== minRawScore) {
          normalized =
            (1000 * (maxRawScore - record._rawScore)) /
            (maxRawScore - minRawScore);
        }
        record.advancedScore = parseFloat(normalized.toFixed(2));
        delete record._rawScore;
      });

      // Sort by final score
      rawResults.sort((a, b) => b.advancedScore - a.advancedScore);
    } else {
      rawResults.sort(
        (a, b) => parseInt(a[selectedFilter]) - parseInt(b[selectedFilter])
      );
    }

    const formattedResults = rawResults.map((row) => {
      const stageTimes = {};
      const stageMistakes = {};

      for (const key in row) {
        if (key.endsWith("Time") && key !== "Total Time") {
          const stageName = key.replace(" Time", "");
          const timeValue = row[key];
          stageTimes[stageName] =
            timeValue != null ? parseInt(timeValue, 10) : 0;
          if (isNaN(stageTimes[stageName])) {
            stageTimes[stageName] = 0;
          }
        }
        if (key.endsWith("Mistakes") && key !== "Mistakes") {
          const stageName = key.replace(" Mistakes", "");
          const mistakeValue = row[key];
          stageMistakes[stageName] =
            mistakeValue != null ? parseInt(mistakeValue, 10) : 0;
          if (isNaN(stageMistakes[stageName])) {
            stageMistakes[stageName] = 0;
          }
        }
      }

      const totalTime =
        row["Total Time"] != null ? parseInt(row["Total Time"], 10) : 0;
      const totalMistakes =
        row["Mistakes"] != null ? parseInt(row["Mistakes"], 10) : 0;

      const attributes = {
        "Total Time": {
          Sum: isNaN(totalTime) ? 0 : totalTime,
          ...stageTimes,
        },
        Mistakes: {
          Sum: isNaN(totalMistakes) ? 0 : totalMistakes,
          ...stageMistakes,
        },
      };

      const result = {
        date: row.date,
        username: row.username,
        attributes,
      };

      if (row.advancedScore !== undefined) {
        result.score = row.advancedScore;
      }

      return result;
    });

    res.status(200).json({ leaderboardResults: formattedResults });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Error fetching stats from the database." });
  }
};
