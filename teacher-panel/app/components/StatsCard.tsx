import React from "react";

interface StatsCardProps {
  title: string;
  stats: { label: string; value: string | number; icon?: React.ReactNode }[];
  colorClass?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, stats, colorClass }) => {
  return (
    <div className="card bg-neutral shadow-lg rounded-xl p-5 border border-light transition-all hover:shadow-xl">
      <h2 className={`text-lg font-semibold ${colorClass || "text-primary"}`}>
        {title}
      </h2>
      <div className="mt-4 space-y-2 sm:text-sm lg:text-lg text-md">
        {stats.map((stat, index) => (
          <p key={index} className="flex items-center gap-2">
            {stat.icon && (
              <span className="size-5 text-gray-500">{stat.icon}</span>
            )}
            <strong>{stat.label}:</strong> {stat.value}
          </p>
        ))}
      </div>
    </div>
  );
};

export default StatsCard;
