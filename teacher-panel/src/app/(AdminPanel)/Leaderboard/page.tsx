import FilterSearch from "@/components/FilterSearch";
import RecordsTable from "@/components/RecordsTable";

const Leaderboards = () => {
  return (
    <div className="container mx-auto p-8 md:py-12">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-left">
          Leaderboard
        </h1>
        <p className="text-zinc-400 mt-2">Check who is leading the charts</p>
      </header>

      <div className="w-full">
        <FilterSearch />
        <RecordsTable />
      </div>
    </div>
  );
};

export default Leaderboards;
