import pool from "../config/db.js";
import { setAttributes } from "../config/attributeCache.js";

export const loadAttributes = async () => {
  try {
    const result = await pool.query(
      "SELECT attribute_name FROM public.stats_attributes ORDER BY attribute_name ASC"
    );

    const attributes = result.rows.map((row) => row.attribute_name);

    setAttributes(attributes);
    console.log("Attributes loaded:", attributes);
  } catch (err) {
    console.error("Failed to load attributes:", err);
  }
};
