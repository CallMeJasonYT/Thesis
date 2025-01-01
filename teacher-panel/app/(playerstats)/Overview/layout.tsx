import React from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

export const metadata = {
  title: "Player Stats",
  description: "View and analyze player statistics.",
};

export default function PlayerStatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow mx-auto p-4 bg-gray-100 w-full max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}
