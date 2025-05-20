"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useSharedData } from "@/contexts/SharedDataContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatsEntry {
  room: string;
  date: string;
  username: string;
  attributes: {
    [key: string]: number;
  };
}

const GroupStatsPage = () => {
  const { statAttributes, formattedStages } = useSharedData();

  useEffect(() => {
    const levelNames = Object.keys(formattedStages);
    if (levelNames.length > 0) {
      setSelectedRoom(levelNames[0]);
    }
    if (statAttributes.length > 0) {
      setSelectedStat(statAttributes[0].attribute_name);
    }
  }, [formattedStages, statAttributes]);

  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedStat, setSelectedStat] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("Overall");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [statsData, setStatsData] = useState<StatsEntry[]>([]);

  const params = useParams();
  const groupParam = params.group;

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
        `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/web/groupStats`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            group: groupParam,
            level: selectedRoom,
            stage: selectedStage,
          }),
        }
      );

      const data = await response.json();
      const formattedData: StatsEntry[] = data.groupLevelStats.map(
        (entry: {
          date: string;
          username: string;
          level_name: string;
          attributes: Record<string, string | number>;
        }) => ({
          room: entry.level_name,
          date: entry.date,
          username: entry.username,
          attributes: entry.attributes,
        })
      );

      console.log(data);

      setStatsData(formattedData);
    } catch (error) {
      console.error("Error fetching stats data:", error);
    }
  };

  const filteredData = useMemo(() => {
    const grouped = new Map<string, number>();

    return statsData
      .filter((entry) => entry.room === selectedRoom)
      .map((entry) => {
        const value = entry.attributes[selectedStat] ?? 0;
        const key = `${entry.date}-${value}`;

        const count = grouped.get(key) || 0;
        grouped.set(key, count + 1);

        const jitter = count * 0.05;

        return {
          date: entry.date,
          username: entry.username,
          value: value + jitter,
          realValue: value,
        };
      });
  }, [statsData, selectedRoom, selectedStat]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0].payload;

    return (
      <div className="custom-tooltip bg-zinc-800 p-3 rounded-md">
        <p className="text-primary font-semibold">Date: {data.date}</p>
        <p className="text-secondary">User: {data.username}</p>
        <p className="text-secondary">
          {selectedStat}: {data.realValue}{" "}
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8 md:py-12">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-left">
          Group Statistics
        </h1>
        <p className="text-zinc-400 mt-2">
          Monitor statistics for all players in the selected group
        </p>
      </header>

      <div className="p-6 bg-neutral rounded-lg shadow-md w-full mx-auto">
        <h2 className="text-xl font-bold mb-4">Level Stats</h2>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Level Selector */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <label className="font-bold">Select Level:</label>
            <select
              className="bg-neutral text-white border p-1 rounded-md"
              value={selectedRoom}
              onChange={(e) => {
                const newLevel = e.target.value;
                setSelectedRoom(newLevel);
              }}
            >
              {Object.keys(formattedStages).map((levelName) => (
                <option
                  key={levelName}
                  value={levelName}
                  className="bg-gray-800"
                >
                  {levelName}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Selector */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <label className="font-bold">Select Stage:</label>
            <select
              className="bg-neutral text-white border p-1 rounded-md"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              <option value="Overall" className="bg-gray-800">
                Overall
              </option>
              {formattedStages[selectedRoom]
                ?.filter((stageName) => stageName !== "Overall")
                .map((stageName) => (
                  <option
                    key={stageName}
                    value={stageName}
                    className="bg-gray-800"
                  >
                    {stageName}
                  </option>
                ))}
            </select>
          </div>

          {/* Stat Selector */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <label className="font-bold">Select Stat:</label>
            <select
              className="bg-neutral text-white border p-1 rounded-md"
              value={selectedStat}
              onChange={(e) => setSelectedStat(e.target.value)}
            >
              {statAttributes.map((stat) => (
                <option
                  key={stat.attribute_name}
                  value={stat.attribute_name}
                  className="bg-gray-800"
                >
                  {stat.attribute_name}
                </option>
              ))}
            </select>
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

        <div className="w-full h-[400px] flex items-center justify-center">
          {filteredData.length === 0 ? (
            <p className="text-gray-400 text-lg font-semibold">
              No data available for these filters.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis
                  type="category"
                  dataKey="date"
                  tick={{ fill: "#EA8F7F", fontSize: 14 }}
                  allowDuplicatedCategory={false}
                />
                <YAxis
                  type="number"
                  dataKey="value"
                  tick={{ fill: "#EA8F7F", fontSize: 14 }}
                  label={{
                    value: selectedStat,
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  name={`User ${selectedStat}`}
                  data={filteredData}
                  fill="#0C9988"
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupStatsPage;
