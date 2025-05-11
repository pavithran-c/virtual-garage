import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChartPie,
  FaDownload,
  FaEye,
  FaTimes,
  FaBars,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaHourglassHalf,
  FaCheck,
} from "react-icons/fa";
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
import { saveAs } from "file-saver";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EMPLOYEE_API_URL = "http://localhost:5001/api/admin/appointments";

const Employee = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [toast, setToast] = useState(null);

  const reasons = [
    "Employee Shortage",
    "Workshop Holiday",
    "Equipment Maintenance",
    "Unexpected Closure",
  ];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch(EMPLOYEE_API_URL, {
          method: "GET",
          headers: {
            Authorization: "Basic " + btoa("admin:admin123"),
          },
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch appointments: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        setAppointments(
          data.map((appt) => ({
            id: appt._id || appt.id,
            name: appt.username || "Unknown User",
            service: appt.services?.join(", ") || "N/A",
            date: appt.date || "N/A",
            status: appt.status || "Pending",
            changeRequested: appt.changeRequested || false,
            changeReason: appt.changeReason || null,
            vehicleNumber: appt.number || "N/A",
            phone: appt.phone || "N/A",
          }))
        );
        setError("");
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
        setError(
          `Unable to load appointments. The server may be down or there was a network issue. (${error.message})`
        );
        setToast({
          type: "error",
          message: "Failed to load appointments. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleAccept = async (id) => {
    try {
      const response = await fetch(`${EMPLOYEE_API_URL}/accept/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("admin:admin123"),
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to accept appointment: ${errorData.message || response.statusText}`);
      }
      const updatedAppointment = await response.json();
      setAppointments(
        appointments.map((appt) =>
          appt.id === id ? { ...appt, status: updatedAppointment.status } : appt
        )
      );
      setToast({ type: "success", message: "Appointment accepted successfully" });
    } catch (error) {
      console.error("Error accepting appointment:", error);
      setToast({ type: "error", message: error.message });
    }
  };

  const handleInProgress = async (id) => {
    try {
      const response = await fetch(`${EMPLOYEE_API_URL}/in-progress/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("admin:admin123"),
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to set In Progress: ${errorData.message || response.statusText}`);
      }
      const updatedAppointment = await response.json();
      setAppointments(
        appointments.map((appt) =>
          appt.id === id ? { ...appt, status: updatedAppointment.status } : appt
        )
      );
      setToast({ type: "success", message: "Appointment set to In Progress" });
    } catch (error) {
      console.error("Error setting In Progress:", error);
      setToast({ type: "error", message: error.message });
    }
  };

  const handleComplete = async (id) => {
    try {
      const response = await fetch(`${EMPLOYEE_API_URL}/complete/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("admin:admin123"),
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to complete appointment: ${errorData.message || response.statusText}`);
      }
      const updatedAppointment = await response.json();
      setAppointments(
        appointments.map((appt) =>
          appt.id === id ? { ...appt, status: updatedAppointment.status } : appt
        )
      );
      setToast({ type: "success", message: "Appointment completed successfully" });
    } catch (error) {
      console.error("Error completing appointment:", error);
      setToast({ type: "error", message: error.message });
    }
  };

  const handleRequestDateChange = async (id, reason) => {
    if (!reason || reason === "") {
      setToast({ type: "error", message: "Please select a reason before requesting a date change." });
      return;
    }

    try {
      const response = await fetch(`${EMPLOYEE_API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("admin:admin123"),
        },
        body: JSON.stringify({ changeRequested: true, changeReason: reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to request date change: ${errorData.message || response.statusText}`);
      }

      const updatedAppointment = await response.json();
      setAppointments(
        appointments.map((appt) =>
          appt.id === id
            ? {
                ...appt,
                changeRequested: updatedAppointment.changeRequested,
                changeReason: updatedAppointment.changeReason,
              }
            : appt
        )
      );
      setToast({
        type: "success",
        message: `Requested date change. Reason: ${reason}`,
      });
    } catch (error) {
      console.error("Error requesting date change:", error);
      setToast({ type: "error", message: error.message });
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ["ID", "User", "Service", "Date", "Status", "Vehicle Number", "Phone"];
      const rows = filteredAppointments.map((appt) => [
        appt.id,
        appt.name,
        appt.service,
        appt.date,
        appt.status,
        appt.vehicleNumber,
        appt.phone || "N/A",
      ]);
      const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `appointments-${new Date().toISOString().split("T")[0]}.csv`);
      setToast({ type: "success", message: "Appointments exported to CSV" });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setToast({ type: "error", message: "Failed to export appointments" });
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const matchesSearch =
        appt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.service.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "All" || appt.status === filterStatus;
      const matchesDate = filterDate ? appt.date.includes(filterDate) : true;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, filterStatus, filterDate]);

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, Accepted: 0, "In Progress": 0, Completed: 0 };
    appointments.forEach((appt) => {
      counts[appt.status] = (counts[appt.status] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Appointments by Status",
        data: Object.values(statusCounts),
        backgroundColor: ["#f2d53c", "#7d3cff", "#c80e13", "#7d3cff"],
        borderColor: ["#d4b932", "#6b21a8", "#a30b0f", "#6b21a8"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { font: { family: "Poppins", size: 14 } } },
      title: {
        display: true,
        text: "Appointment Status Distribution",
        font: { family: "Poppins", size: 18, weight: "600" },
        color: "#1f2937",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count", font: { family: "Poppins" } },
        grid: { color: "#e5e7eb" },
      },
      x: {
        title: { display: true, text: "Status", font: { family: "Poppins" } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#fceed1] font-poppins flex">
      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#7d3cff] text-white p-6 shadow-2xl transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:flex md:flex-col md:min-h-screen transition-transform duration-300 backdrop-blur-md bg-opacity-95`}
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Employee Dashboard</h2>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes className="text-xl" />
          </button>
        </div>
        <nav className="flex-1 space-y-3">
          <button className="flex items-center w-full p-3 text-left rounded-xl bg-[#f2d53c] bg-opacity-20 hover:bg-opacity-30 transition">
            <FaCalendarAlt className="mr-3 text-[#f2d53c]" /> My Tasks
          </button>
          <button
            className="flex items-center w-full p-3 text-left rounded-xl hover:bg-[#f2d53c] hover:bg-opacity-20 transition"
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
          >
            <FaChartPie className="mr-3 text-[#f2d53c]" /> Analytics
          </button>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <button
          className="md:hidden mb-6 p-3 bg-[#7d3cff] text-white rounded-full shadow-lg hover:bg-[#7d3cff]/80 transition"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars className="text-xl" />
        </button>

        <motion.div
          className="max-w-7xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#7d3cff] tracking-tight">
              Employee Task Dashboard
            </h1>
            <span className="text-gray-600 font-medium">
              {filteredAppointments.length} Tasks
            </span>
          </div>

          {error && (
            <motion.div
              className="p-4 bg-[#c80e13]/10 text-[#c80e13] rounded-xl shadow-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {Object.entries(statusCounts).map(([status, count]) => (
              <div
                key={status}
                className="bg-white p-4 rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
              >
                <h3 className="text-sm font-medium text-gray-600">{status}</h3>
                <p className="text-2xl font-bold text-[#7d3cff]">{count}</p>
              </div>
            ))}
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative flex-1 max-w-lg">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user, vehicle, or service..."
                className="w-full pl-12 p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
              />
            </div>
            <motion.button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center bg-[#7d3cff] text-white px-6 py-3 rounded-xl hover:bg-[#7d3cff]/90 shadow-md transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter className="mr-2" /> {isFilterOpen ? "Hide Filters" : "Show Filters"}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                className="p-6 bg-white rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Appointments Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <motion.div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7d3cff]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </div>
          ) : currentAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-16 text-lg">
              No tasks match your criteria.
            </p>
          ) : (
            <motion.div
              className="bg-white rounded-xl shadow-md overflow-x-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="sticky top-0 bg-[#7d3cff]/10">
                    <tr className="text-[#7d3cff] text-left text-sm font-semibold">
                      <th className="p-4 min-w-[150px]">User</th>
                      <th className="p-4 min-w-[200px]">Service</th>
                      <th className="p-4 min-w-[120px]">Date</th>
                      <th className="p-4 min-w-[120px]">Status</th>
                      <th className="p-4 min-w-[300px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAppointments.map((appt) => (
                      <motion.tr
                        key={appt.id}
                        className="border-b hover:bg-gray-50 transition"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="p-4 truncate" title={appt.name}>
                          {appt.name}
                        </td>
                        <td className="p-4 truncate" title={appt.service}>
                          {appt.service}
                        </td>
                        <td className="p-4">{appt.date}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              appt.status === "Pending"
                                ? "bg-[#f2d53c]/20 text-[#f2d53c]"
                                : appt.status === "Accepted"
                                ? "bg-[#7d3cff]/20 text-[#7d3cff]"
                                : appt.status === "In Progress"
                                ? "bg-[#c80e13]/20 text-[#c80e13]"
                                : "bg-green-600/20 text-green-600"
                            }`}
                          >
                            {appt.status}
                          </span>
                          {appt.changeRequested && (
                            <span className="ml-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                              {appt.changeReason}
                            </span>
                          )}
                        </td>
                        <td className="p-4 flex gap-3 flex-wrap items-center">
                          <motion.div className="relative group">
                            <motion.button
                              onClick={() => setSelectedAppointment(appt)}
                              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
                              title="View Details"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FaEye />
                            </motion.button>
                            <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                              View Details
                            </span>
                          </motion.div>
                          {appt.status === "Pending" && !appt.changeRequested && (
                            <div className="flex gap-2 items-center">
                              <select
                                id={`reason-${appt.id}`}
                                defaultValue=""
                                className="p-2 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f2d53c] transition"
                              >
                                <option value="" disabled>
                                  Select Reason
                                </option>
                                {reasons.map((reason) => (
                                  <option key={reason} value={reason}>
                                    {reason}
                                  </option>
                                ))}
                              </select>
                              <motion.button
                                onClick={() =>
                                  handleRequestDateChange(
                                    appt.id,
                                    document.getElementById(`reason-${appt.id}`).value
                                  )
                                }
                                className="px-4 py-2 bg-[#f2d53c] text-white rounded-xl hover:bg-[#f2d53c]/80 transition text-sm shadow-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Request Change
                              </motion.button>
                            </div>
                          )}
                          {appt.status === "Pending" && (
                            <motion.div className="relative group">
                              <motion.button
                                onClick={() => handleAccept(appt.id)}
                                className="px-4 py-2 bg-[#7d3cff] text-white rounded-xl hover:bg-[#7d3cff]/80 transition text-sm shadow-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FaCheckCircle className="inline mr-1" /> Accept
                              </motion.button>
                              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                                Accept Task
                              </span>
                            </motion.div>
                          )}
                          {appt.status === "Accepted" && (
                            <motion.div className="relative group">
                              <motion.button
                                onClick={() => handleInProgress(appt.id)}
                                className="px-4 py-2 bg-[#c80e13] text-white rounded-xl hover:bg-[#c80e13]/80 transition text-sm shadow-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FaHourglassHalf className="inline mr-1" /> Start
                              </motion.button>
                              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                                Start Task
                              </span>
                            </motion.div>
                          )}
                          {appt.status === "In Progress" && (
                            <motion.div className="relative group">
                              <motion.button
                                onClick={() => handleComplete(appt.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-600/80 transition text-sm shadow-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FaCheck className="inline mr-1" /> Complete
                              </motion.button>
                              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                                Complete Task
                              </span>
                            </motion.div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              className="flex justify-between items-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-6 py-3 bg-[#7d3cff] text-white rounded-xl disabled:opacity-50 hover:bg-[#7d3cff]/80 transition shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaArrowLeft className="mr-2" /> Previous
              </motion.button>
              <span className="text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <motion.button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-6 py-3 bg-[#7d3cff] text-white rounded-xl disabled:opacity-50 hover:bg-[#7d3cff]/80 transition shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next <FaArrowRight className="ml-2" />
              </motion.button>
            </motion.div>
          )}

          {/* Analytics Section */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#7d3cff]">
                Task Analytics
              </h2>
              <motion.button
                onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                className="text-[#7d3cff] hover:text-[#7d3cff]/80 transition font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isAnalyticsOpen ? "Hide Analytics" : "Show Analytics"}
              </motion.button>
            </div>
            <AnimatePresence>
              {isAnalyticsOpen && (
                <motion.div
                  className="bg-white p-6 rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Bar data={chartData} options={chartOptions} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Export Button */}
          <motion.div
            className="mt-8 text-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={exportToCSV}
              className="flex items-center px-6 py-3 bg-[#f2d53c] text-white rounded-xl hover:bg-[#f2d53c]/80 transition shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaDownload className="mr-2" /> Export Tasks to CSV
            </motion.button>
          </motion.div>

          {/* Appointment Details Modal */}
          <AnimatePresence>
            {selectedAppointment && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedAppointment(null)}
              >
                <motion.div
                  className="bg-white p-8 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-md bg-opacity-95"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-[#7d3cff]">Task Details</h3>
                    <motion.button
                      onClick={() => setSelectedAppointment(null)}
                      className="text-gray-600 hover:text-gray-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaTimes className="text-xl" />
                    </motion.button>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      <strong className="text-[#7d3cff]">User:</strong> {selectedAppointment.name}
                    </p>
                    <p>
                      <strong className="text-[#7d3cff]">Service:</strong> {selectedAppointment.service}
                    </p>
                    <p>
                      <strong className="text-[#7d3cff]">Date:</strong> {selectedAppointment.date}
                    </p>
                    <p>
                      <strong className="text-[#7d3cff]">Status:</strong>{" "}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedAppointment.status === "Pending"
                            ? "bg-[#f2d53c]/20 text-[#f2d53c]"
                            : selectedAppointment.status === "Accepted"
                            ? "bg-[#7d3cff]/20 text-[#7d3cff]"
                            : selectedAppointment.status === "In Progress"
                            ? "bg-[#c80e13]/20 text-[#c80e13]"
                            : "bg-green-600/20 text-green-600"
                        }`}
                      >
                        {selectedAppointment.status}
                      </span>
                    </p>
                    <p>
                      <strong className="text-[#7d3cff]">Vehicle Number:</strong>{" "}
                      {selectedAppointment.vehicleNumber}
                    </p>
                    <p>
                      <strong className="text-[#7d3cff]">Phone:</strong>{" "}
                      {selectedAppointment.phone || "N/A"}
                    </p>
                    {selectedAppointment.changeRequested && (
                      <p>
                        <strong className="text-[#7d3cff]">Change Reason:</strong>{" "}
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                          {selectedAppointment.changeReason}
                        </span>
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Notifications */}
          <AnimatePresence>
            {toast && (
              <motion.div
                className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg text-white ${
                  toast.type === "success" ? "bg-green-600" : "bg-[#c80e13]"
                } max-w-sm cursor-pointer`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                onClick={() => setToast(null)}
              >
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Employee;