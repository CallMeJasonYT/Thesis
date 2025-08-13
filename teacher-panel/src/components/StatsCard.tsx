import React from "react";

interface StatsCardProps {
  title: string;
  stats: { label: string; value: string | number; icon?: React.ReactNode }[];
  colorClass?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, stats, colorClass }) => {
  return (
    <div className="card bg-neutral shadow-lg rounded-2xl p-5 border transition-all hover:shadow-xl">
      <h2 className={`font-semibold ${colorClass || "text-primary"}`}>
        {title}
      </h2>
      <div className="mt-4 space-y-2 sm:text-sm lg:text-lg text-md">
        {stats.map((stat, index) => (
          <p key={index} className="flex items-center gap-2 font-medium">
            {stat.icon}
            {stat.label}: {stat.value}
          </p>
        ))}
      </div>
    </div>
  );
};

export default StatsCard;
