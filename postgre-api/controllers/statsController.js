import { queryDB } from "../utils/dbHelper.js";
import { validateRequestBody } from "../utils/requirementsValidator.js";
import { getAttributes } from "../config/attributeCache.js";

export const getOverviewStats = async (req, res) => {
  const roomStatsQuery = `
          SELECT 
        l.level_name,
        COUNT(lc.user_id) AS total_players,
        ROUND((COUNT(*) FILTER (WHERE lc.level_completed = TRUE) * 100.0) / COUNT(*)) AS completion_rate,
        ROUND(AVG(lc.total_elapsed_time)) AS avg_time
        FROM public.level_completion lc
        JOIN public.levels l ON lc.level_id = l.level_id
        GROUP BY l.level_name, lc.level_id`;

  const { rows: totalPlayersResult, error: totalPlayersError } = await queryDB(
    `SELECT COUNT(*) FROM public.users AS total_players`
  );
  const { rows: totalGamesResult, error: totalGamesError } = await queryDB(
    `SELECT COUNT(*) FROM public.level_completion`
  );
  const { rows: roomStatsResult, error: roomStatsError } = await queryDB(
    roomStatsQuery
  );
  if (totalPlayersError || totalGamesError || roomStatsError)
    return res.status(500).json("Failed to fetch overview data");

  res.json({
    totalPlayers: totalPlayersResult[0].count,
    totalRooms: totalGamesResult[0].count,
    roomStats: roomStatsResult,
  });
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
  const endDateISO = new Date(
    new Date(endDate).getTime() + 24 * 60 * 60 * 1000
  ).toISOString();

  const { rows, error } = await queryDB(
    `SELECT * FROM get_group_stats_by_filters($1, $2, $3, $4, $5)`,
    [group, startDateISO, endDateISO, level, stage]
  );
  if (error)
    return res
      .status(500)
      .json("Error fetching group stats from the database.");
  res.status(200).json({ groupResults: rows });
};

export const getUserStats = async (req, res) => {
  const requiredFields = ["startDate", "endDate", "username", "level", "stage"];
  const validation = validateRequestBody(req.body, requiredFields);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.message });
  }

  const { startDate, endDate, username, level, stage } = req.body;
  const startDateISO = new Date(startDate).toISOString();
  const endDateISO = new Date(
    new Date(endDate).getTime() + 24 * 60 * 60 * 1000
  ).toISOString();

  const { rows, error } = await queryDB(
    `SELECT * FROM get_user_stats_by_filters($1, $2, $3, $4, $5)`,
    [username, startDateISO, endDateISO, level, stage]
  );
  if (error)
    return res.status(500).json("Error fetching user stats from the database.");
  res.status(200).json({ userResults: rows });
};
