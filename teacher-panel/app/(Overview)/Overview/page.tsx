import React from "react";
import StatsCard from "../../components/StatsCard";

const PlayerStatsOverview = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-left">Overview</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <StatsCard
          title="Player Status"
          stats={[
            { label: "Total Players", value: 500 },
            { label: "Online Players", value: 120 },
          ]}
          colorClass="text-primary"
        />

        <StatsCard
          title="Room Status"
          stats={[
            { label: "Total Rooms", value: 23 },
            { label: "Active Rooms", value: 3 },
          ]}
          colorClass="text-primary"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Tutorial Room"
          stats={[
            { label: "Total Players Played", value: 300 },
            { label: "Completion Rate", value: "80%" },
            { label: "Average Completion Time", value: "10 minutes" },
          ]}
          colorClass="text-secondary"
        />

        <StatsCard
          title="Training Room"
          stats={[
            { label: "Total Players Played", value: 200 },
            { label: "Completion Rate", value: "60%" },
            { label: "Average Completion Time", value: "20 minutes" },
          ]}
          colorClass="text-tertiary"
        />

        <StatsCard
          title="Escape Room"
          stats={[
            { label: "Total Players Played", value: 150 },
            { label: "Completion Rate", value: "50%" },
            { label: "Average Completion Time", value: "45 minutes" },
          ]}
          colorClass="text-quaternary"
        />
      </div>
    </div>
  );
};

export default PlayerStatsOverview;
