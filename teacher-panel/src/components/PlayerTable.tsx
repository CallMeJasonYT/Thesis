"use client";
import React, { useEffect, useState } from "react";
import { useSharedData } from "@/contexts/SharedDataContext";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./Table";
import { ChartIcon } from "@/icons";
import { useRouter } from "next/navigation";

interface User {
  Username: string;
  lastPlayed: string;
}

const PlayerTable = () => {
  const router = useRouter();
  const { groups } = useSharedData();
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [groupedPlayers, setGroupedPlayers] = useState<Record<string, User[]>>(
    {}
  );

  const handleGroupStatsButton = () => {
    router.push(`/Stats/${selectedGroup}`);
  };

  const handleStatsButton = (username: string) => {
    router.push(`/Stats/${selectedGroup}/${username}`);
  };

  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroup(groups[0].group_name);
    }
  }, [groups]);

  useEffect(() => {
    if (!selectedGroup) return;

    const fetchData = async () => {
      try {
        const playerResponse = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/getGroupedPlayers`
        );
        const playerData = await playerResponse.json();

        const playersByGroup: Record<string, User[]> = {};
        playerData.playerData.forEach((player: any) => {
          if (!playersByGroup[player.group_name]) {
            playersByGroup[player.group_name] = [];
          }
          playersByGroup[player.group_name].push({
            Username: player.username,
            lastPlayed: player.last_played,
          });
        });

        setGroupedPlayers(playersByGroup);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedGroup]);

  const selectedGroupUsers = groupedPlayers[selectedGroup] || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <p>Select Group: </p>
        <select
          className="bg-neutral text-white border p-1 rounded-md "
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {groups.length > 0 ? (
            groups.map((group, index) => (
              <option
                className="bg-gray-800"
                key={index}
                value={group.group_name}
              >
                {"Group " + group.group_name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No groups available
            </option>
          )}
        </select>
        <button
          className="bg-primary text-white px-2 py-1 rounded-lg shadow-lg hover:bg-tertiary transition-all"
          onClick={handleGroupStatsButton}
        >
          Show Group Stats
        </button>
      </div>

      <div className="border border-light shadow-lg rounded-xl">
        <Table className="w-full overflow-x-auto">
          <TableHeader>
            <TableRow className="bg-neutral border-muted">
              <TableHead className="text-center">Player Username</TableHead>
              <TableHead className="text-center">Last Activity</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedGroupUsers.length > 0 ? (
              selectedGroupUsers.map((user, index) => (
                <TableRow key={index} className="border-muted hover:bg-light">
                  <TableCell className="text-center">{user.Username}</TableCell>
                  <TableCell className="text-center">
                    {user.lastPlayed}
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <ChartIcon
                      className="mr-5 w-6 h-6 text-secondary cursor-pointer"
                      onClick={() => handleStatsButton(user.Username)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No players available for this group
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PlayerTable;
