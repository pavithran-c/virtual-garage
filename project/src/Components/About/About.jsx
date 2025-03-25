import React from "react";
import { motion } from "framer-motion";
import { FaInfoCircle, FaCar } from "react-icons/fa";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <motion.section
        className="max-w-6xl mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-extrabold mb-12 text-center text-[#2d545e]">
          About <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Us</span>
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-[#2d545e] mb-6 flex items-center">
            <FaCar className="mr-2" /> Friends Car Care
          </h2>
          <p className="text-gray-700 mb-4">
            Founded in 2010, Friends Car Care is dedicated to providing exceptional auto repair and maintenance services. Our mission is to ensure every vehicle leaves our shop in top condition, with a focus on customer satisfaction and quality workmanship.
          </p>
          <p className="text-gray-700">
            With a team of certified technicians and state-of-the-art facilities, we handle everything from routine oil changes to complex engine repairs.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-[#2d545e] mb-6 flex items-center">
            <FaInfoCircle className="mr-2" /> Our Website
          </h2>
          <p className="text-gray-700 mb-4">
            The Friends Car Care website offers a seamless experience for booking services, tracking vehicle progress in real-time, and getting AI-powered recommendations for vehicle issues.
          </p>
          <p className="text-gray-700">
            Explore our services, contact us, or manage your profile—all designed to make car care simple and efficient.
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default About;