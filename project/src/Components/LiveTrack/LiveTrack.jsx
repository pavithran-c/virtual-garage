import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCar,
  FaCheckCircle,
  FaFilter,
  FaSort,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LiveTrack = () => {
  const { user } = useContext(AuthContext);
  const [inProgress, setInProgress] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusProgress = {
    Pending: { percent: 0, color: "#f59e0b" },
    Accepted: { percent: 15, color: "#3b82f6" },
    "In Progress": { percent: 35, color: "#10b981" },
    Completed: { percent: 100, color: "#22c55e" },
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

        const inProgressAppointments = appointments
          .filter((appt) => ["Pending", "Accepted", "In Progress"].includes(appt.status))
          .map((appt) => ({
            id: appt._id,
            service: appt.services.join(", "),
            status: appt.status,
            progress: statusProgress[appt.status]?.percent || 0,
            date: new Date(appt.date).toISOString().split("T")[0],
            time: appt.time,
            vehicleNumber: appt.number,
            phone: appt.phone,
            updatedAt: appt.updatedAt,
          }));

        const completedAppointments = appointments
          .filter((appt) => appt.status === "Completed")
          .map((appt) => ({
            id: appt._id,
            service: appt.services.join(", "),
            status: appt.status,
            date: new Date(appt.updatedAt || appt.date).toISOString().split("T")[0],
            vehicleNumber: appt.number,
            phone: appt.phone,
          }));

        setInProgress(inProgressAppointments);
        setCompleted(completedAppointments);
        setError("");
      } catch (error) {
        console.error("Error fetching appointments:", error.response || error);
        setError(error.response?.data?.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const filteredInProgress = inProgress
    .filter((appt) => (filterStatus === "All" ? true : appt.status === filterStatus))
    .sort((a, b) => (sortBy === "date" ? new Date(b.date) - new Date(a.date) : a.service.localeCompare(b.service)));

  const filteredCompleted = completed.sort((a, b) =>
    sortBy === "date" ? new Date(b.date) - new Date(a.date) : a.service.localeCompare(b.service)
  );

  const statusCounts = {
    Pending: inProgress.filter((appt) => appt.status === "Pending").length,
    Accepted: inProgress.filter((appt) => appt.status === "Accepted").length,
    "In Progress": inProgress.filter((appt) => appt.status === "In Progress").length,
    Completed: completed.length,
  };

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Appointments by Status",
        data: Object.values(statusCounts),
        backgroundColor: Object.keys(statusCounts).map((status) => statusProgress[status]?.color || "#gray-500"),
        borderColor: Object.keys(statusCounts).map((status) => statusProgress[status]?.color || "#gray-700"),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Appointment Status Distribution" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Number of Appointments" } },
      x: { title: { display: true, text: "Status" } },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-24 px-4 sm:px-6 lg:px-8">
      <motion.section
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-3xl md:text-5xl font-extrabold mb-8 md:mb-12 text-center text-[#2d545e]">
          Live{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">
            Track
          </span>
        </h1>

        {loading && (
          <motion.p
            className="text-gray-700 text-center text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading appointments...
          </motion.p>
        )}

        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.div>
        )}

        {!loading && (
          <motion.div
            className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center bg-[#2d545e] text-white px-4 py-2 rounded-md hover:bg-[#1e4e56] transition"
            >
              <FaFilter className="mr-2" /> Filters
            </button>
            <div className="flex items-center space-x-2">
              <FaSort className="text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e1b382]"
              >
                <option value="date">Sort by Date</option>
                <option value="service">Sort by Service</option>
              </select>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              className="mb-6 p-4 bg-white rounded-xl shadow-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-wrap gap-4">
                {["All", "Pending", "Accepted", "In Progress"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      filterStatus === status
                        ? "bg-[#e1b382] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#2d545e] mb-6">In Progress</h2>
          {!loading && filteredInProgress.length === 0 ? (
            <p className="text-gray-700 text-center">No services in progress.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInProgress.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center mb-4">
                    <FaCar className="text-[#2d545e] mr-2 text-xl" />
                    <h3 className="text-lg md:text-xl font-bold text-[#12343b] truncate">
                      {item.service}
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-2">Status: {item.status}</p>
                  <p className="text-gray-600 text-sm mb-2">Date: {item.date}</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${item.progress}%`,
                        backgroundColor: statusProgress[item.status]?.color,
                      }}
                    ></div>
                  </div>
                  <button
                    onClick={() => setSelectedAppointment(item)}
                    className="flex items-center text-[#e1b382] hover:text-[#c89666] transition"
                  >
                    <FaEye className="mr-1" /> View Details
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#2d545e] mb-6">Completed</h2>
          {!loading && filteredCompleted.length === 0 ? (
            <p className="text-gray-700 text-center">No completed services.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompleted.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center mb-4">
                    <FaCheckCircle className="text-[#2d545e] mr-2 text-xl" />
                    <h3 className="text-lg md:text-xl font-bold text-[#12343b] truncate">
                      {item.service}
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-2">Completed: {item.date}</p>
                  <p className="text-gray-600 text-sm mb-4">Vehicle: {item.vehicleNumber}</p>
                  <button
                    onClick={() => setSelectedAppointment(item)}
                    className="flex items-center text-[#e1b382] hover:text-[#c89666] transition"
                  >
                    <FaEye className="mr-1" /> View Details
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {(inProgress.length > 0 || completed.length > 0) && (
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d545e] mb-6">
              Status Distribution
            </h2>
            <div className="max-w-2xl mx-auto">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedAppointment(null)}
          >
            {/* Blur effect on main content */}
            <div className="absolute inset-0 backdrop-blur-md"></div>
            <motion.div
              className="relative bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10 mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#12343b]">
                  Appointment Details
                </h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-600 hover:text-gray-800 transition"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <p>
                  <span className="font-semibold text-gray-700">Service:</span>{" "}
                  {selectedAppointment.service}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Status:</span>{" "}
                  <span
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${statusProgress[selectedAppointment.status]?.color}20`,
                      color: statusProgress[selectedAppointment.status]?.color,
                    }}
                  >
                    {selectedAppointment.status}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Vehicle Number:</span>{" "}
                  {selectedAppointment.vehicleNumber}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Phone:</span>{" "}
                  {selectedAppointment.phone || "N/A"}
                </p>
                {selectedAppointment.status !== "Completed" ? (
                  <>
                    <p>
                      <span className="font-semibold text-gray-700">Scheduled Date:</span>{" "}
                      {selectedAppointment.date}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Time:</span>{" "}
                      {selectedAppointment.time}
                    </p>
                    <div>
                      <span className="font-semibold text-gray-700 block mb-2">Progress:</span>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${selectedAppointment.progress}%`,
                            backgroundColor: statusProgress[selectedAppointment.status]?.color,
                          }}
                        ></div>
                      </div>
                    </div>
                    {/* Smaller, Aligned Timeline */}
                    <div>
                      <span className="font-semibold text-gray-700 block mb-1 text-sm">Timeline:</span>
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
                        {["Pending", "Accepted", "In Progress", "Completed"].map((step, index) => (
                          <div
                            key={step}
                            className="flex flex-col items-center z-10"
                          >
                            <div
                              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mb-1 ${
                                statusProgress[selectedAppointment.status]?.percent >=
                                statusProgress[step]?.percent
                                  ? "bg-[#e1b382]"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <span className="text-xs text-gray-600 truncate max-w-[60px] sm:max-w-[80px]">
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p>
                    <span className="font-semibold text-gray-700">Completed Date:</span>{" "}
                    {selectedAppointment.date}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveTrack;