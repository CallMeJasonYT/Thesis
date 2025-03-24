"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
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

// Define types for stats data
interface StatsEntry {
  room: string;
  date: string;
  username: string;
  avg_time: number;
}

const StatsPage = () => {
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [statsData, setStatsData] = useState<StatsEntry[]>([]);
  const [roomOptions, setRoomOptions] = useState<string[]>([]);

  const params = useParams();
  const groupParam = params.group;

  const setDefaultDates = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    setStartDate(start);
    setEndDate(today);
  };

  useEffect(() => {
    setDefaultDates();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchStatsData(startDate, endDate);
    }
  }, [startDate, endDate]);

  const fetchStatsData = async (startDate: Date, endDate: Date) => {
    try {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/GrouplevelStats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            group: groupParam,
          }),
        }
      );

      const data = await response.json();

      // Extract unique room names from the response data and set the room options
      const roomNames: string[] = data.groupLevelStats.map(
        (entry: { level_name: string }) => entry.level_name
      );
      setRoomOptions([...new Set(roomNames)]);

      // Map the fetched data to the StatsEntry type
      const formattedData: StatsEntry[] = data.groupLevelStats.map(
        (entry: {
          date: string;
          username: string;
          level_name: string;
          avg_time: string;
        }) => ({
          room: entry.level_name,
          date: entry.date,
          username: entry.username,
          avg_time: parseInt(entry.avg_time),
        })
      );

      setStatsData(formattedData);

      if (!selectedRoom && roomNames.length > 0) {
        setSelectedRoom(roomNames[0]);
      }
    } catch (error) {
      console.error("Error fetching stats data:", error);
    }
  };

  const filteredData = useMemo(() => {
    return statsData
      .filter((entry) => entry.room === selectedRoom)
      .map((entry) => ({
        date: entry.date,
        username: entry.username,
        avg_time: entry.avg_time,
      }));
  }, [statsData, selectedRoom]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0].payload;

    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#27272a",
          padding: "10px",
          borderRadius: "6px",
        }}
      >
        <p style={{ color: "#0C9988", fontWeight: "bold" }}>
          Date: {data.date}
        </p>
        <p style={{ color: "#fff" }}>User: {data.username}</p>
        <p style={{ color: "#fff" }}>Avg Time: {data.avg_time} sec</p>
      </div>
    );
  };

  return (
    <div className="p-6 bg-neutral rounded-lg shadow-md w-full mx-auto">
      <h2 className="text-xl font-bold mb-4">Room Stats</h2>

      <div className="flex gap-8 items-center">
        <div className="flex justify-start items-center mb-6 gap-2">
          <p className="font-bold">Select Room:</p>
          <select
            className="bg-neutral text-white border p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            {roomOptions.length === 0 ? (
              <option className="bg-gray-800" value="">
                No rooms available
              </option>
            ) : (
              roomOptions.map((room) => (
                <option className="bg-gray-800" key={room} value={room}>
                  {room.charAt(0).toUpperCase() + room.slice(1)}
                </option>
              ))
            )}
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
          className="p-1 border rounded-md bg-neutral w-full sm:w-auto"
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
          className="p-1 border rounded-md bg-neutral w-full sm:w-auto"
        />
      </div>

      <div className="w-full h-[400px] flex items-center justify-center">
        {filteredData.length === 0 ? (
          <p className="text-gray-400 text-lg font-semibold">
            No data available for these dates.
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
                dataKey="avg_time"
                tick={{ fill: "#EA8F7F", fontSize: 14 }}
                label={{
                  value: "Avg Time (sec)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                name="User Avg Time"
                data={filteredData}
                fill="#0C9988"
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
