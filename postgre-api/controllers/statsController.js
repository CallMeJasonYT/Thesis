import pool from "../config/db.js";

export const getOverviewStats = async (req, res) => {
  try {
    const totalPlayersQuery = `SELECT COUNT(*) FROM public.users AS total_players`;
    const totalGamesQuery = `SELECT COUNT(*) FROM public.level_completion`;
    const roomStatsQuery = `
          SELECT 
        l.level_name,
        COUNT(lc.user_id) AS total_players,
        ROUND((COUNT(*) FILTER (WHERE lc.level_completed = TRUE) * 100.0) / COUNT(*)) AS completion_rate,
        ROUND(AVG(lc.total_elapsed_time)) AS avg_time
        FROM public.level_completion lc
        JOIN public.levels l ON lc.level_id = l.level_id
        GROUP BY l.level_name, lc.level_id`;

    const totalPlayersResult = await pool.query(totalPlayersQuery);
    const totalGamesResult = await pool.query(totalGamesQuery);
    const roomStatsResult = await pool.query(roomStatsQuery);

    res.json({
      totalPlayers: totalPlayersResult.rows[0].count,
      totalRooms: totalGamesResult.rows[0].count,
      roomStats: roomStatsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    res.status(500).json({ error: "Failed to fetch overview stats" });
  }
};

export const getGroupStats = async (req, res) => {
  console.log(req.body);
  const { startDate, endDate, group, level, stage } = req.body;

  if (!startDate || !endDate || !group || !level || !stage) {
    return res.status(400).json({ error: "Required Parameters are missing!" });
  }

  const startDateISO = new Date(startDate).toISOString();
  const endDateISO = new Date(endDate).toISOString();

  try {
    const groupLevelStatsQuery = `
      SELECT 
      TO_CHAR(lc.level_timestamp, 'DD/MM/YYYY') AS date, 
      u.username,
      l.level_name,
      SUM(m.mistake_count) AS "Mistakes",
      CASE
        WHEN $5 = 'Overall' THEN ROUND(AVG(lc.total_elapsed_time), 0)
        ELSE ROUND(AVG(sc.stage_elapsed_time), 0)
      END AS "Total Time"
    FROM public.level_completion lc
      JOIN public.users u ON lc.user_id = u.uuid
      JOIN public.levels l ON lc.level_id = l.level_id
      JOIN public.stage_completion sc ON lc.id = sc.level_completion_id
      JOIN public.stages s ON sc.stage_id = s.stage_id
      LEFT JOIN public.mistakes m ON lc.id = m.level_completion_id
          AND m.stage_id = s.stage_id
    WHERE u.group_name = $1
      AND lc.level_timestamp BETWEEN $2 AND $3
      AND l.level_name = $4
      AND ($5 = 'Overall' OR s.stage_name = $5)
    GROUP BY date, u.username, l.level_name, lc.id
    ORDER BY date, l.level_name`;

    const groupLevelResults = await pool.query(groupLevelStatsQuery, [
      group,
      startDateISO,
      endDateISO,
      level,
      stage,
    ]);

    const formattedResults = groupLevelResults.rows.map((row) => ({
      date: row.date,
      username: row.username,
      level_name: row.level_name,
      attributes: {
        "Total Time": parseInt(row["Total Time"]) || 0,
        Mistakes: parseInt(row["Mistakes"]) || 0,
      },
    }));

    res.status(200).json({ groupLevelStats: formattedResults });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error fetching stats from the database." });
  }
};

export const getUserStats = async (req, res) => {
  console.log(req.body);
  const { startDate, endDate, username, level, stage } = req.body;

  if (!startDate || !endDate || !username || !level || !stage) {
    return res.status(400).json({ error: "Required Parameters are missing!" });
  }

  const startDateISO = new Date(startDate).toISOString();
  const endDateISO = new Date(endDate).toISOString();

  try {
    const userStatsQuery = `
      SELECT 
      TO_CHAR(lc.level_timestamp, 'DD/MM/YYYY') AS date, 
      u.username,
      l.level_name,
      SUM(m.mistake_count) AS "Mistakes",
      CASE
        WHEN $5 = 'Overall' THEN ROUND(AVG(lc.total_elapsed_time), 0)
        ELSE ROUND(AVG(sc.stage_elapsed_time), 0)
      END AS "Total Time"
    FROM public.level_completion lc
      JOIN public.users u ON lc.user_id = u.uuid
      JOIN public.levels l ON lc.level_id = l.level_id
      JOIN public.mistakes m ON lc.id = m.level_completion_id
      JOIN public.stage_completion sc ON lc.id = sc.level_completion_id
      JOIN public.stages s ON sc.stage_id = s.stage_id
      LEFT JOIN public.stages sm ON m.stage_id = sm.stage_id
    WHERE u.username = $1
      AND lc.level_timestamp BETWEEN $2 AND $3
      AND l.level_name = $4
      AND ($5 = 'Overall' OR s.stage_name = $5)
    GROUP BY date, u.username, l.level_name
    ORDER BY date, l.level_name`;

    const userResults = await pool.query(userStatsQuery, [
      username,
      startDateISO,
      endDateISO,
      level,
      stage,
    ]);

    const formattedResults = userResults.rows.map((row) => ({
      date: row.date,
      username: row.username,
      level_name: row.level_name,
      attributes: {
        "Total Time": parseInt(row["Total Time"]) || 0,
        Mistakes: parseInt(row["Mistakes"]) || 0,
      },
    }));

    res.status(200).json({ userResults: formattedResults });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error fetching stats from the database." });
  }
};
