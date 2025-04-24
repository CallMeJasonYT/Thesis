"use client";
import { type ReactElement } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import NotificationSlider from "./NotificationSlider";
import BurgerMenu from "./BurgerMenu";

import {
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

const categories = ["Overview", "Players", "Leaderboard"];

const Navbar = (): ReactElement => {
  return (
    <motion.nav
      className={cn(
        "flex justify-between w-fit p-1 mx-auto gap-1 items-center text-sm text-white/85 bg-background/50 backdrop-blur-sm border border-border rounded-2xl duration-250 transition-all transform-gpu z-50"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Links */}
      {links.map((link: NavbarLink, index: number) => {
        return (
          <SimpleTooltip key={index} content={link.tooltip} side="bottom">
            <Link
              className={cn(
                "px-[2px] sm:px-2.5 md:px-3 py-1.5",
                "text-xs flex gap-1.5 sm:gap-2.5 sm:text-sm items-center hover:bg-zinc-700/30 font-light rounded-2xl transition-all transform-gpu",
                "bg-zinc-700/30 text-primary"
              )}
              href={link.href}
              draggable={false}
            >
              <link.icon
                className={cn(
                  link.href === "/" ? "block" : "hidden sm:block",
                  "size-4"
                )}
              />

              {link.name && <span className="block">{link.name}</span>}
            </Link>
          </SimpleTooltip>
        );
      })}
    </motion.nav>
  );
};
export default Navbar;
/*
    <nav className="-mx-7 px-2 py-5 flex justify-between gap-3.5 items-center border-b border-muted">
      <BurgerMenu />

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
      </div>*/

{
  /* Regular Navbar Links (Hidden on small screens) */
} /*
      <div className="hidden sm:flex gap-4 xl:gap-5 sm:gap-3 mr-4 items-center font-bold transition-all transform-gpu">
        {categories.map((category) => (
          <Link
            key={category}
            className="px-4 py-1.5 flex gap-5 xl:text-lg items-center bg-neutral text-sm rounded-lg hover:opacity-90 hover:bg-secondary transition-all transform-gpu"
            href={`/${category}/`}
            draggable={false}
          >
            <span>{category}</span>
          </Link>
        ))}
      </div>

      <div className="ml-auto">
        <NotificationSlider />
      </div>
    </nav>
  );*/
