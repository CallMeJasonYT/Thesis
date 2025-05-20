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
import { IconDeviceDesktopAnalytics } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import SimpleTooltip from "./simple-tooltip";
import {
  Pagination,
  PaginationPrevious,
  PaginationNext,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

interface User {
  Username: string;
  lastPlayed: string;
}

interface PlayerTableProps {
  itemsPerPage?: number;
}

const PlayerTable: React.FC<PlayerTableProps> = ({ itemsPerPage = 10 }) => {
  const router = useRouter();
  const { groups } = useSharedData();
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [groupedPlayers, setGroupedPlayers] = useState<Record<string, User[]>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroup(groups[0].group_name);
    }
  }, [groups]);

  useEffect(() => {
    if (!selectedGroup) return;

    (async () => {
      try {
        const res = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/web/getGroupedPlayers`
        );
        const json = await res.json();
        const playersByGroup: Record<string, User[]> = {};

        json.playerData.forEach((p: any) => {
          if (!playersByGroup[p.group_name]) playersByGroup[p.group_name] = [];
          playersByGroup[p.group_name].push({
            Username: p.username,
            lastPlayed: p.last_played,
          });
        });

        setGroupedPlayers(playersByGroup);
        setCurrentPage(1);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    })();
  }, [selectedGroup]);

  const users = groupedPlayers[selectedGroup] || [];
  const pageCount = Math.ceil(users.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = users.slice(start, start + itemsPerPage);

  const goToPage = (page: number) => {
    if (page < 1 || page > pageCount) return;
    setCurrentPage(page);
  };

  const handleGroupStats = () => {
    router.push(`/Stats/${selectedGroup}`);
  };

  const handleUserStats = (username: string) => {
    router.push(`/Stats/${selectedGroup}/${username}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="text-white font-semibold text-lg">
          Select Group:
        </label>
        <Select
          value={selectedGroup}
          onValueChange={setSelectedGroup}
          disabled={groups.length === 0}
        >
          <SelectTrigger className="bg-neutral text-white border-border rounded-2xl">
            <SelectValue placeholder={groups.length ? "" : "No Groups"} />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white">
            {groups.map((g) => (
              <SelectItem key={g.group_name} value={g.group_name}>
                {`Group ${g.group_name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleGroupStats}>Show Group Stats</Button>
      </div>

      <div className="border shadow-lg rounded-xl">
        <Table className="w-full overflow-x-auto">
          <TableHeader>
            <TableRow className="bg-neutral">
              <TableHead className="text-center">Username</TableHead>
              <TableHead className="text-center">Last Activity</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length ? (
              paginatedUsers.map((u) => (
                <TableRow key={u.Username} className="hover:bg-neutral">
                  <TableCell className="text-center">{u.Username}</TableCell>
                  <TableCell className="text-center">{u.lastPlayed}</TableCell>
                  <TableCell className="flex justify-end">
                    <SimpleTooltip
                      content={`View stats for ${u.Username}`}
                      side="top"
                    >
                      <IconDeviceDesktopAnalytics
                        className="w-6 h-6 text-secondary cursor-pointer"
                        onClick={() => handleUserStats(u.Username)}
                      />
                    </SimpleTooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No players
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

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
      </div>
    </div>
  );
};

export default PlayerTable;
