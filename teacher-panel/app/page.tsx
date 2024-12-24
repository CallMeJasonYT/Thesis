"use client";

import React from "react";
import Link from "next/link";

export default function MainPage() {
  return (
    <body className="min-h-screen bg-gray-50">
      <header className="bg-blue-500 text-white p-4 shadow-md">
        <h1 className="text-center text-2xl font-bold">Admin Panel</h1>
      </header>
      <main className="mx-auto">
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
          <h1 className="text-4xl font-bold mb-4 text-blue-600">
            Welcome to the Admin Panel
          </h1>
          <p className="text-lg mb-8">
            Manage players, monitor activities, and control the system
            efficiently.
          </p>
          <div className="space-x-4">
            <Link
              href="/Overview"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600"
            >
              Go to Player Stats
            </Link>
          </div>
        </div>
      </main>
    </body>
  );
}
