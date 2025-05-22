"use client";
import PlayerTable from "@/components/PlayerTable";
import { motion } from "framer-motion";

const Players = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="container mx-auto p-8 md:py-12"
    >
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-left">Players</h1>
        <p className="text-zinc-400 mt-2">Monitor all the players easily</p>
      </header>

      <div className="w-full">
        <PlayerTable itemsPerPage={5} />
      </div>
    </motion.div>
  );
};

export default Players;
