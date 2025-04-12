import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaCar,
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaHistory,
  FaChartBar,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Profile.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "" ,createdAt:""});
  const [activityLog, setActivityLog] = useState([]);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [details, setdetails]=useState({Authetication:"",createdAt:"",picture:""});
  // Bubble effect: Track cursor movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      const bubbles = document.querySelectorAll(".bubble");
      bubbles.forEach((bubble, index) => {
        const speed = (index + 1) * 0.02;
        const x = e.clientX * speed;
        const y = e.clientY * speed;
        bubble.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setError("Please log in to view your profile.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch user profile from API to ensure accurate data
        const userResponse = await axios.get(`${API_URL}/user/me`, {
          withCredentials: true,
        });
        const userData = userResponse.data.user;
        setEditForm({ username: userData.username, email: userData.email });
        setdetails({Authetication:userData.authType,createdAt:userData.createdAt,picture:userData.picture});
        // Fetch vehicles
        const vehiclesResponse = await axios.get(`${API_URL}/vehicles`, {
          withCredentials: true,
        });
        setVehicles(vehiclesResponse.data);

        // Fetch appointments
        const appointmentsResponse = await axios.get(`${API_URL}/appointments`, {
          withCredentials: true,
        });
        setAppointments(appointmentsResponse.data);

        // Generate activity log
        const activities = [
          ...vehiclesResponse.data.map((v) => ({
            type: "Vehicle Added",
            description: `Added vehicle: ${v.name} (${v.number})`,
            timestamp: v.createdAt || new Date().toISOString(),
          })),
          ...appointmentsResponse.data.map((a) => ({
            type: "Appointment",
            description: `Scheduled: ${a.services.join(", ")} for ${a.number}`,
            timestamp: a.createdAt || a.date,
          })),
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivityLog(activities);

        setError("");
      } catch (err) {
        console.error("Error fetching profile data:", err.response || err);
        setError(err.response?.data?.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_URL}/user/me`,
        editForm,
        { withCredentials: true }
      );
      setEditForm({
        username: response.data.user.username,
        email: response.data.user.email,
        createdAt: response.data.user.createdAt
      });
      setActivityLog([
        {
          type: "Profile Updated",
          description: "Updated username or email",
          timestamp: new Date().toISOString(),
        },
        ...activityLog,
      ]);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err.response || err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const chartData = {
    labels: appointments.map((appt) => appt.date),
    datasets: [
      {
        label: "Appointments",
        data: appointments.map((_, index) => index + 1),
        fill: false,
        borderColor: "#10b981",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Appointment Activity",
        font: { family: "Poppins", size: 18 },
      },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: {
        title: { display: true, text: "Number of Appointments" },
        beginAtZero: true,
      },
    },
  };

  // Validate and format createdAt date
  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return "Unknown";
    const date = new Date(createdAt);
    return isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="profile-page flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user || error) {
    return (
      <div className="profile-page flex items-center justify-center">
        <motion.div
          className="p-6 bg-red-100 text-red-700 rounded-lg shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error || "Please log in to view your profile."}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Bubble background */}
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src={details.picture}
              alt="Profile"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-md"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {editForm.username}'s Profile
              </h1>
              <p className="text-sm md:text-base mt-2 opacity-90">
                {details.Authetication === "google" ? "Google Account" : "Local Account"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.div>
        )}

        {/* Profile Details */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-md mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-teal-800">
              Profile Details
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 transition"
              >
                <FaEdit className="mr-2" /> Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700 transition"
                >
                  <FaSave className="mr-2" /> Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {!isEditing ? (
              <>
                <p className="flex items-center text-gray-700">
                  <FaUser className="mr-2 text-teal-600" /> <strong>Username:</strong>{" "}
                  {editForm.username}
                </p>
                <p className="flex items-center text-gray-700">
                  <FaEnvelope className="mr-2 text-teal-600" /> <strong>Email:</strong>{" "}
                  {editForm.email}
                </p>
                <p className="text-gray-700">
                  <strong>Account Created:</strong> {formatCreatedAt(details.createdAt)}
                </p>
                <p className="text-gray-700">
                  <strong>Authentication:</strong>{" "}
                  {details.Authetication === "google" ? "Google" : "Local"}
                </p>
              </>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition group relative">
            <FaCar className="text-teal-600 text-3xl md:text-4xl" />
            <div>
              <p className="text-gray-600 text-sm md:text-base">Vehicles</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                {vehicles.length}
              </h3>
            </div>
            <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500">
              Total registered vehicles
            </span>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition group relative">
            <FaCalendarAlt className="text-emerald-600 text-3xl md:text-4xl" />
            <div>
              <p className="text-gray-600 text-sm md:text-base">Appointments</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                {appointments.length}
              </h3>
            </div>
            <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500">
              Total scheduled appointments
            </span>
          </div>
        </motion.div>

        {/* Activity Log */}
        <motion.div
          className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-teal-800 flex items-center">
              Activity Log
              <FaHistory className="ml-2 text-teal-600" />
            </h2>
            <button
              onClick={() => setIsActivityOpen(!isActivityOpen)}
              className="text-teal-600 hover:text-teal-800 transition"
            >
              {isActivityOpen ? "Hide" : "Show"}
            </button>
          </div>
          <AnimatePresence>
            {isActivityOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 max-h-60 overflow-y-auto"
              >
                {activityLog.length === 0 ? (
                  <p className="text-gray-600 text-center">No recent activity.</p>
                ) : (
                  activityLog.map((activity, index) => (
                    <div key={index} className="border-b pb-2">
                      <p className="text-gray-800 font-medium">{activity.type}</p>
                      <p className="text-gray-600 text-sm">
                        {activity.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Appointment Trends */}
        {appointments.length > 0 && (
          <motion.div
            className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="text-xl md:text-2xl font-semibold text-teal-800 mb-4 flex items-center">
              Appointment Trends
              <FaChartBar className="ml-2 text-teal-600" />
            </h2>
            <div className="max-w-3xl mx-auto">
              <Line data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        )}

        {/* Logout Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <button
            onClick={logout}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;