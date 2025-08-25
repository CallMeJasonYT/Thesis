import { getAttributes } from "../config/attributeCache.js";
import { queryDB } from "../utils/dbHelper.js";

export const getGroups = async (req, res) => {
  const { rows, error } = await queryDB(
    `SELECT DISTINCT u.group_name FROM public.users u 
      WHERE u.group_name IS NOT NULL 
      ORDER BY u.group_name ASC`
  );

  if (error) return res.status(500).send("Failed to fetch groups");
  res.json({ groups: rows });
};

export const getLevelStages = async (req, res) => {
  const { rows, error } = await queryDB(
    `SELECT l.level_name, s.stage_name
    FROM public.levels l
    LEFT JOIN public.stages s ON l.level_id = s.level_id
    ORDER BY l.level_name, s.stage_name ASC`
  );

  if (error) return res.status(500).send("Failed to fetch levels");

  const groupedData = {};
  rows.forEach((row) => {
    if (!groupedData[row.level_name]) {
      groupedData[row.level_name] = [];
    }

    if (row.stage_name) {
      groupedData[row.level_name].push(row.stage_name);
    }
  });

  const finalData = Object.entries(groupedData).map(([level, stages]) => ({
    level_name: level,
    stages,
  }));

  res.json({ data: finalData });
};

/*export const getLevels = async (req, res) => {
  try {
    const levelQuery = `
    SELECT l.level_name FROM public.levels l
    ORDER BY l.level_name ASC`;
    const result = await pool.query(levelQuery);
    res.json({ levelData: result.rows });
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ error: "Failed to fetch levels" });
  }
};

export const getStages = async (req, res) => {
  try {
    const stageQuery = `
    SELECT s.stage_name FROM public.stages s
    ORDER BY s.stage_name ASC`;
    const result = await pool.query(stageQuery);
    res.json({ stageData: result.rows });
  } catch (error) {
    console.error("Error fetching stages:", error);
    res.status(500).json({ error: "Failed to fetch stages" });
  }
};*/

export const getStatAttributes = async (req, res) => {
  res.json({ attributeData: getAttributes() });
};
