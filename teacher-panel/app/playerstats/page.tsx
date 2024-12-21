"use client";

import React from "react";
import PlayerActivity from "../components/PlayerActivity";
import WebSocketComponent from "../components/WebSocketComponent";
import WebSocketManager from "../utils/WebSocketManager";

const wsManager = new WebSocketManager("ws://localhost:8080/ws");

export default function PlayerStatsPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-700">
        Player Stats Dashboard
      </h1>
      <div className="text-gray-800">
        <PlayerActivity wsManager={wsManager} />
        <WebSocketComponent wsManager={wsManager} />
      </div>
    </div>
  );
}
