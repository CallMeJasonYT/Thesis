import React from "react";
import { ExitIcon, BookIcon, BurgerIcon, UserIcon } from "../icons";

const PlayerStatsOverview = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Player Stats Overview
      </h1>

      {/* Total Players */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold text-indigo-600 flex items-center">
          <UserIcon className="w-6 h-6 mr-2 text-indigo-500" />
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
        {/* Tutorial Room */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-600 flex items-center">
            <ExitIcon className="w-6 h-6 mr-2 text-blue-500" />
            Tutorial Room
          </h2>
          <div className="mt-4">
            <p className="text-gray-700">
              <strong>Total Players Played:</strong> 250
            </p>
            <p className="text-gray-700">
              <strong>Completion Rate:</strong> 75% of total players
            </p>
            <p className="text-gray-700">
              <strong>Average Completion Time:</strong> 15 minutes
            </p>
          </div>
        </div>

        {/* Training Room */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-600 flex items-center">
            <BookIcon className="w-6 h-6 mr-2 text-green-500" />
            Training Room
          </h2>
          <div className="mt-4">
            <p className="text-gray-700">
              <strong>Total Players Played:</strong> 200
            </p>
            <p className="text-gray-700">
              <strong>Completion Rate:</strong> 60% of total players
            </p>
            <p className="text-gray-700">
              <strong>Average Completion Time:</strong> 20 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Escape Room */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-purple-600 flex items-center">
          <ExitIcon className="w-6 h-6 mr-2 text-purple-500" />
          Escape Room Overview
        </h2>
        <div className="mt-4">
          <p className="text-gray-700">
            <strong>Total Players Played:</strong> 150
          </p>
          <p className="text-gray-700">
            <strong>Completion Rate:</strong> 50% of total players
          </p>
          <p className="text-gray-700">
            <strong>Average Completion Time:</strong> 45 minutes
          </p>
        </div>

        {/* Escape Room Phases */}
        <div className="grid gap-6 mt-6 md:grid-cols-3">
          <div className="bg-gray-50 border rounded-lg p-4 text-center shadow">
            <h3 className="text-lg font-medium text-indigo-600">Phase 1</h3>
            <p className="text-sm text-gray-700 mt-2">
              <strong>Played:</strong> 120
            </p>
            <p className="text-sm text-gray-700">
              <strong>Completion:</strong> 80%
            </p>
            <p className="text-sm text-gray-700">
              <strong>Avg Time:</strong> 10 minutes
            </p>
          </div>
          <div className="bg-gray-50 border rounded-lg p-4 text-center shadow">
            <h3 className="text-lg font-medium text-indigo-600">Phase 2</h3>
            <p className="text-sm text-gray-700 mt-2">
              <strong>Played:</strong> 90
            </p>
            <p className="text-sm text-gray-700">
              <strong>Completion:</strong> 60%
            </p>
            <p className="text-sm text-gray-700">
              <strong>Avg Time:</strong> 15 minutes
            </p>
          </div>
          <div className="bg-gray-50 border rounded-lg p-4 text-center shadow">
            <h3 className="text-lg font-medium text-indigo-600">Phase 3</h3>
            <p className="text-sm text-gray-700 mt-2">
              <strong>Played:</strong> 50
            </p>
            <p className="text-sm text-gray-700">
              <strong>Completion:</strong> 40%
            </p>
            <p className="text-sm text-gray-700">
              <strong>Avg Time:</strong> 20 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsOverview;
