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

  const handleComplete = async (id, amount) => {
    try {
      const response = await fetch(`${EMPLOYEE_API_URL}/complete/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("admin:admin123"),
        },
        body: JSON.stringify({ amount }),
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

  const categorizedAppointments = useMemo(() => {
    return {
      pending: filteredAppointments.filter(appt => appt.status === "Pending" || appt.changeRequested),
      inProgress: filteredAppointments.filter(appt => appt.status === "In Progress"),
      completed: filteredAppointments.filter(appt => appt.status === "Completed"),
    };
  }, [filteredAppointments]);

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
        backgroundColor: [
          "rgba(242, 213, 60, 0.8)",
          "rgba(125, 60, 255, 0.8)",
          "rgba(200, 14, 19, 0.8)",
          "rgba(16, 185, 129, 0.8)",
        ],
        borderColor: ["#d4b932", "#6b21a8", "#a30b0f", "#0d9488"],
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
        font: { family: "Poppins", size: 20, weight: "600" },
        color: "#1f2937",
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(31, 41, 55, 0.9)",
        titleFont: { family: "Poppins", size: 14 },
        bodyFont: { family: "Poppins", size: 12 },
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count", font: { family: "Poppins", size: 14 } },
        grid: { color: "rgba(229, 231, 235, 0.3)" },
      },
      x: {
        title: { display: true, text: "Status", font: { family: "Poppins", size: 14 } },
        grid: { display: false },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutCubic",
    },
  };

  const renderTable = (appointments, title, emptyMessage) => (
    <motion.div
      className="bg-white rounded-3xl shadow-xl p-8 mb8 relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
      <h3 className="text-2xl font-semibold text-[#7d3cff] mb-6">{title}</h3>
      {appointments.length === 0 ? (
        <p className="text-gray-500 text-center py-10 text-lg italic">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gradient-to-r from-[#7d3cff]/10 to-[#f2d53c]/10">
              <tr className="text-[#7d3cff] text-left text-sm font-semibold uppercase tracking-wide">
                <th className="p-4 min-w-[150px]">User</th>
                <th className="p-4 min-w-[200px]">Service</th>
                <th className="p-4 min-w-[120px]">Date</th>
                <th className="p-4 min-w-[120px]">Status</th>
                <th className="p-4 min-w-[300px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <motion.tr
                  key={appt.id}
                  className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-[#7d3cff]/5 hover:to-[#f2d53c]/5 transition duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <td className="p-4 truncate text-gray-700 font-medium" title={appt.name}>
                    {appt.name}
                  </td>
                  <td className="p-4 truncate text-gray-700" title={appt.service}>
                    {appt.service}
                  </td>
                  <td className="p-4 text-gray-700">{appt.date}</td>
                  <td className="p-4">
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-medium shadow-sm ${
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
                      <span className="ml-2 bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-xs font-medium shadow-sm">
                        {appt.changeReason}
                      </span>
                    )}
                  </td>
                  <td className="p-4 flex gap-3 flex-wrap items-center">
                    <motion.div className="relative group">
                      <motion.button
                        onClick={() => setSelectedAppointment(appt)}
                        className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full hover:from-gray-200 hover:to-gray-300 transition shadow-md"
                        title="View Details"
                        whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(125, 60, 255, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaEye />
                      </motion.button>
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-3 -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap shadow-lg">
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
                          className="px-4 py-2 bg-gradient-to-r from-[#f2d53c] to-[#d4b932] text-white rounded-xl hover:from-[#d4b932] hover:to-[#f2d53c] transition text-sm shadow-md"
                          whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(242, 213, 60, 0.4)" }}
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
                          className="px-4 py-2 bg-gradient-to-r from-[#7d3cff] to-[#6b21a8] text-white rounded-xl hover:from-[#6b21a8] hover:to-[#7d3cff] transition text-sm shadow-md"
                          whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(125, 60, 255, 0.4)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaCheckCircle className="inline mr-1" /> Accept
                        </motion.button>
                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-3 -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap shadow-lg">
                          Accept Task
                        </span>
                      </motion.div>
                    )}
                    {appt.status === "Accepted" && (
                      <motion.div className="relative group">
                        <motion.button
                          onClick={() => handleInProgress(appt.id)}
                          className="px-4 py-2 bg-gradient-to-r from-[#c80e13] to-[#a30b0f] text-white rounded-xl hover:from-[#a30b0f] hover:to-[#c80e13] transition text-sm shadow-md"
                          whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(200, 14, 19, 0.4)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaHourglassHalf className="inline mr-1" /> Start
                        </motion.button>
                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-3 -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap shadow-lg">
                          Start Task
                        </span>
                      </motion.div>
                    )}
                    {appt.status === "In Progress" && (
                      <motion.div className="relative group flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Enter Amount"
                          className="px-3 py-2 border border-gray-200 rounded-xl text-sm w-32 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                          value={appt.enteredAmount || ""}
                          onChange={e => {
                            const value = e.target.value;
                            setAppointments(appointments =>
                              appointments.map(a =>
                                a.id === appt.id ? { ...a, enteredAmount: value } : a
                              )
                            );
                          }}
                        />
                        <motion.button
                          onClick={() => handleComplete(appt.id, appt.enteredAmount)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition text-sm shadow-md"
                          whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)" }}
                          whileTap={{ scale: 0.95 }}
                          disabled={!appt.enteredAmount}
                        >
                          <FaCheck className="inline mr-1" /> Complete
                        </motion.button>
                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-3 -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap shadow-lg">
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
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] font-poppins flex">
      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#7d3cff] to-[#6b21a8] text-white p-6 shadow-2xl transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:flex md:flex-col md:min-h-screen transition-transform duration-300 backdrop-blur-md bg-opacity-95`}
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold tracking-tight">Employee Dashboard</h2>
          <motion.button
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaTimes className="text-xl" />
          </motion.button>
        </div>
        <nav className="flex-1 space-y-4">
          <motion.button
            className="flex items-center w-full p-3 text-left rounded-xl bg-[#f2d53c]/20 hover:bg-[#f2d53c]/30 transition"
            whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(242, 213, 60, 0.3)" }}
          >
            <FaCalendarAlt className="mr-3 text-[#f2d53c]" /> My Tasks
          </motion.button>
          <motion.button
            className="flex items-center w-full p-3 text-left rounded-xl hover:bg-[#f2d53c]/20 transition"
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(242, 213, 60, 0.3)" }}
          >
            <FaChartPie className="mr-3 text-[#f2d53c]" /> Analytics
          </motion.button>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12">
        <motion.button
          className="md:hidden mb-6 p-3 bg-gradient-to-r from-[#7d3cff] to-[#6b21a8] text-white rounded-full shadow-lg hover:from-[#6b21a8] hover:to-[#7d3cff] transition"
          onClick={() => setIsSidebarOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaBars className="text-xl" />
        </motion.button>

        <motion.div
          className="max-w-7xl mx-auto space-y-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7d3cff] to-[#f2d53c] tracking-tight">
              Employee Task Dashboard
            </h1>
            <span className="text-gray-600 font-medium mt-4 sm:mt-0">
              {filteredAppointments.length} Total Tasks
            </span>
          </div>

          {error && (
            <motion.div
              className="p-6 bg-[#c80e13]/10 text-[#c80e13] rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, staggerChildren: 0.1 }}
          >
            {Object.entries(statusCounts).map(([status, count]) => (
              <motion.div
                key={status}
                className="bg-white p-6 rounded-3xl shadow-xl backdrop-blur-md bg-opacity-90 hover:shadow-2xl transition-shadow relative overflow-hidden"
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(125, 60, 255, 0.2)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{status}</h3>
                <p className="text-3xl font-bold text-[#7d3cff] mt-3">{count}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 items-center bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
            <div className="relative flex-1 max-w-lg">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user, vehicle, or service..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
              />
            </div>
            <motion.button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center bg-gradient-to-r from-[#7d3cff] to-[#6b21a8] text-white px-6 py-3 rounded-xl hover:from-[#6b21a8] hover:to-[#7d3cff] shadow-md transition"
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(125, 60, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter className="mr-2" /> {isFilterOpen ? "Hide Filters" : "Show Filters"}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                className="p-8 bg-white rounded-3xl shadow-xl backdrop-blur-md bg-opacity-90 relative overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
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
                    className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Appointment Tables */}
          {loading ? (
            <motion.div
              className="flex items-center justify-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7d3cff]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </motion.div>
          ) : (
            <>
              {renderTable(
                categorizedAppointments.pending,
                "Pending & Change Requested Tasks",
                "No pending or change requested tasks."
              )}
              {renderTable(
                categorizedAppointments.inProgress,
                "In Progress Tasks",
                "No tasks in progress."
              )}
              {renderTable(
                categorizedAppointments.completed,
                "Completed Tasks",
                "No completed tasks."
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              className="flex justify-between items-center mt-10 bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
              <motion.button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#7d3cff] to-[#6b21a8] text-white rounded-xl disabled:opacity-50 hover:from-[#6b21a8] hover:to-[#7d3cff] transition shadow-md"
                whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(125, 60, 255, 0.4)" }}
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
                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#7d3cff] to-[#6b21a8] text-white rounded-xl disabled:opacity-50 hover:from-[#6b21a8] hover:to-[#7d3cff] transition shadow-md"
                whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(125, 60, 255, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                Next <FaArrowRight className="ml-2" />
              </motion.button>
            </motion.div>
          )}

          {/* Analytics Section */}
          <motion.div
            className="mt-12 bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]">
                Task Analytics
              </h2>
              <motion.button
                onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                className="text-[#7d3cff] hover:text-[#6b21a8] transition font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isAnalyticsOpen ? "Hide Analytics" : "Show Analytics"}
              </motion.button>
            </div>
            <AnimatePresence>
              {isAnalyticsOpen && (
                <motion.div
                  className="bg-white rounded-2xl shadow-md p-6"
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
            className="mt-10 text-right"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.button
              onClick={exportToCSV}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-[#f2d53c] to-[#d4b932] text-white rounded-xl hover:from-[#d4b932] hover:to-[#f2d53c] transition shadow-md"
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(242, 213, 60, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <FaDownload className="mr-2" /> Export Tasks to CSV
            </motion.button>
          </motion.div>

          {/* Appointment Details Modal */}
          <AnimatePresence>
            {selectedAppointment && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-30 backdrop-blur-md p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onClick={() => setSelectedAppointment(null)}
              >
                <motion.div
                  className="bg-white bg-opacity-95 p-8 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-lg border border-gray-100/50 relative"
                  initial={{ scale: 0.85, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.85, opacity: 0, y: 50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]">
                      Task Details
                    </h3>
                    <motion.button
                      onClick={() => setSelectedAppointment(null)}
                      className="text-gray-600 hover:text-gray-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaTimes className="text-xl" />
                    </motion.button>
                  </div>
                  <div className="space-y-5 text-gray-700">
                    <p className="flex items-center">
                      <span className="w-32 font-semibold text-[#7d3cff]">User:</span>
                      <span>{selectedAppointment.name}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="w-32 font-semibold text-[#7d3cff]">Service:</span>
                      <span>{selectedAppointment.service}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="w-32 font-semibold text-[#7d3cff]">Date:</span>
                      <span>{selectedAppointment.date}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="w-32 font-semibold text-[#7d3cff]">Status:</span>
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-medium shadow-sm ${
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
                    <p className="flex items-center">
                      <span className="w-32 font-semibold text-[#7d3cff]">Vehicle Number:</span>
                      <span>{selectedAppointment.vehicleNumber}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="w-32 font-semibold text-[#7d3cff]">Phone:</span>
                      <span>{selectedAppointment.phone || "N/A"}</span>
                    </p>
                    {selectedAppointment.changeRequested && (
                      <p className="flex items-center">
                        <span className="w-32 font-semibold text-[#7d3cff]">Change Reason:</span>
                        <span className="bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-xs

 font-medium shadow-sm">
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
                className={`fixed bottom-8 right-8 p-5 rounded-2xl shadow-xl text-white ${
                  toast.type === "success"
                    ? "bg-gradient-to-r from-green-600 to-green-700"
                    : "bg-gradient-to-r from-[#c80e13] to-[#a30b0f]"
                } max-w-sm cursor-pointer relative overflow-hidden`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onClick={() => setToast(null)}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
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