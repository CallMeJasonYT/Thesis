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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import SimpleTooltip from "./simple-tooltip";
import { Skeleton } from "./ui/skeleton";

interface AttributeValue {
  Sum: number;
  [stage: string]: number;
}

interface LeaderboardRecord {
  date: string;
  username: string;
  attributes: {
    [key: string]: AttributeValue;
  };
  score: number;
}

interface LeaderboardProps {
  itemsPerPage?: number;
}

const TableSkeleton: React.FC<{ columns: number; rows: number }> = ({
  columns,
  rows,
}) => {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <TableRow key={i} className="border-muted">
          <TableCell colSpan={columns} className="text-center py-4">
            <Skeleton className="h-4 w-full rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

const AttributeTooltipContent: React.FC<{
  attributeName: string;
  attributeValue: AttributeValue;
  score: number;
}> = ({ attributeName, attributeValue, score }) => {
  const stages = Object.entries(attributeValue).filter(
    ([key]) => key !== "Sum"
  );

  return (
    <div className="p-2">
      <div className="font-semibold text-sm mb-2">{attributeName}</div>
      <div className="space-y-1">
        <div className="text-xs">
          <span className="font-medium">Total: </span>
          <span>{attributeValue.Sum}</span>
        </div>
        {stages.map(([stage, value]) => (
          <div key={stage} className="text-xs">
            <span className="font-medium">{stage}: </span>
            <span>{value}</span>
          </div>
        ))}
        {score >= 0 ? (
          <div className="text-xs mt-2 border-t pt-2 text-primary">
            <span className="font-medium">Score: </span>
            <span>{score}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const RecordsTable: React.FC<LeaderboardProps> = ({ itemsPerPage = 10 }) => {
  const { filters, statAttributes } = useSharedData();
  const [data, setData] = useState<LeaderboardRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchStats = async () => {
      if (!filters) return;

      setIsLoadingRecords(true);
      try {
        const response = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/web/getLeaderboardRecords`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filters),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error ${response.status}: ${errorData.error}`);
        }

        const fetchedData = await response.json();
        setData(fetchedData.leaderboardResults);
        console.log(fetchedData);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching records:", error);
        setData([]);
      } finally {
        setIsLoadingRecords(false);
      }
    };

    fetchStats();
  }, [filters]);

  const totalColumns = 2 + statAttributes.length;
  const records = data || [];
  const pageCount = Math.ceil(records.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = records.slice(start, start + itemsPerPage);

  const goToPage = (page: number) => {
    if (page < 1 || page > pageCount) return;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="border shadow-lg rounded-2xl">
        <Table className="w-full overflow-x-auto">
          <TableHeader>
            <TableRow className="bg-neutral border-muted">
              <TableHead className="text-center bg-neutral">Username</TableHead>
              <TableHead className="text-center bg-neutral">Date</TableHead>
              {statAttributes.map((stat) => (
                <TableHead key={stat} className="text-center bg-neutral">
                  {stat}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingRecords ? (
              <TableSkeleton columns={totalColumns} rows={itemsPerPage} />
            ) : data.length > 0 && paginatedRecords.length ? (
              paginatedRecords.map((record, index) => (
                <TableRow
                  key={index}
                  className="border-muted hover:bg-muted/80"
                >
                  <TableCell className="text-center">
                    {record.username}
                  </TableCell>
                  <TableCell className="text-center">{record.date}</TableCell>
                  {statAttributes.map((stat) => {
                    const attributeValue = record.attributes?.[stat];
                    const displayValue = attributeValue?.Sum ?? "-";

                    return (
                      <TableCell key={stat} className="text-center">
                        {attributeValue &&
                        typeof attributeValue === "object" &&
                        "Sum" in attributeValue ? (
                          <SimpleTooltip
                            content={
                              <AttributeTooltipContent
                                attributeName={stat}
                                attributeValue={attributeValue}
                                score={
                                  filters?.selectedFilter === "advanced"
                                    ? record.score
                                    : -1
                                }
                              />
                            }
                            side="top"
                          >
                            <span className="cursor-help hover:text-primary transition-colors">
                              {displayValue}
                            </span>
                          </SimpleTooltip>
                        ) : (
                          <span>{displayValue}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="bg-neutral border-muted">
                <TableCell colSpan={totalColumns} className="text-center py-4">
                  No records found with the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <Pagination className="p-4">
          <PaginationPrevious onClick={() => goToPage(currentPage - 1)} />
          <PaginationContent>
            {Array.from({ length: pageCount }, (_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === pageCount ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={`ellipsis-${page}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
          </PaginationContent>
          <PaginationNext onClick={() => goToPage(currentPage + 1)} />
        </Pagination>
      )}
      <div className="text-right text-sm text-gray-400">
        {data.length} records found
      </div>
    </div>
  );
};

export default RecordsTable;
