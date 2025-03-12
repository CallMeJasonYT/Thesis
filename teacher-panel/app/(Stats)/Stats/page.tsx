"use client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Sample data
const data = [
  { date: "2025-03-08", room1: 10, room2: 5, room3: 8 },
  { date: "2025-03-09", room1: 15, room2: 7, room3: 12 },
  { date: "2025-03-10", room1: 8, room2: 10, room3: 6 },
  { date: "2025-03-11", room1: 8, room2: 10, room3: 6 },
  { date: "2025-03-12", room1: 8, room2: 10, room3: 6 },
  { date: "2025-03-13", room1: 8, room2: 10, room3: 6 },
  { date: "2025-03-14", room1: 8, room2: 10, room3: 6 },
];

// Convert string dates to Date objects
const parseDate = (dateStr: string) => new Date(dateStr);

const StatsPage = () => {
  const [selectedRoom, setSelectedRoom] = useState("room1");

  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(lastWeek);
  const [endDate, setEndDate] = useState(today);

  const filteredData = data
    .filter(
      (entry) =>
        parseDate(entry.date) >= startDate && parseDate(entry.date) <= endDate
    )
    .map((entry) => ({
      date: entry.date,
      TimesPlayed: entry[selectedRoom as keyof typeof entry],
    }));

  return (
    <div className="p-6 bg-neutral rounded-lg shadow-md w-full mx-auto">
      <h2 className="text-xl font-bold mb-4">Room Play Count</h2>

      <div className="flex justify-start items-center mb-4 space-x-4">
        <p className="font-bold">Select Room:</p>
        <select
          className="bg-neutral text-white border p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
        >
          <option className="bg-gray-800" value="room1">
            Room 1
          </option>
          <option className="bg-gray-800" value="room2">
            Room 2
          </option>
          <option className="bg-gray-800" value="room3">
            Room 3
          </option>
        </select>
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

      {/* Responsive Chart */}
      <div className="w-full" style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="2 2" />
            <XAxis
              dy={10}
              tick={{ fill: "#EA8F7F", fontSize: 14 }}
              dataKey="date"
            />
            <YAxis dx={-5} tick={{ fill: "#EA8F7F", fontSize: 14 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#27272a",
                borderRadius: "6px",
              }}
              labelStyle={{ fontWeight: "bold", color: "#0C9988" }}
            />
            <Legend
              align="center"
              verticalAlign="bottom"
              layout="horizontal"
              formatter={(value) =>
                value === "TimesPlayed" ? "Times Played" : value
              }
              wrapperStyle={{
                paddingTop: 10,
              }}
            />
            <Line
              type="monotone"
              dataKey="TimesPlayed"
              stroke="#0C9988"
              strokeWidth={2}
              dot={{ r: 3, stroke: "#EA8F7F" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsPage;
