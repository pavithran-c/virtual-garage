"use client";

import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCar, FaWrench, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import FCCLoadingAnimation from "../FCCLoadingAnimation"; // Adjust path

const fetchRecommendations = async (problem) => {
  const response = await fetch("http://localhost:5000/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations from API");
  }

  return response.json();
};

const AIRecommender = () => {
  const { user } = useContext(AuthContext);
  const [problem, setProblem] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await fetchRecommendations(problem);
      setRecommendations(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24 overflow-hidden">
      <motion.section
        className="max-w-4xl mx-auto px-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold mb-12 text-center text-[#2d545e]"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        >
          AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Recommender</span>
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-lg mb-12 border border-[#e1b382]/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <label className="block text-[#2d545e] font-bold mb-4 text-lg flex items-center">
            <FaWrench className="mr-2 text-[#e1b382]" /> Describe Your Vehicle Problem
          </label>
          <div className="relative">
            <FaCar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g., Engine makes a grinding noise"
              className="w-full pl-12 p-4 rounded-xl border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382] transition-all duration-300"
              required
              disabled={loading}
            />
          </div>
          <motion.button
            type="submit"
            className="mt-6 w-full bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-6 py-3 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Recommendations"}
          </motion.button>
        </motion.form>

        <AnimatePresence>
          {loading && (
            <motion.div
              className="flex justify-center items-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FCCLoadingAnimation />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-100 p-6 rounded-xl shadow-lg mb-12 text-red-700 flex items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <FaExclamationTriangle className="mr-3 text-2xl" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {recommendations && !loading && !error && (
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg mb-12 border border-[#e1b382]/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-[#2d545e] mb-4">
                Recommendations for "<span className="text-[#e1b382]">{recommendations.problem}</span>"
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {recommendations.suggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <FaCar className="text-[#e1b382] mr-2" /> {suggestion}
                  </motion.li>
                ))}
              </ul>
              <motion.button
                className="mt-6 w-full bg-gradient-to-r from-[#2d545e] to-[#12343b] text-white px-6 py-3 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert("Booking feature coming soon!")}
              >
                Book This Service
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-lg border border-[#e1b382]/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-[#2d545e] mb-4 flex items-center">
            <FaInfoCircle className="mr-2 text-[#e1b382]" /> About Friends Car Care
          </h2>
          <p className="text-gray-700 mb-4">
            Friends Car Care has been a trusted name in auto service since 2010, offering top-notch repairs and maintenance with a customer-first approach.
          </p>
          <p className="text-gray-700 mb-4">
            Our AI-driven recommender analyzes your vehicle issues and suggests precise solutions, backed by our expert mechanics and state-of-the-art tools.
          </p>
          <p className="text-gray-700">
            Contact us at: <span className="text-[#e1b382] font-semibold">(123) 456-7890</span> or{" "}
            <span className="text-[#e1b382] font-semibold">support@friendscarcare.com</span>
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default AIRecommender;