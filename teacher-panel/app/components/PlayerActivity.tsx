import React, { useEffect, useState } from "react";
import WebSocketManager from "../utils/WebSocketManager";

interface Player {
  id: number;
  username: string;
  online: boolean;
  lastSeen: number | null;
}

const PlayerActivity: React.FC<{ wsManager: WebSocketManager }> = ({ wsManager }) => {
  const [offlinePlayers, setOfflinePlayers] = useState<Player[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);

  const fetchPlayers = async () => {
    try {
      const response = await fetch("http://localhost:3030/api/players");
      const data = await response.json();
      setOfflinePlayers(
        data.map((player: any) => ({
          id: player.id,
          username: player.username,
          online: false,
          lastSeen: null,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch players:", error);
    }
  };

  useEffect(() => {
    fetchPlayers();

    const handlePlayerActivity = (event: Event) => {
      const customEvent = event as CustomEvent<{ playerId: number; username?: string }>;
      const { playerId, username } = customEvent.detail;

      if (customEvent.type === "playerConnect") {
        setOfflinePlayers((prev) => prev.filter((p) => p.username !== username));
        setOnlinePlayers((prev) => [
          ...prev,
          { id: playerId, username: username || "Unknown", online: true, lastSeen: null },
        ]);
      } else if (customEvent.type === "playerDisconnect") {
        setOnlinePlayers((prev) => prev.filter((p) => p.id !== playerId));
        fetchPlayers();
      }
    };

    wsManager.addEventListener("playerConnect", handlePlayerActivity);
    wsManager.addEventListener("playerDisconnect", handlePlayerActivity);

    return () => {
      wsManager.removeEventListener("playerConnect", handlePlayerActivity);
      wsManager.removeEventListener("playerDisconnect", handlePlayerActivity);
    };
  }, [wsManager]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Player Activity</h2>
      <div>
        <h3 className="text-md font-medium mb-2 text-green-600">Online Players</h3>
        {onlinePlayers.length === 0 ? (
          <p className="text-gray-500">No players are online</p>
        ) : (
          onlinePlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2 border-b border-gray-200"
            >
              <span>{player.username}</span>
              <span className="text-sm text-green-600">Online</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-md font-medium mb-2 text-red-600">Offline Players</h3>
        {offlinePlayers.length === 0 ? (
          <p className="text-gray-500">No players have logged in yet</p>
        ) : (
          offlinePlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2 border-b border-gray-200"
            >
              <span>{player.username}</span>
              <span className="text-sm text-red-600">Offline</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerActivity;
