import pool from "../config/db.js";
import { validateRequestBody } from "../utils/requirementsValidator.js";
import { queryDB } from "../utils/dbHelper.js";

export const getLeaderboardRecords = async (req, res) => {
  const requiredFields = [
    "startDate",
    "endDate",
    "selectedLevel",
    "selectedFilter",
  ];
  const validation = validateRequestBody(req.body, requiredFields);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.message });
  }

  const {
    selectedLevel,
    startDate,
    endDate,
    selectedFilter,
    attributeInputs,
    stageInputs,
  } = req.body;

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
        MAX(CASE WHEN s.stage_id = ${stage.stage_id} THEN sc.stage_elapsed_time END) AS "${stage.stage_name} Total Time",
        MAX(CASE WHEN s.stage_id = ${stage.stage_id} THEN COALESCE(m.mistake_count, 0) END) AS "${stage.stage_name} Mistakes",
        MAX(CASE WHEN s.stage_id = ${stage.stage_id} THEN COALESCE(h.hint_count, 0) END) AS "${stage.stage_name} Hints"`;
  });

  const query = `
      SELECT 
        lc.id AS "Run ID",
        u.username,
        TO_CHAR(lc.level_timestamp, 'DD/MM/YYYY') AS date,
        SUM(COALESCE(m.mistake_count, 0)) AS "Mistakes",
        lc.total_elapsed_time AS "Total Time",
        SUM(COALESCE(h.hint_count, 0)) AS "Hints"
        ${stageColumns}
      FROM public.level_completion lc
      JOIN public.users u ON lc.user_id = u.uuid
      JOIN public.levels l ON lc.level_id = l.level_id
      JOIN public.stage_completion sc ON lc.id = sc.level_completion_id
      JOIN public.stages s ON sc.stage_id = s.stage_id
      LEFT JOIN public.mistakes m ON m.level_completion_id = lc.id AND m.stage_id = s.stage_id
      LEFT JOIN public.hints h ON h.level_completion_id = lc.id AND h.stage_id = s.stage_id
      WHERE l.level_name = $1
        AND lc.level_timestamp BETWEEN $2 AND $3
        AND lc.level_completed = true
      GROUP BY lc.id, u.username, lc.level_timestamp
    `;

  const { rows: rawLeaderboardResults, error: leaderboardError } =
    await queryDB(query, [selectedLevel, startDateISO, endDateISO]);

  let minRawScore = Infinity;
  let maxRawScore = -Infinity;

  if (selectedFilter === "advanced" && stageInputs && attributeInputs) {
    // First pass: calculate raw scores
    rawLeaderboardResults.forEach((record) => {
      let score = 0;

      for (const stageName in stageInputs) {
        let stageScore = 0;

        for (const attrName in attributeInputs) {
          let attrValue = 0;

          if (attrName != "Total Time") {
            attrValue = parseInt(record[stageName + " " + attrName] || 0) * 10;
          } else {
            attrValue = parseInt(record[stageName + " " + attrName] || 0);
          }

          stageScore += (attributeInputs[attrName] / 100) * attrValue;
        }

        score += (stageInputs[stageName] / 100) * stageScore;
      }

      record._rawScore = score;
      if (score < minRawScore) minRawScore = score;
      if (score > maxRawScore) maxRawScore = score;
    });

    // Second pass: normalize to 0–1000 (higher is better)
    rawLeaderboardResults.forEach((record) => {
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
    rawLeaderboardResults.sort((a, b) => b.advancedScore - a.advancedScore);
  } else {
    rawLeaderboardResults.sort(
      (a, b) => parseInt(a[selectedFilter]) - parseInt(b[selectedFilter])
    );
  }
  console.log(rawLeaderboardResults);

  const formattedResults = rawLeaderboardResults.map((row) => {
    const attributes = {};
    for (const attr in attributeInputs) {
      attributes[attr] = {
        Sum: 0,
      };
    }
    if (selectedFilter == "advanced") {
      for (const key in row) {
        for (const attr in attributeInputs) {
          if (key.includes("Stage") && key.includes(attr)) {
            const match = key.match(/Stage (\d+)/);
            if (match) {
              const stage = `Stage ${match[1]}`;
              const value = parseInt(row[key], 10) || 0;
              attributes[attr][stage] = value;
              attributes[attr].Sum += value;
            }
          }
        }
      }
    } else {
      for (const key in row) {
        for (const attr in attributeInputs) {
          if (key.includes(attr)) {
            attributes[attr].Sum = parseInt(row[key], 10) || 0;
          }
        }
      }
    }

    const result = {
      date: row.date,
      username: row.username,
      attributes,
      score: row.advancedScore,
    };

    return result;
  });

  if (leaderboardError)
    return res.status(500).send("Error fetching records from the database.");
  res.status(200).json({ leaderboardResults: formattedResults });
};
