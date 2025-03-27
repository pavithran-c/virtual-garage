import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode] = useState(true);
  const [themeColor] = useState("#e1b382");

  useEffect(() => {
    // Fetch initial analytics
    const fetchInitialAnalytics = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/analytics");
        if (!response.ok) throw new Error("Failed to fetch analytics");
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialAnalytics();

    // WebSocket setup with client-side safety
    let ws;
    if (typeof window !== "undefined") {
      ws = new WebSocket("ws://localhost:5001");
      ws.onopen = () => console.log("WebSocket connected");
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setAnalytics(data);
      };
      ws.onerror = (err) => console.error("WebSocket error:", err);
      ws.onclose = () => console.log("WebSocket disconnected");
    }

    // Cleanup WebSocket on unmount
    return () => {
      if (ws && typeof window !== "undefined") {
        ws.close();
      }
    };
  }, []);

  const queryFrequency = analytics.reduce((acc, curr) => {
    acc[curr.query] = (acc[curr.query] || 0) + 1;
    return acc;
  }, {});
  const barChartData = Object.entries(queryFrequency).map(([query, count]) => ({ query, count }));

  const predictionDistribution = analytics.reduce((acc, curr) => {
    acc[curr.prediction] = (acc[curr.prediction] || 0) + 1;
    return acc;
  }, {});
  const pieChartData = Object.entries(predictionDistribution).map(([name, value]) => ({ name, value }));
  const COLORS = ["#e1b382", "#c89666", "#2d545e", "#12343b", "#f5c78e", "#8b5e34"];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} p-6`}>
      <motion.h1
        className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        Query Analytics Dashboard
      </motion.h1>

      {loading ? (
        <p className="text-center">Loading analytics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Query Frequency</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#4b5563" : "#e5e7eb"} />
                <XAxis dataKey="query" stroke={darkMode ? "#d1d5db" : "#374151"} tick={{ fontSize: 12 }} />
                <YAxis stroke={darkMode ? "#d1d5db" : "#374151"} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderColor: darkMode ? "#4b5563" : "#e5e7eb" }} />
                <Bar dataKey="count" fill={themeColor} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Prediction Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderColor: darkMode ? "#4b5563" : "#e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-lg md:col-span-2`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Recent Queries (Live Updates)</h2>
            <ul className="space-y-3 max-h-72 overflow-y-auto">
              {analytics.slice(0, 10).map((entry, index) => (
                <li key={index} className={`${darkMode ? "text-gray-300" : "text-gray-700"} border-b ${darkMode ? "border-gray-700" : "border-gray-200"} pb-2`}>
                  <span className="font-semibold">{entry.query}</span> - {entry.prediction} ({(entry.confidence * 100).toFixed(2)}%)<br />
                  <span className="text-sm text-gray-500">{entry.timestamp}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
      <motion.a
        href="/ai-recommender"
        className={`mt-8 inline-block text-[${themeColor}] hover:text-[#f5c78e] transition-colors text-center w-full`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        Back to Home
      </motion.a>
    </div>
  );
}