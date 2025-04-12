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
 // Assuming Poppins font is imported here

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
        backgroundColor: ["#f59e0b", "#3b82f6", "#f97316", "#10b981"],
        borderColor: ["#d97706", "#2563eb", "#ea580c", "#059669"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Appointment Status Distribution",
        font: { family: "Poppins", size: 18 },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Count" } },
      x: { title: { display: true, text: "Status" } },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 bg-teal-800 text-white w-64 p-6 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:w-64 transition-transform duration-300 z-50 shadow-lg`}
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">Employee Dashboard</h2>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <nav className="space-y-4">
          <button className="flex items-center w-full text-left p-2 rounded-lg bg-teal-700">
            <FaCalendarAlt className="mr-2" /> My Tasks
          </button>
          <button
            className="flex items-center w-full text-left p-2 rounded-lg hover:bg-teal-700"
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
          >
            <FaChartPie className="mr-2" /> Analytics
          </button>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <button
          className="md:hidden mb-4 p-2 bg-teal-600 text-white rounded-lg"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars />
        </button>

        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-teal-800">
              Employee Task Dashboard
            </h1>
            <span className="text-gray-600">{filteredAppointments.length} tasks</span>
          </div>

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

          {/* Search and Filters */}
          <motion.div
            className="mb-6 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user, vehicle, or service..."
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              <FaFilter className="mr-2" /> Filters
            </button>
          </motion.div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                className="mb-6 p-4 bg-white rounded-lg shadow-md"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Appointments Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          ) : currentAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No tasks match your criteria.</p>
          ) : (
            <motion.div
              className="bg-white rounded-lg shadow-md overflow-x-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <table className="w-full">
                <thead>
                  <tr className="bg-teal-100 text-teal-800 text-left text-sm">
                    <th className="p-4">User</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((appt) => (
                    <motion.tr
                      key={appt.id}
                      className="border-b hover:bg-gray-50 transition"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="p-4 truncate max-w-[150px]" title={appt.name}>
                        {appt.name}
                      </td>
                      <td className="p-4 truncate max-w-[200px]" title={appt.service}>
                        {appt.service}
                      </td>
                      <td className="p-4">{appt.date}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            appt.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : appt.status === "Accepted"
                              ? "bg-blue-100 text-blue-800"
                              : appt.status === "In Progress"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {appt.status}
                        </span>
                        {appt.changeRequested && (
                          <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                            {appt.changeReason}
                          </span>
                        )}
                      </td>
                      <td className="p-4 flex gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedAppointment(appt)}
                          className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {appt.status === "Pending" && !appt.changeRequested && (
                          <div className="flex gap-2 items-center">
                            <select
                              id={`reason-${appt.id}`}
                              defaultValue=""
                              className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                            <button
                              onClick={() =>
                                handleRequestDateChange(
                                  appt.id,
                                  document.getElementById(`reason-${appt.id}`).value
                                )
                              }
                              className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                            >
                              Request Change
                            </button>
                          </div>
                        )}
                        {appt.status === "Pending" && (
                          <button
                            onClick={() => handleAccept(appt.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            title="Accept Task"
                          >
                            <FaCheckCircle className="inline mr-1" /> Accept
                          </button>
                        )}
                        {appt.status === "Accepted" && (
                          <button
                            onClick={() => handleInProgress(appt.id)}
                            className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                            title="Start Task"
                          >
                            <FaHourglassHalf className="inline mr-1" /> Start
                          </button>
                        )}
                        {appt.status === "In Progress" && (
                          <button
                            onClick={() => handleComplete(appt.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                            title="Complete Task"
                          >
                            <FaCheck className="inline mr-1" /> Complete
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              className="flex justify-between items-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-50 hover:bg-teal-700 transition"
              >
                <FaArrowLeft className="mr-2" /> Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-50 hover:bg-teal-700 transition"
              >
                Next <FaArrowRight className="ml-2" />
              </button>
            </motion.div>
          )}

          {/* Analytics Section */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-teal-800">
                Task Analytics
              </h2>
              <button
                onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                className="text-teal-600 hover:text-teal-800 transition"
              >
                {isAnalyticsOpen ? "Hide" : "Show"}
              </button>
            </div>
            <AnimatePresence>
              {isAnalyticsOpen && (
                <motion.div
                  className="bg-white p-6 rounded-lg shadow-md"
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
            className="mt-6 text-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <FaDownload className="mr-2" /> Export Tasks to CSV
            </button>
          </motion.div>

          {/* Appointment Details Modal */}
          <AnimatePresence>
            {selectedAppointment && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAppointment(null)}
              >
                <motion.div
                  className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-teal-800">Task Details</h3>
                    <button
                      onClick={() => setSelectedAppointment(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p>
                      <strong>User:</strong> {selectedAppointment.name}
                    </p>
                    <p>
                      <strong>Service:</strong> {selectedAppointment.service}
                    </p>
                    <p>
                      <strong>Date:</strong> {selectedAppointment.date}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedAppointment.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedAppointment.status === "Accepted"
                            ? "bg-blue-100 text-blue-800"
                            : selectedAppointment.status === "In Progress"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedAppointment.status}
                      </span>
                    </p>
                    <p>
                      <strong>Vehicle Number:</strong> {selectedAppointment.vehicleNumber}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedAppointment.phone || "N/A"}
                    </p>
                    {selectedAppointment.changeRequested && (
                      <p>
                        <strong>Change Reason:</strong>{" "}
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
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
                className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${
                  toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
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