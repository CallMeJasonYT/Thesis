"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./Table";
import { ChartIcon } from "../icons";
import { useRouter } from "next/navigation";

interface User {
  Username: string;
  lastPlayed: string;
}

const PlayerTable = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<string[]>([]); // Store only group names
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [groupedPlayers, setGroupedPlayers] = useState<{
    [key: string]: User[];
  }>({});

  const handleGroupStatsButton = () => {
    router.push(`/Stats/${selectedGroup}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupResponse = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/groups`
        );
        const groupData = await groupResponse.json();
        console.log(groupData);
        const groupNames = groupData.groupData.map(
          (groupObj: { group_name: string }) => groupObj.group_name
        );
        setGroups(groupNames);
        setSelectedGroup(groupNames[0]);

        const playerResponse = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/player-table`
        );
        const playerData = await playerResponse.json();

        console.log(playerData);

        const playersByGroup: { [key: string]: User[] } = {};
        playerData.playerData.forEach((player: any) => {
          if (!playersByGroup[player.group_name]) {
            playersByGroup[player.group_name] = [];
          }
          playersByGroup[player.group_name].push({
            Username: player.username,
            lastPlayed: player.lastPlayed,
          });
        });

        setGroupedPlayers(playersByGroup);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const selectedGroupUsers = groupedPlayers[selectedGroup] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <p className="mr-4">Select Group: </p>
        <select
          className="bg-dark text-white border p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {groups.length > 0 ? (
            groups.map((group_name, index) => (
              <option key={index} value={group_name}>
                {"Group " + group_name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No groups available
            </option>
          )}
        </select>
        <button
          className="ml-4 bg-primary text-white px-2 py-1 rounded-lg shadow-lg hover:bg-tertiary transition-all"
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
                    <ChartIcon className="mr-5 w-6 h-6 text-secondary cursor-pointer" />
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
