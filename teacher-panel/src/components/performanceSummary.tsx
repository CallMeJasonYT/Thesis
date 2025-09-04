"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchChatgptResponse } from "@/app/actions/fetchChatgptResponse";
import { IconCheck, IconCopy, IconX } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface PerformanceEntry {
  room: string;
  stage: string;
  date: string;
  username: string;
  attributes: Record<string, Record<string, number> | number>; // nested categories
}

interface PerformanceSummaryProps {
  summaryType: string;
  data: PerformanceEntry[];
  onClose: () => void;
}

// Example thresholds (expand as needed)
const thresholds: Record<string, Record<string, Record<string, number>>> = {
  EscapeRoom: {
    "Stage 1": { Mistakes: 2, Helps: 1, "Total Time": 90 },
    "Stage 2": { Mistakes: 3, "Total Time": 120 },
    "Stage 3": { Mistakes: 3, "Total Time": 120 },
  },
};

function generatePrompt(data: PerformanceEntry[], type: string): string {
  const grouped: Record<
    string,
    Record<string, Record<string, Record<string, any>>>
  > = {};

  data.forEach((entry) => {
    if (!grouped[entry.date]) grouped[entry.date] = {};
    if (!grouped[entry.date][entry.room]) grouped[entry.date][entry.room] = {};
    grouped[entry.date][entry.room][entry.stage] = entry.attributes;
  });

  const lines: string[] = [];

  // --- Context / Instruction improvements ---
  lines.push(
    `You are an AI tutor assistant that analyzes and summarizes student performances in an educational puzzle game. The puzzles are based on sorting algorithms and problem-solving tasks.`
  );
  lines.push(
    `Your task is to generate a well-structured summary for a ${type}-level report that will be read by a teacher.`
  );
  lines.push(
    `Be concise, clear, and professional. Use short paragraphs separated by line breaks so the text is easy to read.`
  );
  lines.push(
    `In your analysis, highlight whether the student(s) performed well, struggled, or exceeded thresholds.`
  );
  lines.push(
    `Identify where they made progress, where they regressed, and give constructive advice for the next steps.`
  );
  lines.push(
    `Do not use markdown symbols like **bold** or bullet points; just use plain sentences with line breaks.`
  );

  // --- Data Section ---
  data.forEach((entry) => {
    lines.push(`\n========================`);
    lines.push(`Student Information`);
    lines.push(`========================`);
    lines.push(`Username: ${entry.username}`);

    lines.push(`\n========================`);
    lines.push(`Performance Data`);
    lines.push(`========================`);

    for (const [date, rooms] of Object.entries(grouped)) {
      lines.push(`Date: ${date}`);
      for (const [room, stages] of Object.entries(rooms)) {
        lines.push(`  Room: ${room}`);
        for (const [stage, attrs] of Object.entries(stages)) {
          lines.push(`    Stage: ${stage}`);

          // Flatten nested attributes
          for (const [category, categoryValues] of Object.entries(attrs)) {
            if (typeof categoryValues === "object") {
              lines.push(`      ${category}:`);
              for (const [subKey, subValue] of Object.entries(
                categoryValues as Record<string, number>
              )) {
                lines.push(
                  `        - ${subKey}: ${subValue}${
                    subKey.includes("Time") ? "s" : ""
                  }`
                );
              }
            } else {
              lines.push(
                `      - ${category}: ${categoryValues}${
                  category.includes("Time") ? "s" : ""
                }`
              );
            }
          }
        }
      }
    }
  });

  // --- Threshold Section ---
  lines.push(`\n========================`);
  lines.push(`Acceptable Thresholds`);
  lines.push(`========================`);

  if (Object.keys(thresholds).length === 0) {
    lines.push("None provided.");
  } else {
    for (const [room, stages] of Object.entries(thresholds)) {
      lines.push(`Room: ${room}`);
      for (const [stage, attrs] of Object.entries(stages)) {
        lines.push(`  Stage: ${stage}`);
        for (const [k, v] of Object.entries(attrs)) {
          lines.push(`    - ${k}: ${v}${k.includes("Time") ? "s" : ""}`);
        }
      }
    }

    if (!thresholds["Training"]) {
      lines.push(`Room: Training`);
      lines.push(
        `  - No thresholds since it's training, so provide general encouragement and feedback only.`
      );
    }
  }

  // --- Final explicit instructions ---
  lines.push(`\n========================`);
  lines.push(`Final Instructions`);
  lines.push(`========================`);
  lines.push(
    `Write a clear, teacher-friendly summary of this performance. Mention strong areas, weak areas, and advice for improvement. The response should be 1–3 short paragraphs, written in plain text with line breaks.`
  );

  return lines.join("\n");
}

export const PerformanceSummary = ({
  summaryType,
  data,
  onClose,
}: PerformanceSummaryProps) => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      const prompt = generatePrompt(data, summaryType);
      console.log(prompt);
      const result = await fetchChatgptResponse(prompt);
      setResponse(result);
      setLoading(false);
    };

    fetchSummary();
  }, [data]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="bg-muted p-6 rounded-lg max-w-xl w-3/4 shadow-lg relative max-h-[80dvh]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center mb-4 justify-between"
        >
          <h2 className="text-lg md:text-2xl font-semibold text-center">
            Performance Summary
          </h2>
          <div className="flex gap-2 md:gap-4 items-center">
            <button
              onClick={handleCopy}
              className="ml-1 flex items-center gap-2 cursor-pointer border border-border rounded-xl px-2 py-1
             hover:border-primary/40 transition-all duration-300"
              disabled={!response}
            >
              {copied ? (
                <>
                  <IconCheck className="w-4" />
                  <span className="font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <IconCopy className="w-4" />
                  <span className="font-semibold">Copy</span>
                </>
              )}
            </button>

            <IconX onClick={onClose} className="flex-end w-5 cursor-pointer" />
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
          </div>
        ) : (
          <div className="whitespace-pre-wrap max-h-[calc(80dvh-130px)] overflow-auto pr-2]">
            {response}
          </div>
        )}
      </div>
    </div>
  );
};
