import pool from "../config/db.js";

export const getGroups = async (req, res) => {
  try {
    const groupQuery = `
      SELECT DISTINCT u.group_name FROM public.users u 
      WHERE u.group_name IS NOT NULL
      ORDER BY u.group_name ASC`;
    const result = await pool.query(groupQuery);
    res.json({ groupData: result.rows });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

export const getLevelStages = async (req, res) => {
  try {
    const levelStagesQuery = `
    SELECT l.level_name, s.stage_name
    FROM public.levels l
    LEFT JOIN public.stages s ON l.level_id = s.level_id
    ORDER BY l.level_name, s.stage_name ASC`;

    const result = await pool.query(levelStagesQuery);

    const groupedData = {};

    result.rows.forEach((row) => {
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
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ error: "Failed to fetch levels" });
  }
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
  try {
    const stageQuery = `
    SELECT sa.attribute_name FROM public.stats_attributes sa
    ORDER BY sa.attribute_name ASC`;
    const result = await pool.query(stageQuery);
    res.json({ attributeData: result.rows });
  } catch (error) {
    console.error("Error fetching stats attributes:", error);
    res.status(500).json({ error: "Failed to fetch stats attributes" });
  }
};
