"use client";

import React, { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useSharedData } from "@/contexts/SharedDataContext";
import {
  IconCheck,
  IconWifi,
  IconUser,
  IconLogin2,
  IconDeviceGamepad2,
  IconStopwatch,
  IconBolt,
} from "@tabler/icons-react";

const OverviewStatsCards = () => {
  const { levelStagesMap } = useSharedData();
  const levels = Object.keys(levelStagesMap);
  const { sendMessage, addListener, removeListener, isConnected } =
    useWebSocket();
  const [stats, setStats] = useState<any>(null);
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [activeRooms, setActiveRooms] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/web/overviewStats`
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
    <div className="space-y-4 md:space-y-8">
      <div className="grid gap-4 md:gap-3 lg:gap-6 sm:grid-cols-2">
        <StatsCard
          title="Player Status"
          stats={[
            {
              label: "Total Players",
              value: stats.totalPlayers,
              icon: <IconUser className="text-secondary" />,
            },
            {
              label: "Online Players",
              value: onlinePlayers,
              icon: <IconWifi className="text-emerald-800" />,
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
              icon: <IconDeviceGamepad2 className="text-secondary" />,
            },
            {
              label: "Active Games",
              value: activeRooms,
              icon: <IconBolt className="text-emerald-800" />,
            },
          ]}
          colorClass="text-primary"
        />
      </div>

      <div className="grid gap-4 md:gap-3 lg:gap-6 sm:grid-cols-3">
        {levels.map(
          (level: string) =>
            level != "Lobby" && (
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
                    icon: <IconLogin2 className="text-tertiary" />,
                  },
                  {
                    label: "Completion Rate",
                    value: `${
                      stats?.roomStats.find(
                        (stat: any) => stat.level_name === level
                      )?.completion_rate ?? "N/A"
                    }%`,
                    icon: <IconCheck className="text-primary" />,
                  },
                  {
                    label: "Average Completion Time (s)",
                    value:
                      stats?.roomStats.find(
                        (stat: any) => stat.level_name === level
                      )?.avg_time ?? "N/A",
                    icon: <IconStopwatch className="text-secondary" />,
                  },
                ]}
                colorClass="text-secondary"
              />
            )
        )}
      </div>
    </div>
  );
};

export default OverviewStatsCards;
