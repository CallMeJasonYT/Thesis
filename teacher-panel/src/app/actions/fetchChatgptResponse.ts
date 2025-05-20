"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function fetchChatgptResponse(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 300,
    });

    return completion.choices[0].message.content ?? "No content.";
  } catch (err) {
    console.error("OpenAI Error:", err);
    return "Error fetching summary.";
  }
}
