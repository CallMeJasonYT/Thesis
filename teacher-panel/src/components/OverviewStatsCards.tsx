"use client";

import React, { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import { useSharedData } from "@/contexts/SharedDataContext";
import {
  IconCheck,
  IconWifi,
  IconUser,
  IconLogin2,
  IconDeviceGamepad2,
  IconStopwatch,
  IconBolt,
} from "@tabler/icons-react";

const OverviewStatsCards = () => {
  const { levelStagesMap } = useSharedData();
  const quizzes = Object.values(levelStagesMap).flat();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/ariadni/overviewStats`
        );
        const data = await response.json();
        console.log("Fetched Stats:", data);
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="grid gap-4 md:gap-3 lg:gap-6">
        <StatsCard
          title="Player Status"
          stats={[
            {
              label: "Total Players",
              value: stats.totalPlayers,
              icon: <IconUser className="text-secondary" />,
            },
            {
              label: "Total Sessions",
              value: stats.totalSessions,
              icon: <IconWifi className="text-emerald-800" />,
            },
          ]}
          colorClass="text-primary"
        />
      </div>

      <div className="grid gap-4 md:gap-3 lg:gap-6 sm:grid-cols-2">
        {quizzes.map((quiz: string) => (
          <StatsCard
            key={quiz}
            title={quiz}
            stats={[
              {
                label: "Total Players Played",
                value:
                  stats?.quizStats.find((stat: any) => stat.quiz_name === quiz)
                    ?.times_played ?? "N/A",
                icon: <IconLogin2 className="text-tertiary" />,
              },
              {
                label: "Average Score",
                value: `${
                  stats?.quizStats.find((stat: any) => stat.quiz_name === quiz)
                    ?.avg_points ?? "N/A"
                }`,
                icon: <IconCheck className="text-primary" />,
              },
            ]}
            colorClass="text-secondary"
          />
        ))}
      </div>
    </div>
  );
};

export default OverviewStatsCards;
