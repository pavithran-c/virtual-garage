import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaCar, FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LiveTrack = () => {
  const { user } = useContext(AuthContext);
  const [inProgress, setInProgress] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Map statuses to progress percentages
  const statusProgress = {
    Pending: 0,
    Accepted: 15,
    "In Progress": 35,
    Completed: 100,
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) {
        setError("Please log in to view your appointments.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/appointments`, {
          withCredentials: true,
        });
        const appointments = response.data;

        // Filter appointments into inProgress and completed
        const inProgressAppointments = appointments
          .filter((appt) =>
            ["Pending", "Accepted", "In Progress"].includes(appt.status)
          )
          .map((appt) => ({
            id: appt._id,
            service: appt.services.join(", "), // Join services array into a string
            status: appt.status,
            progress: statusProgress[appt.status] || 0,
          }));

        const completedAppointments = appointments
          .filter((appt) => appt.status === "Completed")
          .map((appt) => ({
            id: appt._id,
            service: appt.services.join(", "),
            status: appt.status,
            date: new Date(appt.updatedAt || appt.date).toISOString().split("T")[0], // Use updatedAt or date
          }));

        setInProgress(inProgressAppointments);
        setCompleted(completedAppointments);
        setError("");
      } catch (error) {
        console.error("Error fetching appointments:", error.response || error);
        setError(
          error.response?.data?.message || "Failed to fetch appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <motion.section
        className="max-w-6xl mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-extrabold mb-12 text-center text-[#2d545e]">
          Live{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">
            Track
          </span>
        </h1>

        {loading && (
          <p className="text-gray-700 text-center">Loading appointments...</p>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* In Progress */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#2d545e] mb-6">In Progress</h2>
          {!loading && inProgress.length === 0 ? (
            <p className="text-gray-700 text-center">No services in progress.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inProgress.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <FaCar className="text-[#2d545e] mr-2" />
                    <h3 className="text-xl font-bold text-[#12343b]">
                      {item.service}
                    </h3>
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
          {!loading && completed.length === 0 ? (
            <p className="text-gray-700 text-center">No completed services.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completed.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <FaCheckCircle className="text-[#2d545e] mr-2" />
                    <h3 className="text-xl font-bold text-[#12343b]">
                      {item.service}
                    </h3>
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