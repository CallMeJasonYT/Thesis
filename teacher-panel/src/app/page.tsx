import type { ReactElement } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MainPage = async (): Promise<ReactElement> => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-180px)]">
      <div className="mx-6 p-5 md:mx-auto bg-neutral rounded-xl border border-border text-center">
        <h1 className="text-2xl font-bold text-center">
          Welcome to the Admin Panel
        </h1>
        <p className="text-lg m-6 text-secondary">
          Manage players, monitor activities, and control the system
          efficiently.
        </p>
        <Button className="bg-primary text-lg px-5 py-2 shadow-lg transition-all">
          <Link href="/Overview">Go to Overview</Link>
        </Button>
      </div>
    </div>
  );
};
export default MainPage;
