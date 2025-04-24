"use client";

import React, { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useSharedData } from "@/contexts/SharedDataContext";
import {
  CompletedIcon,
  OnlineIcon,
  PlayersEntered,
  RoomsOpen,
  RoomsTotal,
  StopwatchIcon,
  UsersIcon,
} from "@/icons";

const OverviewStatsCards = () => {
  const { formattedStages } = useSharedData();
  const levels = Object.keys(formattedStages);
  const { sendMessage, addListener, removeListener, isConnected } =
    useWebSocket();
  const [stats, setStats] = useState<any>(null);
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [activeRooms, setActiveRooms] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/overviewStats`
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

    const handleActiveRooms = (data: { rooms: Record<string, any> }) => {
      setActiveRooms(Object.keys(data.rooms).length);
    };

    addListener("online-players-response", handleOnlinePlayers);
    addListener("active-rooms-response", handleActiveRooms);

    if (isConnected) {
      sendMessage({ type: "online-players-request" });
      sendMessage({ type: "active-rooms-request" });
    }

    return () => {
      removeListener("online-players-response", handleOnlinePlayers);
      removeListener("active-rooms-response", handleActiveRooms);
    };
  }, [addListener, removeListener, sendMessage, isConnected]);

  if (!stats || !isConnected) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
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
              value: onlinePlayers,
              icon: <OnlineIcon className="text-emerald-800" />,
            },
          ]}
          colorClass="text-primary"
        />

        <StatsCard
          title="Games Status"
          stats={[
            {
              label: "Total Games",
              value: stats.totalRooms,
              icon: <RoomsTotal className="text-secondary" />,
            },
            {
              label: "Active Games",
              value: activeRooms,
              icon: <RoomsOpen className="text-emerald-800" />,
            },
          ]}
          colorClass="text-primary"
        />
      </div>

      <div className="grid gap-1 md:gap-3 lg:gap-6 sm:grid-cols-3">
        {levels.map((level: string) => (
          <StatsCard
            key={level}
            title={level}
            stats={[
              {
                label: "Total Players Played",
                value:
                  stats?.roomStats.find(
                    (stat: any) => stat.level_name === level
                  )?.total_players ?? "N/A",
                icon: <PlayersEntered className="text-tertiary" />,
              },
              {
                label: "Completion Rate",
                value: `${
                  stats?.roomStats.find(
                    (stat: any) => stat.level_name === level
                  )?.completion_rate ?? "N/A"
                }%`,
                icon: <CompletedIcon className="text-primary" />,
              },
              {
                label: "Average Completion Time (s)",
                value:
                  stats?.roomStats.find(
                    (stat: any) => stat.level_name === level
                  )?.avg_time ?? "N/A",
                icon: <StopwatchIcon className="text-secondary" />,
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
