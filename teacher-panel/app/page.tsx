import type { ReactElement } from "react";
import Link from "next/link";

const MainPage = async (): Promise<ReactElement> => {
  return (
    <main className="py-20 flex flex-col gap-3 justify-center text-center items-center">
      <div className="mx-auto p-6 bg-neutral-800 rounded-lg">
        <h1 className="text-2xl font-bold">Welcome to the Admin Panel</h1>
        <p className="text-lg m-4 text-white">
          Manage players, monitor activities, and control the system
          efficiently.
        </p>
        <button className="bg-blue-500 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600">
          <Link href="/Overview">Go to Overview</Link>
        </button>
      </div>
    </main>
  );
};
export default MainPage;
