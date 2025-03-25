"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCar } from "react-icons/fa";

const FCCLoadingAnimation = () => {
  // Animation variants for the car icon
  const carVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Animation variants for the orbiting dots
  const dotVariants = {
    animate: (i) => ({
      rotate: 360,
      transition: {
        duration: 1.5 + i * 0.5, // Staggered speed for each dot
        repeat: Infinity,
        ease: "linear",
      },
    }),
  };

  return (
    <div className="flex justify-center items-center h-full">
      <div className="relative">
        {/* Central Car Icon */}
        <motion.div
          className="text-[#e1b382] text-5xl"
          variants={carVariants}
          animate="animate"
        >
          <FaCar />
        </motion.div>

        {/* Orbiting Dots */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute top-0 left-0 w-2 h-2 rounded-full"
            style={{
              background: index === 0 ? "#e1b382" : index === 1 ? "#c89666" : "#2d545e",
              transformOrigin: "center",
              top: "-20px", // Adjust orbit radius
            }}
            custom={index}
            variants={dotVariants}
            animate="animate"
            initial={{ x: 0, y: -20 }}
            transition={{
              duration: 1.5 + index * 0.5,
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FCCLoadingAnimation;