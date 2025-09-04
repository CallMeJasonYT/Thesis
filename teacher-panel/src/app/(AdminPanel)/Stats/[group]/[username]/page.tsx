"use client";
import { useState, useEffect, useMemo, useRef } from "react";
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
} from "recharts";
import { IconSparkles } from "@tabler/icons-react";
import { PerformanceSummary } from "@/components/performanceSummary";
import { motion } from "framer-motion";

interface StatsEntry {
  room: string;
  stage: string;
  date: string;
  username: string;
  attributes: Record<string, any>;
}

const BAR_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#089887", "#f06c9b"];

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col sm:flex-row items-center gap-2">
    <label className="font-bold">Select {label}:</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-neutral border-border rounded-2xl">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent className="bg-gray-800">
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default function UserStatsPage() {
  const { statAttributes, levelStagesMap } = useSharedData();
  const params = useParams();
  const username = params.username;

  // Dates
  const today = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - 7);
    return dt;
  }, [today]);

  // State
  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date>(today);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("Overall");
  const [selectedStat, setSelectedStat] = useState<string>("Overall");
  const [statsData, setStatsData] = useState<StatsEntry[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [innerWidth, setInnerWidth] = useState(0);
  const hasMounted = useRef(false);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, []);

  // Derive which stats to show (all if "Overall")
  const statKeys = useMemo(
    () => (selectedStat === "Overall" ? statAttributes : [selectedStat]),
    [selectedStat, statAttributes]
  );

  const stageList = useMemo(() => {
    return selectedRoom
      ? levelStagesMap[selectedRoom]
      : Array.from(new Set(Object.values(levelStagesMap).flat()));
  }, [selectedRoom, levelStagesMap]);

  const stageColorMap = useMemo(() => {
    const stages = selectedStage === "Overall" ? stageList : [selectedStage];
    return stages.reduce((acc, stage, index) => {
      acc[stage] = BAR_COLORS[index % BAR_COLORS.length];
      return acc;
    }, {} as Record<string, string>);
  }, [selectedStage, stageList]);

  // Fetch stats
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (!selectedRoom) {
      setStatsData([]);
      return;
    }

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
              username,
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
  }, [startDate, endDate, selectedRoom, selectedStage, selectedStat, username]);

  // Transform chart data
  const chartData = useMemo(() => {
    const grouped = new Map<string, any>();

    const allSubKeys: Record<string, Set<string>> = {};
    statKeys.forEach((stat) => {
      allSubKeys[stat] = new Set();
    });

    statsData.forEach(({ username, stage, date, attributes }) => {
      const key = date;
      if (!grouped.has(key)) grouped.set(key, { date, breakdown: {} });
      const entry = grouped.get(key);

      statKeys.forEach((stat) => {
        const statData = attributes[stat];
        if (!statData) return;

        if (!entry.breakdown[stat]) entry.breakdown[stat] = {};

        Object.entries(statData).forEach(([subKey, value]) => {
          const dataKey = `${username}_${stat}_${subKey}`;
          entry[dataKey] = (entry[dataKey] || 0) + value;
          entry.breakdown[stat][subKey] =
            (entry.breakdown[stat][subKey] || 0) + value;

          allSubKeys[stat].add(subKey);
        });
      });
    });

    // Fill missing dataKeys with 0
    grouped.forEach((entry) => {
      statsData.forEach(({ username }) => {
        statKeys.forEach((stat) => {
          allSubKeys[stat].forEach((subKey) => {
            const dataKey = `${username}_${stat}_${subKey}`;
            if (!(dataKey in entry)) entry[dataKey] = 0;
          });
        });
      });
    });

    return Array.from(grouped.values());
  }, [statsData, statKeys]);

  // Render bars
  const renderBars = () => {
    if (!chartData.length) return [];

    const users = Array.from(new Set(statsData.map((d) => d.username))).sort();

    return users.flatMap((username) =>
      statKeys.flatMap((stat) =>
        Object.keys(chartData[0]) // Use first entry to get all dataKeys
          .filter((key) => key.startsWith(`${username}_${stat}_`))
          .map((dataKey) => {
            const subKey = dataKey.split("_").slice(2).join("_");
            return (
              <Bar
                key={dataKey}
                dataKey={dataKey}
                stackId={`${username}_${stat}`} // stack per stat
                fill={stageColorMap[subKey] || "#8884d8"}
                name={`${username} - ${stat} ${subKey}`}
              />
            );
          })
      )
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label, coordinate }: any) => {
    if (!active || !payload?.length) return null;

    const dataEntry = payload[0].payload;
    const offsetX = 175;

    return (
      <div
        style={{
          left: coordinate?.x + offsetX,
          top: coordinate?.y / 3,
          pointerEvents: "none",
        }}
        className="absolute bg-muted p-3 rounded-2xl border border-border shadow-lg min-w-[300px]"
      >
        <p className="font-medium mb-2 text-primary">{label}</p>

        {statKeys.map((stat) => {
          const breakdown = dataEntry.breakdown?.[stat] as
            | Record<string, number>
            | undefined;
          if (!breakdown) return null;

          const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

          return (
            <div key={stat} className="mb-2">
              <p className="font-semibold text-sm text-secondary">
                {stat}: {total}
              </p>
              <ul className="list-disc list-inside text-sm">
                {Object.entries(breakdown).map(([type, value]) => (
                  <li key={type}>
                    {stat === "Total Time" ? type : type}: {value}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  const filters = [
    {
      label: "Level",
      value: selectedRoom,
      options: Object.keys(levelStagesMap),
      onChange: setSelectedRoom,
    },
    {
      label: "Stage",
      value: selectedStage,
      options: ["Overall", ...stageList],
      onChange: setSelectedStage,
    },
    {
      label: "Stat",
      value: selectedStat,
      options: ["Overall", ...statAttributes],
      onChange: setSelectedStat,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="container mx-auto p-8 md:py-12"
    >
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">User Statistics</h1>
        <p className="text-zinc-400 mt-2">Monitor statistics for {username}</p>
      </header>

      <div className="p-6 bg-neutral rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h2 className="md:text-xl font-bold">Level Stats</h2>
          <button
            onClick={() => statsData.length && setShowSummary(true)}
            className="p-0.5 text-sm bg-light text-light-foreground font-semibold border-2 border-border rounded-2xl flex items-center gap-2 md:p-1 hover:border-primary transition cursor-pointer"
          >
            <IconSparkles className="w-5 text-primary" />
            {innerWidth < 500 ? "Summary" : "Performance Summary"}
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
          {filters.map((filter) => (
            <FilterSelect key={filter.label} {...filter} />
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
                {innerWidth > 800 && <XAxis dataKey="date" interval={0} />}
                <YAxis width={40} />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                {renderBars()}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
}
