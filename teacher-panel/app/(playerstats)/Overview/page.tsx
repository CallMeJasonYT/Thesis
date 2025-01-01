"use client";

import React, { useEffect, useState } from "react";

const PlayerStatsOverview = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:3030/api/web/player-stats"
        );
        const data = await response.json();
        console.log(data);
        setStats(data);
      } catch (error) {
        console.error("Error fetching player stats:", error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-center text-gray-800">Overview</h1>

      {/* Total Players */}
      <div className="bg-white shadow-lg rounded-lg p-5">
        <h2 className="text-lg font-semibold text-indigo-600 flex items-center">
          Total Players in the Game
        </h2>
        <div className="mt-4 space-y-2">
          <p className="text-gray-700 text-lg">
            <strong>Total Players:</strong> {stats.totalPlayers}
          </p>
          <p className="text-gray-700 text-lg">
            <strong>Online Players:</strong> {"12"}
          </p>
        </div>
      </div>

      {/* Tutorial and Training Rooms */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-blue-600">Tutorial Room</h2>
          <div className="mt-4">
            <p className="text-gray-700">
              <strong>Total Players Played:</strong>{" "}
              {stats.tutorialRoomStats.total_players}
            </p>
            <p className="text-gray-700">
              <strong>Completion Rate:</strong>{" "}
              {stats.tutorialRoomStats.completion_rate * 100}%
            </p>
            <p className="text-gray-700">
              <strong>Average Completion Time:</strong>{" "}
              {stats.tutorialRoomStats.avg_time} minutes
            </p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-green-600">
            Training Room
          </h2>
          <div className="mt-4">
            <p className="text-gray-700">
              <strong>Total Players Played:</strong>{" "}
              {stats.trainingRoomStats.total_players}
            </p>
            <p className="text-gray-700">
              <strong>Completion Rate:</strong>{" "}
              {stats.trainingRoomStats.completion_rate * 100}%
            </p>
            <p className="text-gray-700">
              <strong>Average Completion Time:</strong>{" "}
              {stats.trainingRoomStats.avg_time} minutes
            </p>
          </div>
        </div>
      </div>

      {/* Escape Room */}
      <div className="bg-white shadow-md rounded-lg p-5">
        <h2 className="text-lg font-semibold text-purple-600">
          Escape Room Overview
        </h2>
        <div className="mt-4">
          <p className="text-gray-700">
            <strong>Total Players Played:</strong>{" "}
            {stats.escapeRoomStats.total_players}
          </p>
          <p className="text-gray-700">
            <strong>Completion Rate:</strong>{" "}
            {stats.escapeRoomStats.completion_rate * 100}%
          </p>
          <p className="text-gray-700">
            <strong>Average Completion Time:</strong>{" "}
            {stats.escapeRoomStats.avg_time} minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsOverview;
