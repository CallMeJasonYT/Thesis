"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useSharedData } from "@/contexts/SharedDataContext";
import DatePicker from "react-datepicker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import "react-datepicker/dist/react-datepicker.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface StatsEntry {
  room: string;
  stage: string;
  date: string;
  username: string;
  attributes: {
    [key: string]: number;
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-muted p-3 rounded-lg border border-border shadow-lg">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={`tooltip-${index}`}
            style={{ color: entry.color }}
            className="text-sm"
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const UserStatsPage = () => {
  const { statAttributes, formattedStages } = useSharedData();
  const [selectedRoom, setSelectedRoom] = useState<string>("Overall");
  const [selectedStat, setSelectedStat] = useState<string>("Overall");
  const [selectedStage, setSelectedStage] = useState<string>("Overall");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [statsData, setStatsData] = useState<StatsEntry[]>([]);

  const params = useParams();
  const user = params.username;

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    setStartDate(start);
    setEndDate(today);
  }, []);

  useEffect(() => {
    if (startDate && endDate && selectedRoom && selectedStat) {
      fetchStatsData(startDate, endDate);
    }
  }, [startDate, endDate, selectedRoom, selectedStat, selectedStage]);

  const fetchStatsData = async (startDate: Date, endDate: Date) => {
    try {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/userStats`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            username: user,
            level: selectedRoom,
            stage: selectedStage,
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      const formattedData: StatsEntry[] = data.userResults.map(
        (entry: {
          date: string;
          username: string;
          stage_name: string;
          level_name: string;
          attributes: Record<string, string | number>;
        }) => ({
          room: entry.level_name,
          stage: entry.stage_name,
          date: entry.date,
          username: entry.username,
          attributes: entry.attributes,
        })
      );

      setStatsData(formattedData);
    } catch (error) {
      console.error("Error fetching stats data:", error);
    }
  };

  const transformedData = useMemo(() => {
    if (!statsData.length) return [];

    const grouped = new Map<string, any>();

    const levels =
      selectedRoom === "Overall"
        ? Object.keys(formattedStages)
        : [selectedRoom];
    const statKeys =
      selectedStat === "Overall"
        ? statAttributes.map((s) => s.attribute_name)
        : [selectedStat];
    const stages =
      selectedStage === "Overall"
        ? selectedRoom === "Overall"
          ? Array.from(new Set(Object.values(formattedStages).flat()))
          : formattedStages[selectedRoom]
        : [selectedStage];

    for (const entry of statsData) {
      const { date, room, stage, attributes } = entry;

      if (!levels.includes(room)) continue;
      if (!stages.includes(stage)) continue;

      const key = `${date} ${room}`;
      if (!grouped.has(key)) grouped.set(key, { date, level: room });

      const current = grouped.get(key);

      for (const stat of statKeys) {
        const attrKey = `${stat} ${stage}`;

        if (!current[attrKey]) current[attrKey] = [];
        if (typeof attributes[stat] === "number") {
          current[attrKey].push(attributes[stat]);
        }
      }
    }

    const result: any[] = [];

    for (const [_, data] of grouped.entries()) {
      const averaged: any = {
        date: data.date,
        level: data.level,
        label: `${data.level} (${data.date})`,
      };

      Object.entries(data).forEach(([key, values]) => {
        if (Array.isArray(values)) {
          const sum = values.reduce((a, b) => a + b, 0);
          averaged[key] = Math.round((sum / values.length) * 100) / 100;
        }
      });

      result.push(averaged);
    }

    return result.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [
    statsData,
    selectedRoom,
    selectedStage,
    selectedStat,
    formattedStages,
    statAttributes,
  ]);

  return (
    <div className="container mx-auto p-8 md:py-12">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-left">
          Player Statistics
        </h1>
        <p className="text-zinc-400 mt-2">
          Monitor statistics for the selected player
        </p>
      </header>

      <div className="p-6 bg-neutral rounded-lg shadow-md w-full mx-auto">
        <h2 className="text-xl font-bold mb-4">Level Stats for {user}</h2>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <label className="font-bold">Select Level:</label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="bg-neutral text-white border-border rounded-lg">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="Overall">Overall</SelectItem>
                {Object.keys(formattedStages).map((levelName) => (
                  <SelectItem key={levelName} value={levelName}>
                    {levelName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <label className="font-bold">Select Stage:</label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="bg-neutral text-white border-border rounded-lg">
                <SelectValue placeholder="Select Stage" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="Overall">Overall</SelectItem>
                {(selectedRoom === "Overall"
                  ? Array.from(new Set(Object.values(formattedStages).flat()))
                  : formattedStages[selectedRoom] || []
                ).map((stageName) => (
                  <SelectItem key={stageName} value={stageName}>
                    {stageName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <label className="font-bold">Select Stat:</label>
            <Select value={selectedStat} onValueChange={setSelectedStat}>
              <SelectTrigger className="bg-neutral text-white border-border rounded-lg">
                <SelectValue placeholder="Select Stat" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="Overall">Overall</SelectItem>
                {statAttributes.map((stat) => (
                  <SelectItem
                    key={stat.attribute_name}
                    value={stat.attribute_name}
                  >
                    {stat.attribute_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <p className="font-bold">Select Date Range:</p>
          <DatePicker
            selected={startDate}
            onChange={(date) => date && setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="yyyy-MM-dd"
            className="p-1 border rounded-md bg-neutral text-center w-[150px]"
          />
          <span className="font-bold">to</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => date && setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="yyyy-MM-dd"
            className="p-1 border rounded-md bg-neutral text-center w-[150px]"
          />
        </div>

        <div className="w-full h-[350px] flex items-center justify-center">
          {transformedData.length === 0 ? (
            <p className="text-gray-400 text-lg font-semibold">
              No data available for these filters.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformedData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" type="category" />
                <YAxis />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Legend />
                {(() => {
                  const stages =
                    selectedStage === "Overall"
                      ? selectedRoom === "Overall"
                        ? Array.from(
                            new Set(Object.values(formattedStages).flat())
                          )
                        : formattedStages[selectedRoom] || []
                      : [selectedStage];

                  const statKeys =
                    selectedStat === "Overall"
                      ? statAttributes.map((s) => s.attribute_name)
                      : [selectedStat];

                  const colors = [
                    "#8884d8",
                    "#82ca9d",
                    "#ffc658",
                    "#089887",
                    "#f06c9b",
                  ];

                  return statKeys.flatMap((stat, sIdx) =>
                    stages.map((stage, stgIdx) => (
                      <Bar
                        key={`${stat} ${stage}`}
                        dataKey={`${stat} ${stage}`}
                        stackId={selectedStat === "Overall" ? stat : "a"}
                        fill={
                          colors[
                            (sIdx * stages.length + stgIdx) % colors.length
                          ]
                        }
                      />
                    ))
                  );
                })()}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserStatsPage;
