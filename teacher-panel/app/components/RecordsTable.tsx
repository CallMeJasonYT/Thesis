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

interface UserRecord {
  username: string;
  highest_score: number;
  time_elapsed: number;
  timestamp: string;
}

const RecordsTable: React.FC<{ top?: number }> = ({ top }) => {
  const [data, setData] = useState<UserRecord[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/leaderboard-table`
        );
        const fetchedData = await response.json();

        console.log("Data:", fetchedData);
        setData(fetchedData.leaderboardData);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchStats();
  }, []);

  // Slice to get the top X users if `top` is provided
  const displayedData = top ? data.slice(0, top) : data;

  return (
    <div className="space-y-4">
      <p className="text-2xl font-bold text-left">
        Escape Room Top 5 Leaderboard
      </p>
      <div className="border border-light shadow-lg rounded-xl">
        <Table className="w-full overflow-x-auto">
          <TableHeader>
            <TableRow className="bg-neutral border-muted text-gray-500">
              <TableHead className="text-center">Username</TableHead>
              <TableHead className="text-center">Overall Score</TableHead>
              <TableHead className="text-center">
                Fastest Completion Time
              </TableHead>
              <TableHead className="text-center">Datetime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedData.map((user, index) => (
              <TableRow
                key={index}
                className="bg-neutral border-muted hover:bg-light"
              >
                <TableCell className="text-center">{user.username}</TableCell>
                <TableCell className="text-center">
                  {user.highest_score}
                </TableCell>
                <TableCell className="text-center">
                  {user.time_elapsed + " seconds"}
                </TableCell>
                <TableCell className="text-center">{user.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecordsTable;
