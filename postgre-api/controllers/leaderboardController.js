import pool from "../config/db.js";

export const getGroupedPlayers = async (req, res) => {
  try {
    const groupedPlayersQuery = `
        SELECT DISTINCT ON (u.uuid) 
           u.username, 
           TO_CHAR(lc.level_timestamp, 'FMMonth DD, YYYY HH12:MI:SS AM') AS last_played, 
           u.group_name
        FROM public.users u
        JOIN public.level_completion lc 
            ON lc.user_id = u.uuid
        WHERE u.group_name IS NOT NULL
        ORDER BY u.uuid, lc.level_timestamp DESC`;

    const playerResult = await pool.query(groupedPlayersQuery);
    res.json({
      playerData: playerResult.rows,
    });
  } catch (error) {
    console.error("Error fetching player data:", error);
    res.status(500).json({ error: "Failed to fetch player data" });
  }
};
