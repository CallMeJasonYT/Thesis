import FilterSearch from "@/app/components/FilterSearch";
import RecordsTable from "../../components/RecordsTable";

const Leaderboards = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-left">Leaderboards</h1>

      <FilterSearch />
      <RecordsTable />
    </div>
  );
};

export default Leaderboards;
