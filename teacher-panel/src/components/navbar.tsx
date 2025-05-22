"use client";
import { type ReactElement, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

const Navbar = (): ReactElement => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <>
      <motion.nav
        className="px-4 py-4 flex justify-between items-center border-b border-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex-1 flex justify-center sm:justify-start">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition"
          >
            <Image
              src="/images/admin.png"
              alt="Thesis Logo"
              width={150}
              height={40}
              style={{ width: "200px", height: "40px" }}
              draggable={false}
              className="rounded-lg xl:w-[200px]"
            />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden sm:flex items-center gap-1.5 md:gap-3.5">
          {links.map((link, index) => (
            <SimpleTooltip key={index} content={link.tooltip} side="bottom">
              <Link
                className={cn(
                  "px-1.5 sm:px-2 md:px-3 py-1",
                  "flex gap-1 lg:gap-2.5 items-center font-semibold border border-border rounded-2xl transition-all",
                  "bg-zinc-700/50  hover:text-primary"
                )}
                href={link.href}
                draggable={false}
              >
                <link.icon className="size-5" />
                {link.name && <span className="block">{link.name}</span>}
              </Link>
            </SimpleTooltip>
          ))}
        </div>

        {/* Notifications Button */}
        <NotificationSlider />

        {/* Burger Menu Button */}
        <div className="block sm:hidden">
          <IconMenu2 className=" cursor-pointer" onClick={toggleMenu} />
        </div>
      </motion.nav>

      {/* Burger Menu Overlay */}
      <div
        className={`fixed inset-0 bg-dark transition-opacity z-30 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      />

      {/* Burger Menu Sidebar */}
      <aside
        className={`fixed left-0 top-0 w-full sm:w-96 h-full bg-zinc-950 transition-all transform z-40 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className=" font-semibold text-xl">Menu</h3>
            <IconX className="cursor-pointer" onClick={toggleMenu} />
          </div>

          <ul className="space-y-5 mt-8">
            {links.map((link, index) => (
              <li key={index}>
                <Link
                  className={cn(
                    "p-4",
                    "flex gap-2 items-center font-semibold rounded-2xl transition-all transform-gpu",
                    "bg-zinc-700/30  hover:text-primary text-xl"
                  )}
                  href={link.href}
                  draggable={false}
                  onClick={toggleMenu}
                >
                  <link.icon className="size-5" />
                  {link.name && <span>{link.name}</span>}
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
