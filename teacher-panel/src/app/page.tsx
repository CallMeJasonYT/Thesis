import type { ReactElement } from "react";
import Link from "next/link";

const MainPage = async (): Promise<ReactElement> => {
  return (
    <main className="py-20 flex flex-col gap-3 justify-center text-center items-center">
      <div className="mx-auto p-6 bg-neutral rounded-xl border border-light">
        <h1 className="text-2xl font-bold">Welcome to the Admin Panel</h1>
        <p className="text-lg m-4 text-secondary">
          Manage players, monitor activities, and control the system
          efficiently.
        </p>
        <button className="bg-primary text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-tertiary transition-all">
          <Link href="/Overview">Go to Overview</Link>
        </button>
      </div>
    </main>
  );
};
export default MainPage;
