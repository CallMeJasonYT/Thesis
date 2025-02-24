"use client";
import React, { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";
import { useWebSocket } from "../contexts/WebSocketContext";
import WebSocketHandler from "../components/WebSocketHandler";
import {
  CompletedIcon,
  OnlineIcon,
  PlayersEntered,
  RoomsOpen,
  RoomsTotal,
  StopwatchIcon,
  UsersIcon,
} from "../icons";

const OverviewStatsCards = () => {
  const { sendMessage, addListener, removeListener } = useWebSocket();
  const [stats, setStats] = useState<any>(null);
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [activeRooms, setActiveRooms] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:3030/api/web/overview-card-stats"
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

  useEffect(() => {
    const handleOnlinePlayers = (data: { count: number }) => {
      setOnlinePlayers(data.count);
    };

    const handleActiveRooms = (data: {
      rooms: Record<string, { count: number; users: string[] }>;
    }) => {
      setActiveRooms(Object.keys(data.rooms).length);
    };

    addListener("online-players-response", handleOnlinePlayers);
    addListener("active-rooms-response", handleActiveRooms);

    sendMessage({ type: "online-players-request" });
    sendMessage({ type: "active-rooms-request" });

    return () => {
      removeListener("online-players-response", handleOnlinePlayers);
      removeListener("active-rooms-response", handleActiveRooms);
    };
  }, [addListener, removeListener, sendMessage]);

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <WebSocketHandler
        onOnlinePlayersUpdate={setOnlinePlayers}
        onActiveRoomsUpdate={setActiveRooms}
      />

      <div className="grid gap-1 md:gap-3 lg:gap-6 sm:grid-cols-2">
        <StatsCard
          title="Player Status"
          stats={[
            {
              label: "Total Players",
              value: stats.totalPlayers,
              icon: <UsersIcon className="text-secondary" />,
            },
            {
              label: "Online Players",
              value: onlinePlayers - 1,
              icon: <OnlineIcon className="text-emerald-800" />,
            },
          ]}
          colorClass="text-primary"
        />

        <StatsCard
          title="Room Status"
          stats={[
            {
              label: "Total Rooms",
              value: stats.totalRooms,
              icon: <RoomsTotal className="text-secondary" />,
            },
            {
              label: "Active Rooms",
              value: activeRooms,
              icon: <RoomsOpen className="text-emerald-800" />,
            },
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
              icon: <PlayersEntered className="text-tertiary" />,
            },
            {
              label: "Completion Rate",
              value: `${stats.tutorialRoomStats.completion_rate}%`,
              icon: <CompletedIcon className="text-primary" />,
            },
            {
              label: "Average Completion Time (s)",
              value: stats.tutorialRoomStats.avg_time,
              icon: <StopwatchIcon className="text-secondary" />,
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
              icon: <PlayersEntered className="text-tertiary" />,
            },
            {
              label: "Completion Rate",
              value: `${stats.trainingRoomStats.completion_rate}%`,
              icon: <CompletedIcon className="text-primary" />,
            },
            {
              label: "Average Completion Time (s)",
              value: stats.trainingRoomStats.avg_time,
              icon: <StopwatchIcon className="text-secondary" />,
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
              icon: <PlayersEntered className="text-tertiary" />,
            },
            {
              label: "Completion Rate",
              value: `${stats.escapeRoomStats.completion_rate}%`,
              icon: <CompletedIcon className="text-primary" />,
            },
            {
              label: "Average Completion Time (s)",
              value: stats.escapeRoomStats.avg_time,
              icon: <StopwatchIcon className="text-secondary" />,
            },
          ]}
          colorClass="text-quaternary"
        />
      </div>
    </div>
  );
};

export default OverviewStatsCards;
