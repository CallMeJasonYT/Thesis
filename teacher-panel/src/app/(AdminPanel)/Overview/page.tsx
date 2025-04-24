import { type ReactElement } from "react";
import OverviewStatsCards from "@/components/OverviewStatsCards";

const PlayerStatsOverview = (): ReactElement => {
  return (
    <div className="container mx-auto p-8 md:py-12">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-left">Overview</h1>
        <p className="text-zinc-400 mt-2">
          Monitor all your statistics at a glance
        </p>
      </header>

      <div className="w-full">
        <OverviewStatsCards />
      </div>
    </div>
  );
};

export default PlayerStatsOverview;
