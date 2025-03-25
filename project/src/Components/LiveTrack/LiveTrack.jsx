import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { FaCar, FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const LiveTrack = () => {
  const { user } = useContext(AuthContext);
  
  // Mock data (replace with API fetch)
  const [inProgress, setInProgress] = useState([
    { id: 1, service: "Oil Change", status: "In Progress", progress: 60 },
    { id: 2, service: "Brake Pad Replacement", status: "In Progress", progress: 30 },
  ]);
  const [completed, setCompleted] = useState([
    { id: 3, service: "Tire Rotation", status: "Completed", date: "2025-03-20" },
    { id: 4, service: "Battery Replacement", status: "Completed", date: "2025-03-18" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <motion.section
        className="max-w-6xl mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-extrabold mb-12 text-center text-[#2d545e]">
          Live <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Track</span>
        </h1>

        {/* In Progress */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#2d545e] mb-6">In Progress</h2>
          {inProgress.length === 0 ? (
            <p className="text-gray-700 text-center">No services in progress.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inProgress.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center mb-4">
                    <FaCar className="text-[#2d545e] mr-2" />
                    <h3 className="text-xl font-bold text-[#12343b]">{item.service}</h3>
                  </div>
                  <p className="text-gray-700 mb-2">Status: {item.status}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#e1b382] h-2.5 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        <div>
          <h2 className="text-3xl font-bold text-[#2d545e] mb-6">Completed</h2>
          {completed.length === 0 ? (
            <p className="text-gray-700 text-center">No completed services.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completed.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center mb-4">
                    <FaCheckCircle className="text-[#2d545e] mr-2" />
                    <h3 className="text-xl font-bold text-[#12343b]">{item.service}</h3>
                  </div>
                  <p className="text-gray-700">Status: {item.status}</p>
                  <p className="text-gray-700">Completed: {item.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default LiveTrack;