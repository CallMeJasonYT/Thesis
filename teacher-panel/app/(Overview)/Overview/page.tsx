import RecordsTable from "../../components/RecordsTable";
import OverviewStatsCards from "@/app/components/OverviewStatsCards";

const PlayerStatsOverview = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-left">Overview</h1>
      <OverviewStatsCards />
      <RecordsTable top={5} />
    </div>
  );
};

export default PlayerStatsOverview;
