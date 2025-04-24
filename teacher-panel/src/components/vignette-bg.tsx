"use client";
import { motion } from "framer-motion";
import { ReactElement } from "react";

{
  /* 
  This component adds a vignette background effect.
  It creates a radial gradient ellipse, transitioning from a light cyan to transparent,
  giving a subtle focus toward the center of the screen.
*/
}

const VignetteBackground = (): ReactElement => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
    className="fixed inset-0 h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_100%_100%,rgba(143,238,245,0.02),rgba(255,255,255,0))] z-[-2]"
  />
);
export default VignetteBackground;
