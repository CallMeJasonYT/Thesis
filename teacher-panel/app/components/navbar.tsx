import { type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";

const categories = ["Overview", "Activities", "Players"];

const Navbar = async (): Promise<ReactElement> => {
  return (
    <nav className="-mx-7 px-7 py-5 flex justify-between gap-3.5 items-center border-b border-muted">
      {/* Left */}
      <div className="flex gap-4 sm:gap-6 xl:gap-10 items-center transition-all transform-gpu">
        {/* Branding */}
        <Link
          className="flex gap-4 items-center hover:opacity-75 transition-all transform-gpu"
          href="/"
          draggable={false}
        >
          <Image
            src={`/images/admin.png`}
            alt={`Thesis Logo`}
            width={40}
            height={40}
            draggable={false}
          />
          <h1 className="hidden lg:flex text-xl font-bold">Thesis Dashboard</h1>
        </Link>
        {/* Categories */}
        <div className="flex gap-4 xl:gap-5 sm:gap-3 items-center font-bold transition-all transform-gpu">
          {categories.map((category) => (
            <Link
              key={category}
              className="px-4 py-1.5 flex gap-5 items-center bg-neutral text-sm rounded-lg hover:opacity-75 hover:bg-secondary transition-all transform-gpu"
              href={`/${category}/`}
              draggable={false}
            >
              <span>{category}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
