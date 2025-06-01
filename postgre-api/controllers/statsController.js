import pool from "../config/db.js";
import { validateRequestBody } from "../utils/requirementsValidator.js";

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
  const requiredFields = ["startDate", "endDate", "group", "level", "stage"];
  const validation = validateRequestBody(req.body, requiredFields);
  if (!validation.isValid) {
    console.log(validation.message);
    return res.status(400).json({ error: validation.message });
  }

  const { startDate, endDate, group, level, stage } = req.body;
  const startDateISO = new Date(startDate).toISOString();
  const endDateISO = new Date(endDate).toISOString();

  try {
    const groupStatsQuery = `SELECT * FROM get_group_stats_by_filters($1, $2, $3, $4, $5)`;
    const groupResults = await pool.query(groupStatsQuery, [
      group,
      startDateISO,
      endDateISO,
      level,
      stage,
    ]);
    res.status(200).json({ groupResults: formatResults(groupResults) });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error fetching stats from the database." });
  }
};

export const getUserStats = async (req, res) => {
  const requiredFields = ["startDate", "endDate", "username", "level", "stage"];
  const validation = validateRequestBody(req.body, requiredFields);
  if (!validation.isValid) {
    console.log(validation.message);
    return res.status(400).json({ error: validation.message });
  }

  const { startDate, endDate, username, level, stage } = req.body;
  const startDateISO = new Date(startDate).toISOString();
  const endDateISO = new Date(endDate).toISOString();

  try {
    const userStatsQuery = `SELECT * FROM get_user_stats_by_filters($1, $2, $3, $4, $5)`;
    const userResults = await pool.query(userStatsQuery, [
      username,
      startDateISO,
      endDateISO,
      level,
      stage,
    ]);

    res.status(200).json({ userResults: formatResults(userResults) });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error fetching stats from the database." });
  }
};

function formatResults(queryResult) {
  const formattedResults = queryResult.rows.map((row) => ({
    date: row.date,
    username: row.username,
    level_name: row.level_name,
    stage_name: row.stage_name,
    attributes: {
      "Total Time": parseInt(row["Total Time"]) || 0,
      Mistakes: parseInt(row["Mistakes"]) || 0,
    },
  }));

  return formattedResults;
}
