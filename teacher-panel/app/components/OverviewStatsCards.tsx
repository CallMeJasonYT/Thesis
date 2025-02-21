"use client";
import React, { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";

const OverviewStatsCards = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:3030/api/web/overview-card-stats"
        );
        const data = await response.json();
        console.log(data);
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
    <div className="space-y-4">
      <div className="grid gap-1 md:gap-3 lg:gap-6 sm:grid-cols-2">
        <StatsCard
          title="Player Status"
          stats={[
            { label: "Total Players", value: stats.totalPlayers },
            { label: "Online Players", value: 5 },
          ]}
          colorClass="text-primary"
        />

        <StatsCard
          title="Room Status"
          stats={[
            { label: "Total Rooms", value: stats.totalRooms },
            { label: "Active Rooms", value: 3 },
          ]}
          colorClass="text-primary"
        />
      </div>

      <div className="grid gap-1 md:gap-3 lg:gap-6 sm:grid-cols-3">
        <StatsCard
          title="Tutorial Room"
          stats={[
            {
              label: "Total Players Played",
              value: stats.tutorialRoomStats.total_players,
            },
            {
              label: "Completion Rate",
              value: `${stats.tutorialRoomStats.completion_rate}%`,
            },
            {
              label: "Average Completion Time",
              value: stats.tutorialRoomStats.avg_time,
            },
          ]}
          colorClass="text-secondary"
        />

        <StatsCard
          title="Training Room"
          stats={[
            {
              label: "Total Players Played",
              value: stats.trainingRoomStats.total_players,
            },
            {
              label: "Completion Rate",
              value: `${stats.trainingRoomStats.completion_rate}%`,
            },
            {
              label: "Average Completion Time",
              value: stats.trainingRoomStats.avg_time,
            },
          ]}
          colorClass="text-tertiary"
        />

        <StatsCard
          title="Escape Room"
          stats={[
            {
              label: "Total Players Played",
              value: stats.escapeRoomStats.total_players,
            },
            {
              label: "Completion Rate",
              value: `${stats.escapeRoomStats.completion_rate}%`,
            },
            {
              label: "Average Completion Time",
              value: stats.escapeRoomStats.avg_time,
            },
          ]}
          colorClass="text-quaternary"
        />
      </div>
    </div>
  );
};

export default OverviewStatsCards;
