import React from "react";
import StatsCard from "../../components/StatsCard";
import RecordsTable from "../../components/RecordsTable";

const testData = [
  {
    username: "Alice",
    overallScore: 95,
    fastestCompletionTime: 120,
    datetime: "2024-02-15 13:00:23",
  },
  {
    username: "Bob",
    overallScore: 88,
    fastestCompletionTime: 140,
    datetime: "2024-02-14 13:00:23",
  },
  {
    username: "Charlie",
    overallScore: 92,
    fastestCompletionTime: 110,
    datetime: "2024-02-13 13:00:23",
  },
  {
    username: "David",
    overallScore: 85,
    fastestCompletionTime: 150,
    datetime: "2024-02-12 13:00:23",
  },
  {
    username: "Eve",
    overallScore: 90,
    fastestCompletionTime: 130,
    datetime: "2024-02-11 13:00:23",
  },
  {
    username: "Frank",
    overallScore: 75,
    fastestCompletionTime: 160,
    datetime: "2024-02-10 13:00:23",
  },
];

const PlayerStatsOverview = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-left">Overview</h1>

      <div className="grid gap-1 md:gap-3 lg:gap-6 sm:grid-cols-2">
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

      <div className="grid gap-1 md:gap-3 lg:gap-6 sm:grid-cols-3">
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

      <RecordsTable data={testData} top={5} />
    </div>
  );
};

export default PlayerStatsOverview;
