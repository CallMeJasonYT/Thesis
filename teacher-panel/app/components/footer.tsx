// components/Footer.tsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4">
      <p>© {new Date().getFullYear()} Made by: Jason Pavlopoulos</p>
    </footer>
  );
};

export default Footer;
