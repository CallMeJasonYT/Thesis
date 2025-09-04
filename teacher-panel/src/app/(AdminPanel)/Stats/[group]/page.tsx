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

// Average array of numbers
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
  const group = params.group;

  const today = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - 7);
    return dt;
  }, [today]);

  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date>(today);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("Overall");
  const [selectedStat, setSelectedStat] = useState<string>("");
  const [statsData, setStatsData] = useState<StatsEntry[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [innerWidth, setInnerWidth] = useState(0);
  const hasMounted = useRef(false);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, []);

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
    if (!selectedRoom || !selectedStat) {
      setStatsData([]);
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch(
          `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/web/groupStats`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              group,
              level: selectedRoom,
              stage: selectedStage,
            }),
          }
        );
        const json = await res.json();
        console.log(json);
        setStatsData(
          json.groupResults.map((e: any) => ({
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
  }, [startDate, endDate, selectedRoom, selectedStage, selectedStat, group]);

  // Transform chart data
  const chartData = useMemo(() => {
    const grouped = new Map<string, any>();
    statsData.forEach(({ username, stage, date, attributes }) => {
      if (selectedStage !== "Overall" && selectedStage !== stage) return;

      const key = date;
      if (!grouped.has(key)) grouped.set(key, { date, breakdown: {} });
      const entry = grouped.get(key);

      if (!entry.breakdown[username]) entry.breakdown[username] = {};

      statAttributes.forEach((attr) => {
        if (selectedStat && selectedStat !== attr) return;

        const val = attributes[attr];
        let total = 0;
        let subBreakdown: Record<string, number> = {};

        if (typeof val === "number") {
          total = val;
          subBreakdown[attr] = val;
        } else if (typeof val === "object" && val !== null) {
          const valTyped = val as Record<string, number>;
          subBreakdown = { ...valTyped };
          total = Object.values(valTyped).reduce((a, b) => a + b, 0);
        }

        const dataKey = `${username}_${attr}_${stage}`;
        if (!entry[dataKey]) entry[dataKey] = [];
        entry[dataKey].push(total);

        // Aggregate breakdown across stages for Overall
        if (!entry.breakdown[username]) entry.breakdown[username] = {};
        if (!entry.breakdown[username][attr]) {
          entry.breakdown[username][attr] = { ...subBreakdown };
        } else {
          Object.entries(subBreakdown).forEach(([k, v]) => {
            entry.breakdown[username][attr][k] =
              (entry.breakdown[username][attr][k] || 0) + v;
          });
        }
      });
    });

    return Array.from(grouped.values()).map((entry: any) => ({
      date: entry.date,
      ...averageGroupedValues(entry),
      breakdown: entry.breakdown,
    }));
  }, [statsData, selectedStage, selectedStat, statAttributes]);

  // Render bars
  const renderBars = () => {
    if (!chartData.length) return [];
    const users = Array.from(new Set(statsData.map((d) => d.username))).sort();
    const stagesToShow =
      selectedStage === "Overall" ? stageList : [selectedStage];

    return users.flatMap((username) =>
      statAttributes
        .filter((attr) => !selectedStat || selectedStat === attr)
        .flatMap((attr) =>
          stagesToShow.map((stage) => {
            const dataKey = `${username}_${attr}_${stage}`;
            return (
              <Bar
                key={dataKey}
                dataKey={dataKey}
                stackId={username}
                fill={stageColorMap[stage]}
                name={`${username} - ${attr} ${stage}`}
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
    const breakdown = dataEntry.breakdown || {};
    const offsetX = 175;
    const users = Array.from(new Set(statsData.map((d) => d.username))).sort();

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
        {users.map((username) => {
          const userBreakdown = breakdown[username];
          if (!userBreakdown) return null;

          return (
            <div key={username} className="mb-2">
              <p className="font-semibold text-sm text-secondary">{username}</p>
              {Object.entries(userBreakdown).map(
                ([attr, subBreakdown]: [string, any]) => {
                  const subBreakdownTyped = subBreakdown as Record<
                    string,
                    number
                  >;

                  const total = Object.values(subBreakdownTyped).reduce(
                    (acc, v) => acc + v,
                    0
                  );

                  return (
                    <div key={attr} className="mb-1 ml-2">
                      <p className="text-sm font-medium text-secondary">
                        {attr}: {total}
                      </p>
                      <ul className="ml-4 list-disc list-inside text-sm">
                        {Object.entries(subBreakdownTyped).map(
                          ([type, value]) => (
                            <li key={type}>
                              {type}: {value}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  );
                }
              )}
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
      options: statAttributes,
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
        <h1 className="text-2xl md:text-3xl font-bold">Group Statistics</h1>
        <p className="text-zinc-400 mt-2">
          Monitor statistics for Group {group}
        </p>
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
            summaryType="group"
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
