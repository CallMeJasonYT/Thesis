// app/player-stats/layout.tsx
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
    <body className="min-h-screen bg-gray-50">
      <main className="mx-auto">
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Navbar />
          <main className="flex-grow mx-auto p-4">{children}</main>
          <Footer />
        </div>
      </main>
    </body>
  );
}
