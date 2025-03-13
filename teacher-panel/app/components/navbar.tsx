// components/Navbar.tsx
import { type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import NotificationSlider from "./NotificationSlider";
import BurgerMenu from "./BurgerMenu"; // Import the sidebar

const categories = ["Overview", "Activity", "Players", "Stats"];

const Navbar = async (): Promise<ReactElement> => {
  return (
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
      </div>

      {/* Regular Navbar Links (Hidden on small screens) */}
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
  );
};

export default Navbar;
