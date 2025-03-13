"use client";
import { useState, useEffect, useMemo } from "react";
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

// Define types for stats data
interface StatsEntry {
  room: string;
  date: string;
  total_players: string;
  completion_rate: string;
  avg_time: string;
}

const StatsPage = () => {
  const [selectedRoom, setSelectedRoom] = useState("tutorial");
  const [selectedStat, setSelectedStat] = useState("TimesPlayed");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [statsData, setStatsData] = useState<StatsEntry[]>([]);

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
        `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/levelStats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        }
      );

      const data = await response.json();
      const formattedData = Object.keys(data).flatMap((key) =>
        data[key].map(
          (entry: {
            date: string;
            total_players: string;
            completion_rate: string;
            avg_time: string;
          }) => ({
            room: key,
            date: entry.date,
            total_players: entry.total_players,
            completion_rate: entry.completion_rate,
            avg_time: entry.avg_time,
          })
        )
      );

      setStatsData(formattedData);
    } catch (error) {
      console.error("Error fetching stats data:", error);
    }
  };

  const filteredData = useMemo(() => {
    return statsData
      .filter((entry) => entry.room === selectedRoom)
      .map((entry) => {
        let statValue: number;

        switch (selectedStat) {
          case "TimesPlayed":
            statValue = parseInt(entry.total_players);
            break;
          case "CompletionRate":
            statValue = parseFloat(entry.completion_rate);
            break;
          case "AvgTime":
            statValue = parseInt(entry.avg_time);
            break;
          default:
            statValue = parseInt(entry.total_players);
        }

        return {
          date: entry.date,
          statValue,
        };
      });
  }, [statsData, selectedRoom, selectedStat]);

  const CustomTooltip = ({ payload, label }: any) => {
    if (!payload || payload.length === 0) return null;
    const statValue = payload[0].value;
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#27272a",
          padding: "10px",
          borderRadius: "6px",
        }}
      >
        <p style={{ color: "#0C9988", fontWeight: "bold" }}>{label}</p>
        <p style={{ color: "#fff" }}>
          {selectedStat}: {statValue}
        </p>
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
            <option className="bg-gray-800" value="tutorial">
              Tutorial
            </option>
            <option className="bg-gray-800" value="training">
              Training
            </option>
            <option className="bg-gray-800" value="escapeRoom">
              Escape Room
            </option>
          </select>
        </div>

        <div className="flex justify-start items-center mb-6 gap-2">
          <p className="font-bold">Select Stats:</p>
          <select
            className="bg-neutral text-white border p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedStat}
            onChange={(e) => setSelectedStat(e.target.value)}
          >
            <option className="bg-gray-800" value="TimesPlayed">
              Times Played
            </option>
            <option className="bg-gray-800" value="CompletionRate">
              Completion Rate
            </option>
            <option className="bg-gray-800" value="AvgTime">
              Average Time
            </option>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              align="center"
              verticalAlign="bottom"
              layout="horizontal"
              formatter={(value) => (value === "stat" ? selectedStat : value)}
              wrapperStyle={{ paddingTop: 10 }}
            />
            <Line
              type="monotone"
              dataKey="statValue"
              stroke="#0C9988"
              strokeWidth={2}
              dot={{ r: 3, stroke: "#0C9988" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsPage;
