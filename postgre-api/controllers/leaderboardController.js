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

    if (selectedFilter === "advanced" && stageInputs && attributeInputs) {
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
              attrValue = parseInt(record[timeKey]);
            } else if (attrName === "Mistakes") {
              const mistakesKey = `${stageName} Mistakes`;
              attrValue = parseInt(record[mistakesKey] * 10);
            }

            stageScore += attrWeight * attrValue;
          }

          score += stageWeight * stageScore;
        }

        record.advancedScore = score;
      });

      rawResults.sort((a, b) => a.advancedScore - b.advancedScore);
    } else {
      rawResults.sort(
        (a, b) => parseInt(a[selectedFilter]) - parseInt(b[selectedFilter])
      );
    }

    const formattedResults = rawResults.map((row) => ({
      date: row.date,
      username: row.username,
      attributes: {
        "Total Time": parseInt(row["Total Time"]),
        Mistakes: parseInt(row["Mistakes"]),
      },
    }));

    res.status(200).json({ leaderboardResults: formattedResults });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Error fetching stats from the database." });
  }
};
