import { queryDB } from "../utils/dbHelper.js";
import { validateRequestBody } from "../utils/requirementsValidator.js";
import { getAttributes } from "../config/attributeCache.js";

export const getUsers = async (req, res) => {
  const usersQuery = `
        SELECT DISTINCT ON (u.id) 
           u.username, 
           TO_CHAR(ss.created_at, 'FMMonth DD, YYYY HH12:MI:SS AM') AS last_played
        FROM public.users u
        JOIN public.sessions ss 
            ON ss.user_id = u.id
        WHERE u.role = 'user'
        ORDER BY u.id, ss.created_at DESC`;

  const { rows, error } = await queryDB(usersQuery);

  if (error) return res.status(500).send("Failed to fetch player data");
  res.json({ playerData: rows });
};

export const getLevelStages = async (req, res) => {
  const { rows, error } = await queryDB(
    `SELECT r.name AS level_name, q.name AS stage_name
    FROM public.rooms r
    LEFT JOIN public.quizzes q ON r.id = q.room_id
    ORDER BY r.name, q.name ASC`
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

const getSessionsByUser = async (startDate, endDate, username) => {
  const sessionsQuery = `
    SELECT ss.id
    FROM public.sessions ss
    INNER JOIN public.users u ON ss.user_id = u.id
    WHERE u.username = $1 AND ss.created_at BETWEEN $2 AND $3
  `;

  const { rows, error } = await queryDB(sessionsQuery, [
    username,
    startDate,
    endDate,
  ]);

  if (error) {
    console.error("Failed to fetch player sessions", error);
    return null;
  }
  console.log(rows.map((item) => item.id));
  return rows.map((item) => item.id);
};

export const getQuizTimes = async (req, res) => {
  const requiredFields = ["startDate", "endDate", "username", "quizName"];
  const validation = validateRequestBody(req.body, requiredFields);

  if (!validation.isValid) {
    console.log(validation.message);
    return res.status(400).json({ error: validation.message });
  }

  const { startDate, endDate, username, quizName } = req.body;
  const startDateISO = new Date(startDate).toISOString();
  const endDateISO = new Date(endDate).toISOString();

  const sessions = await getSessionsByUser(startDateISO, endDateISO, username);
  const quizResults = [];

  for (const sessionId of sessions) {
    const quizTimesQuery = `
      SELECT session_id, MIN(l.created_at) AS first_created_at, quiz_id, q.name
      FROM public.logs l
      INNER JOIN public.quizzes q ON q.id = l.quiz_id
      WHERE l.session_id = $1
        AND l.type = 'quiz-start'
        AND l.created_at BETWEEN $2 AND $3
        AND ($4 = 'Overall' OR q.name = $4)
      GROUP BY quiz_id, session_id, q.name`;

    const { rows, error } = await queryDB(quizTimesQuery, [
      sessionId,
      startDateISO,
      endDateISO,
      quizName,
    ]);

    if (error) {
      console.error(`Failed to get quiz times for session ${sessionId}`, error);
      return null;
    }

    quizResults.push(...rows);
  }

  const groupedBySession = {};

  for (const item of quizResults) {
    const { session_id, first_created_at, name } = item;
    if (!groupedBySession[session_id]) groupedBySession[session_id] = [];
    groupedBySession[session_id].push({ ...item, quiz_name: name });
  }

  const logsBetweenPairs = [];

  for (const sessionId in groupedBySession) {
    const quizzes = groupedBySession[sessionId].sort(
      (a, b) => new Date(a.first_created_at) - new Date(b.first_created_at)
    );

    for (let i = 0; i < quizzes.length; i++) {
      const start = quizzes[i].first_created_at;
      let end;

      if (i != quizzes.length - 1) {
        end = quizzes[i + 1].first_created_at;
      } else {
        end = new Date(
          new Date(quizzes[i].first_created_at).getTime() + 20 * 60 * 1000
        ).toISOString();
      }

      const logsQuery = `
        SELECT *
        FROM public.logs
        WHERE session_id = $1
          AND created_at BETWEEN $2 AND $3
        ORDER BY created_at
      `;

      const { rows, error } = await queryDB(logsQuery, [sessionId, start, end]);

      if (error) {
        console.error(`Error fetching logs for session ${sessionId}`, error);
        continue;
      }

      logsBetweenPairs.push({
        session_id: sessionId,
        start,
        end,
        logs: rows,
        quiz_name: quizzes[i].quiz_name,
      });
    }
  }

  const responseData = [];

  for (const item of logsBetweenPairs) {
    const npcCounts = { normal: 0, ai: 0 };
    const answerIds = [];

    for (const log of item.logs) {
      if (log.type === "npc-normal-selected-option") {
        npcCounts.normal += 1;
      } else if (log.type === "npc-ai-sent-message") {
        npcCounts.ai += 1;
      } else if (log.type === "quiz-answer" && log.session_answer_id) {
        answerIds.push(log.session_answer_id);
      }
    }

    let quizScore = 0;
    let mistakes = 0;

    if (answerIds.length > 0) {
      const placeholders = answerIds.map((_, i) => `$${i + 1}`).join(", ");
      const scoreQuery = `
        SELECT
          SUM(points) AS total_score,
          COUNT(*) FILTER (WHERE points <= 0) AS mistake_count
        FROM public.session_answers
        WHERE id IN (${placeholders})
      `;

      const { rows: scoreRows, error: scoreError } = await queryDB(
        scoreQuery,
        answerIds
      );

      if (scoreError) {
        console.error(
          `Error fetching scores and mistakes for session ${item.session_id}`,
          scoreError
        );
      } else {
        quizScore = parseFloat(scoreRows[0].total_score) || 0;
        mistakes = parseInt(scoreRows[0].mistake_count) || 0;
      }
    }

    const attributeMapping = {
      "AI NPC Usage": npcCounts.ai,
      Mistakes: mistakes,
      "NPC Usage": npcCounts.normal,
      Score: quizScore,
    };

    const attributesObj = getAttributes().reduce((acc, key) => {
      acc[key] = parseFloat(attributeMapping[key]) || 0;
      return acc;
    }, {});

    responseData.push({
      session_id: item.session_id,
      quiz_name: item.quiz_name,
      date: new Date(item.start).toISOString().split("T")[0],
      username: username,
      attributes: attributesObj,
      logs: item.logs,
    });
  }

  res.json({ userResults: responseData });
};
