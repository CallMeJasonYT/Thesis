// components/BurgerMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { BurgerIcon, XIcon } from "../icons"; // Ensure you have these icons

const categories = ["Overview", "Activity", "Players", "Stats"];

const BurgerMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="sm:hidden max-h-[24px] z-10">
      <button onClick={toggleMenu}>
        <BurgerIcon className="w-6 text-white transition-all" />
      </button>
      {/* 🔹 Overlay Background (Updated) */}
      <div
        className={`fixed inset-0 bg-dark transition-opacity ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      ></div>
      {/* 🔹 Sidebar Menu (Updated) */}
      <aside
        className={`fixed left-0 top-0 w-full sm:w-96 md:w-[400px] lg:w-[500px] xl:w-[700px] h-full bg-zinc-950 transition-all transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative p-6">
          {/* 🔹 Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold text-xl">Menu</h3>
            <button onClick={toggleMenu}>
              <XIcon className="text-white w-6 h-6" />
            </button>
          </div>

          {/* 🔹 Navigation Links */}
          <ul className="space-y-3 mt-8">
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/${category}/`}
                  className="block text-white text-lg p-2 rounded-md hover:bg-secondary transition"
                  onClick={toggleMenu}
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default BurgerMenu;
