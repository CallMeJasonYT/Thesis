// components/Footer.tsx
import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mt-auto py-5 flex flex-col justify-center gap-2 items-center text-sm opacity-75">
      <div>
        Made with <span className="animate-pulse">❤️</span> by{" "}
        <Link
          className="ml-1 text-red-400 hover:opacity-75 transition-all font-bold"
          href="https://github.com/CallMeJasonYT"
          target="_blank"
          draggable={false}
        >
          Jason Pavlopoulos
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
