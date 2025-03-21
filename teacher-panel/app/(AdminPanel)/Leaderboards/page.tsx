import RecordsTable from "../../components/RecordsTable";

const Leaderboards = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-left">Leaderboards</h1>
      <RecordsTable top={5} />
    </div>
  );
};

export default Leaderboards;
