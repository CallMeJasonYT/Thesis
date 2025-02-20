import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./Table"; // Adjust the import path as needed

interface UserRecord {
  username: string;
  overallScore: number;
  fastestCompletionTime: number;
  datetime: string;
}

interface RecordsTableProps {
  data: UserRecord[];
  top?: number; // If provided, limits the number of users displayed
}

const RecordsTable: React.FC<RecordsTableProps> = ({ data, top }) => {
  // Sort by Overall Score in descending order
  const sortedData = [...data].sort((a, b) => b.overallScore - a.overallScore);

  // Slice to get the top X users if `top` is provided
  const displayedData = top ? sortedData.slice(0, top) : sortedData;

  return (
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
              <TableCell className="text-center">{user.overallScore}</TableCell>
              <TableCell className="text-center">
                {user.fastestCompletionTime + " seconds"}
              </TableCell>
              <TableCell className="text-center">{user.datetime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordsTable;
