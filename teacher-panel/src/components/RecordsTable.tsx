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
import { useSharedData } from "@/contexts/SharedDataContext";

interface LeaderboardRecord {
  date: string;
  username: string;
  attributes: {
    [key: string]: number;
  };
}

const RecordsTable: React.FC<{ top?: number }> = ({ top }) => {
  const { filters, isLoading, statAttributes } = useSharedData();
  const [data, setData] = useState<LeaderboardRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!filters) return;

      setIsLoadingRecords(true);
      try {
        const response = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/getLeaderboardRecords`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filters),
          }
        );

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const fetchedData = await response.json();
        setData(fetchedData.leaderboardResults);
      } catch (error) {
        console.error("Error fetching records:", error);
        setData([]);
      } finally {
        setIsLoadingRecords(false);
      }
    };

    fetchStats();
  }, [filters]);

  // Slice to get the top X users if `top` is provided
  const displayedData = top ? data.slice(0, top) : data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-white">Loading data...</div>
      </div>
    );
  }

  const totalColumns = 2 + statAttributes.length;

  return (
    <div className="space-y-4">
      <div className="border border-light shadow-lg rounded-xl">
        <div className="max-h-96 overflow-y-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-neutral border-muted">
                <TableHead className="text-center bg-neutral">
                  Username
                </TableHead>
                <TableHead className="text-center bg-neutral">Date</TableHead>
                {statAttributes.map((attribute) => (
                  <TableHead
                    key={attribute.attribute_name}
                    className="text-center bg-neutral"
                  >
                    {attribute.attribute_name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRecords ? (
                <TableRow className="bg-neutral border-muted">
                  <TableCell
                    colSpan={totalColumns}
                    className="text-center py-4"
                  >
                    Loading records...
                  </TableCell>
                </TableRow>
              ) : displayedData.length > 0 ? (
                displayedData.map((record, index) => (
                  <TableRow key={index} className="border-muted hover:bg-light">
                    <TableCell className="text-center">
                      {record.username}
                    </TableCell>
                    <TableCell className="text-center">{record.date}</TableCell>
                    {statAttributes.map((attribute) => (
                      <TableCell
                        key={attribute.attribute_name}
                        className="text-center"
                      >
                        {record.attributes &&
                        record.attributes[attribute.attribute_name] !==
                          undefined
                          ? record.attributes[attribute.attribute_name]
                          : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="bg-neutral border-muted">
                  <TableCell
                    colSpan={totalColumns}
                    className="text-center py-4"
                  >
                    No records found with the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-right text-sm text-gray-400">
        {displayedData.length} records found
      </div>
    </div>
  );
};

export default RecordsTable;
