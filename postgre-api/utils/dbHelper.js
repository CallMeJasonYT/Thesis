// utils/dbHelpers.js
import pool from "../config/db.js";

export const queryDB = async (query, params = []) => {
  try {
    const result = await pool.query(query, params);
    return { rows: result.rows, error: null };
  } catch (error) {
    console.error("DB Error:", error);
    return { rows: null, error };
  }
};
