// utils/dbHelpers.js
import pool from "../config/db.js";

export const queryDB = async (query, params = []) => {
  try {
    const result = await pool.query(query, params);
    const fullQuery = formatDollarQuery(query, params);
    console.log(fullQuery);
    return { rows: result.rows, error: null };
  } catch (error) {
    console.error("DB Error:", error);
    return { rows: null, error };
  }
};

function formatDollarQuery(query, params) {
  let i = 0;
  return query.replace(/\$\d+/g, () => {
    const val = params[i++];
    if (typeof val === "string") return `'${val}'`;
    if (val === null) return "NULL";
    return val;
  });
}
