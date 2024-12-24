"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BurgerIcon, CloseIcon } from "../icons";

const Navbar = () => {
  const [navbar, setNavbar] = useState(false);

  return (
    <nav className="w-full bg-blue-500 top-0 left-0 right-0 z-10">
      <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
        <div>
          <div className="flex items-center justify-between py-3 md:py-5 md:block">
            {/* LOGO */}
            <Link href="/">
              <h2 className="text-2xl text-white font-bold ">LOGO</h2>
            </Link>
            <div className="md:hidden">
              <button
                className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
                onClick={() => setNavbar(!navbar)}
              >
                {navbar ? (
                  <CloseIcon className="w-6 h-6 text-white" />
                ) : (
                  <BurgerIcon className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div>
          <div
            className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
              navbar
                ? "p-12 md:p-0 block transition-all duration-500 ease-in-out"
                : "hidden"
            }`}
          >
            <ul className="h-screen md:h-auto items-center justify-center md:flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
              <li className="text-xl text-white py-2 md:px-6 text-center border-b-2 md:border-b-0 hover:bg-orange-500 border-orange-700 md:hover:text-white md:hover:bg-transparent">
                <Link href="#about" onClick={() => setNavbar(!navbar)}>
                  About
                </Link>
              </li>
              <li className="text-xl text-white py-2 px-6 text-center border-b-2 md:border-b-0 hover:bg-orange-500 border-orange-700 md:hover:text-white md:hover:bg-transparent">
                <Link href="#blog" onClick={() => setNavbar(!navbar)}>
                  Blogs
                </Link>
              </li>
              <li className="text-xl text-white py-2 px-6 text-center border-b-2 md:border-b-0 hover:bg-orange-500 border-orange-700 md:hover:text-white md:hover:bg-transparent">
                <Link href="#contact" onClick={() => setNavbar(!navbar)}>
                  Contact
                </Link>
              </li>
              <li className="text-xl text-white py-2 px-6 text-center border-b-2 md:border-b-0 hover:bg-orange-500 border-orange-700 md:hover:text-white md:hover:bg-transparent">
                <Link href="#projects" onClick={() => setNavbar(!navbar)}>
                  Projects
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
