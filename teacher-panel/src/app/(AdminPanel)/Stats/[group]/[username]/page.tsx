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
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { IconSparkles } from "@tabler/icons-react";
import { PerformanceSummary } from "@/components/PerformanceSummary";
import { motion } from "framer-motion";

interface StatsEntry {
  room: string;
  stage: string;
  date: string;
  username: string;
  attributes: Record<string, number>;
}

// Calculate rounded average of grouped values
const averageGroupedValues = (
  data: Record<string, any>
): Record<string, number> => {
  return Object.entries(data).reduce((acc, [key, values]) => {
    if (Array.isArray(values) && values.length) {
      const sum = values.reduce((a, b) => a + b, 0);
      acc[key] = Math.round((sum / values.length) * 100) / 100;
    }
    return acc;
  }, {} as Record<string, number>);
};

// Custom tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-muted p-3 rounded-2xl border border-border shadow-lg">
      <p className=" font-medium mb-1">{label}</p>
      {payload.map(({ name, value, color }: any, i: number) => (
        <p key={i} className="text-sm" style={{ color }}>
          {name}: {value}
        </p>
      ))}
    </div>
  );
};

export default function UserStatsPage() {
  const { statAttributes, levelStagesMap } = useSharedData();
  const params = useParams();
  const user = params.username;

  // Date range defaults to last 7 days
  const today = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - 7);
    return dt;
  }, [today]);

  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date>(today);
  const [selectedRoom, setSelectedRoom] = useState<string>("Overall");
  const [selectedStage, setSelectedStage] = useState<string>("Overall");
  const [selectedStat, setSelectedStat] = useState<string>("Overall");
  const [statsData, setStatsData] = useState<StatsEntry[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [innerWidth, setInnerWidth] = useState(0);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, []);

  // Derive keys to display
  const statKeys = useMemo(
    () => (selectedStat === "Overall" ? statAttributes : [selectedStat]),
    [selectedStat, statAttributes]
  );

  const stageList = useMemo(() => {
    const allStages =
      selectedRoom === "Overall"
        ? Array.from(new Set(Object.values(levelStagesMap).flat()))
        : levelStagesMap[selectedRoom] || [];
    return selectedStage === "Overall" ? allStages : [selectedStage];
  }, [selectedRoom, selectedStage, levelStagesMap]);

  // Fetch stats on filters change
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/web/userStats`,
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
        const json = await res.json();
        console.log(json);
        setStatsData(
          json.userResults.map((e: any) => ({
            room: e.level_name,
            stage: e.stage_name,
            date: e.date,
            username: e.username,
            attributes: e.attributes,
          }))
        );
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    };

    fetchStats();
  }, [startDate, endDate, selectedRoom, selectedStage, selectedStat, user]);

  // Transform data for chart
  const chartData = useMemo(() => {
    const grouped = new Map<string, any>();
    const levels =
      selectedRoom === "Overall" ? Object.keys(levelStagesMap) : [selectedRoom];

    statsData.forEach(({ date, room, stage, attributes }) => {
      if (!levels.includes(room) || !stageList.includes(stage)) return;
      const key = `${date}-${room}`;
      if (!grouped.has(key)) grouped.set(key, { date, level: room });
      const entry = grouped.get(key);
      statKeys.forEach((stat) => {
        const label = `${stat} ${stage}`;
        if (!entry[label]) entry[label] = [];
        const val = attributes[stat];
        if (typeof val === "number") entry[label].push(val);
      });
    });

    return Array.from(grouped.values())
      .map((d: any) => ({
        date: d.date,
        level: d.level,
        label: `${d.level} (${d.date})`,
        ...averageGroupedValues(d),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [statsData, selectedRoom, statKeys, stageList, levelStagesMap]);

  // Predefined bar colors
  const barColors = useMemo(
    () => ["#8884d8", "#82ca9d", "#ffc658", "#089887", "#f06c9b"],
    []
  );

  const renderBars = () =>
    statKeys.flatMap((stat, si) =>
      stageList.map((stage, sj) => (
        <Bar
          key={`${stat}-${stage}`}
          dataKey={`${stat} ${stage}`}
          stackId={selectedStat === "Overall" ? stat : "a"}
          fill={barColors[(si * stageList.length + sj) % barColors.length]}
        />
      ))
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="container mx-auto p-8 md:py-12"
    >
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Player Statistics</h1>
        <p className="text-zinc-400 mt-2">Monitor statistics for {user}</p>
      </header>

      <div className="p-6 bg-neutral rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h2 className="md:text-xl font-bold">Level Stats</h2>
          <button
            onClick={() => statsData.length && setShowSummary(true)}
            className="p-0.5 text-sm bg-light text-light-foreground font-semibold border-2 border-border rounded-2xl flex items-center gap-2 md:p-1 hover:border-primary transition cursor-pointer"
          >
            <IconSparkles className="w-5 text-primary" />
            {innerWidth < 500 ? "Summary" : "Perfomance Summary"}
          </button>
        </div>

        {showSummary && (
          <PerformanceSummary
            summaryType="individual"
            data={statsData}
            onClose={() => setShowSummary(false)}
          />
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {[
            {
              label: "Level",
              value: selectedRoom,
              options: ["Overall", ...Object.keys(levelStagesMap)],
              onChange: setSelectedRoom,
            },
            {
              label: "Stage",
              value: selectedStage,
              options: [
                "Overall",
                ...Array.from(new Set(Object.values(levelStagesMap).flat())),
              ],
              onChange: setSelectedStage,
            },
            {
              label: "Stat",
              value: selectedStat,
              options: ["Overall", ...statAttributes],
              onChange: setSelectedStat,
            },
          ].map(({ label, value, options, onChange }) => (
            <div
              key={label}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <label className="font-bold">Select {label}:</label>
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="bg-neutral  border-border rounded-2xl">
                  <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 ">
                  {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Date pickers */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="font-bold">Date Range:</span>
          <DatePicker
            selected={startDate}
            onChange={(date) => date && setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="yyyy-MM-dd"
            className="p-1 border rounded-2xl bg-neutral text-center w-36"
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
            className="p-1 border rounded-2xl bg-neutral text-center w-36"
          />
        </div>

        {/* Chart */}
        <div className="w-full h-[350px] flex items-center justify-center">
          {chartData.length === 0 ? (
            <p className="text-gray-400 font-semibold">
              No data for selected filters.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" />
                {innerWidth > 800 ? <XAxis dataKey="label" interval={0} /> : ""}
                <YAxis width={40} />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                {innerWidth > 500 ? <Legend className="hidden sm:block" /> : ""}
                {renderBars()}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
}
