import { queryDB } from "../utils/dbHelper.js";

export const getGroupedPlayers = async (req, res) => {
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

  const { rows, error } = await queryDB(groupedPlayersQuery);

  if (error) return res.status(500).send("Failed to fetch player data");
  res.json({ playerData: rows });
};
