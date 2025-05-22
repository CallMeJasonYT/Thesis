"use client";

import { motion } from "framer-motion";
import { ReactElement } from "react";
import { GridPattern } from "@/components/ui/GridPattern";

const BackgroundPattern = (): ReactElement => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    className="pointer-events-none fixed inset-0 mx-0 max-w-none overflow-hidden"
  >
    <div className="absolute left-1/2 top-0 ml-[-46rem] h-[25rem] w-[100rem] [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-primary/100 opacity-25 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
        <GridPattern
          width={60}
          height={35}
          x={100}
          y={180}
          squares={[
            [4, 2],
            [6, 4],
            [8, 2],
            [9, 5],
            [11, 3],
            [12, 1],
            [13, 4],
            [15, 2],
          ]}
          className="dark:fill-white/2.5 absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[0deg] fill-black/85 stroke-black/60 mix-blend-overlay dark:stroke-white/5"
        />
      </div>
    </div>
  </motion.div>
);

export default BackgroundPattern;
