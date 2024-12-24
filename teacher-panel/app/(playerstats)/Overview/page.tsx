"use client";

import React from "react";

const PlayerStatsOverview = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-center text-gray-800">Overview</h1>

      {/* Total Players */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold text-indigo-600 flex items-center">
          Total Players in the Game
        </h2>
        <div className="mt-4 space-y-2">
          <p className="text-gray-700 text-lg">
            <strong>Total Players:</strong> 500
          </p>
          <p className="text-gray-700 text-lg">
            <strong>Online Players:</strong> 120
          </p>
        </div>
      </div>

      {/* Tutorial and Training Rooms */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-600">Tutorial Room</h2>
          <div className="mt-4">
            <p className="text-gray-700">
              <strong>Total Players Played:</strong> 250
            </p>
            <p className="text-gray-700">
              <strong>Completion Rate:</strong> 75%
            </p>
            <p className="text-gray-700">
              <strong>Average Completion Time:</strong> 15 minutes
            </p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-600">
            Training Room
          </h2>
          <div className="mt-4">
            <p className="text-gray-700">
              <strong>Total Players Played:</strong> 200
            </p>
            <p className="text-gray-700">
              <strong>Completion Rate:</strong> 60%
            </p>
            <p className="text-gray-700">
              <strong>Average Completion Time:</strong> 20 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Escape Room */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-purple-600">
          Escape Room Overview
        </h2>
        <div className="mt-4">
          <p className="text-gray-700">
            <strong>Total Players Played:</strong> 150
          </p>
          <p className="text-gray-700">
            <strong>Completion Rate:</strong> 50%
          </p>
          <p className="text-gray-700">
            <strong>Average Completion Time:</strong> 45 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsOverview;
