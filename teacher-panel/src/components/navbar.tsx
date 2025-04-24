"use client";
import { type ReactElement, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import NotificationSlider from "./NotificationSlider";

import {
  IconX,
  IconMenu2,
  IconDashboard,
  IconUsers,
  IconTrophy,
  TablerIcon,
} from "@tabler/icons-react";
import { cn } from "@/utils/classnameMerge";
import SimpleTooltip from "./simple-tooltip";

type NavbarLink = {
  name?: string | undefined;
  icon: TablerIcon;
  tooltip: string;
  href: string;
};

const links: NavbarLink[] = [
  {
    name: "Overview",
    icon: IconDashboard,
    tooltip: "Go to Overview Page",
    href: "/Overview",
  },
  {
    name: "Players",
    icon: IconUsers,
    tooltip: "Go to the Players Page",
    href: "/Players",
  },
  {
    name: "Leaderboard",
    icon: IconTrophy,
    tooltip: "Go to the Leaderboard Page",
    href: "/Leaderboard",
  },
];

const categories = ["Overview", "Players", "Leaderboard", "Stats"];

const Navbar = (): ReactElement => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <>
      <motion.nav
        className={cn(
          "-mx-7 px-4 py-4 flex justify-between gap-3.5 items-center border-b border-muted"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex-1 flex justify-center sm:justify-start">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            <Image
              src={`/images/admin.png`}
              alt="Thesis Logo"
              width={150}
              height={40}
              draggable={false}
              className="rounded-lg xl:w-[200px]"
            />
          </Link>
        </div>

        {/* Desktop Links - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-3.5">
          {links.map((link: NavbarLink, index: number) => {
            return (
              <SimpleTooltip key={index} content={link.tooltip} side="bottom">
                <Link
                  className={cn(
                    "px-2 sm:px-2.5 md:px-3 py-1.5",
                    "flex gap-1.5 sm:gap-2.5 items-center hover:bg-zinc-700/30 font-semibold rounded-xl transition-all transform-gpu",
                    "bg-zinc-700/30 text-white hover:text-primary"
                  )}
                  href={link.href}
                  draggable={false}
                >
                  <link.icon
                    className={cn(
                      link.href === "/" ? "block" : "hidden sm:block",
                      "size-5"
                    )}
                  />
                  {link.name && <span className="block">{link.name}</span>}
                </Link>
              </SimpleTooltip>
            );
          })}
        </div>

        <div className="ml-auto">
          <NotificationSlider />
        </div>

        {/* Burger Menu Button - Visible only on mobile */}
        <div className="block sm:hidden">
          <IconMenu2
            className="text-white transition-all cursor-pointer"
            onClick={toggleMenu}
          />
        </div>
      </motion.nav>

      {/* Burger Menu Overlay and Sidebar */}
      <div
        className={`fixed inset-0 bg-dark transition-opacity z-30 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      ></div>

      <aside
        className={`fixed left-0 top-0 w-full sm:w-96 md:w-[400px] lg:w-[500px] xl:w-[700px] h-full bg-zinc-950 transition-all transform z-40 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold text-xl">Menu</h3>
            <button onClick={toggleMenu}>
              <IconX />
            </button>
          </div>

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
    </>
  );
};

export default Navbar;
