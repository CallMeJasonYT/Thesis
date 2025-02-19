import { type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";

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
        <div className="flex gap-2 sm:gap-3 items-center font-bold transition-all transform-gpu">
          <div>
            <Link
              className="px-2.5 py-1 flex gap-2 items-center bg-neutral-800 text-sm rounded-lg hover:opacity-75 transition-all transform-gpu"
              href={`/records/`}
              draggable={false}
            >
              <span>Overview</span>
            </Link>
          </div>
          <div>
            <Link
              className="px-2.5 py-1 flex gap-2 items-center  bg-neutral-800 text-sm rounded-lg hover:opacity-75 transition-all transform-gpu"
              href={`/records/`}
              draggable={false}
            >
              <span>Activities</span>
            </Link>
          </div>
          <div>
            <Link
              className="px-2.5 py-1 flex gap-2 items-center bg-neutral-800 text-sm rounded-lg hover:opacity-75 transition-all transform-gpu"
              href={`/records/`}
              draggable={false}
            >
              <span>Players</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
