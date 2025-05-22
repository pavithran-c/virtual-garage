import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEPARTMENT_SUGGESTIONS = ["IT", "HR", "Finance", "Marketing", "Operations", "Sales"];

const AdminEmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    email: "",
    role: "technician",
    department: "",
    phone: "",
    status: "active",
    salary: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [filterRole, setFilterRole] = useState("All");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [exportFields, setExportFields] = useState({
    employeeId: true,
    name: true,
    email: true,
    role: true,
    department: true,
    phone: true,
    status: true,
    salary: true,
    notes: true,
  });
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  useEffect(() => {
    fetchEmployees();
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        setIsFormOpen(true);
        setEditingId(null);
        setForm({
          employeeId: "",
          name: "",
          email: "",
          role: "technician",
          department: "",
          phone: "",
          status: "active",
          salary: "",
          notes: "",
        });
      }
      if (e.key === "Escape" && (isFormOpen || viewEmployee)) {
        setIsFormOpen(false);
        setViewEmployee(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen, viewEmployee]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/employees`, { withCredentials: true });
      setEmployees(response.data.employees);
      setError("");
      addToast({ type: "success", message: "Employees loaded successfully" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employees");
      addToast({ type: "error", message: "Failed to load employees" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "salary" ? Number(value) : value });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.employeeId.trim()) errors.employeeId = "Employee ID is required";
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(form.email)) errors.email = "Invalid email address";
    if (!form.role) errors.role = "Role is required";
    if (!form.department.trim()) errors.department = "Department is required";
    if (form.phone && !phoneRegex.test(form.phone)) errors.phone = "Invalid Indian phone number";
    if (!form.status) errors.status = "Status is required";
    if (!form.salary && form.salary !== 0) errors.salary = "Salary is required";
    else if (isNaN(form.salary)) errors.salary = "Salary must be a number";
    else if (form.salary < 10000 || form.salary > 50000)
      errors.salary = "Salary must be between ₹10,000 and ₹50,000";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      addToast({ type: "error", message: "Please fix the form errors" });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/employees/${editingId}`, form, {
          withCredentials: true,
        });
        addToast({ type: "success", message: "Employee updated successfully" });
      } else {
        await axios.post(`${API_URL}/employees`, form, { withCredentials: true });
        addToast({ type: "success", message: "Employee added successfully" });
      }
      setForm({
        employeeId: "",
        name: "",
        email: "",
        role: "technician",
        department: "",
        phone: "",
        status: "active",
        salary: "",
        notes: "",
      });
      setEditingId(null);
      setFormErrors({});
      setIsFormOpen(false);
      fetchEmployees();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save employee";
      setError(message);
      addToast({ type: "error", message });
    }
  };

  const handleEdit = (employee) => {
    setForm({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      phone: employee.phone || "",
      status: employee.status,
      salary: employee.salary,
      notes: employee.notes || "",
    });
    setEditingId(employee._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`${API_URL}/employees/${id}`, { withCredentials: true });
        addToast({ type: "success", message: "Employee deleted successfully" });
        fetchEmployees();
      } catch (err) {
        const message = err.response?.data?.message || "Failed to delete employee";
        setError(message);
        addToast({ type: "error", message });
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedEmployees.length === 0) {
      addToast({ type: "error", message: "Please select at least one employee" });
      return;
    }

    try {
      if (action === "delete") {
        await Promise.all(
          selectedEmployees.map((id) =>
            axios.delete(`${API_URL}/employees/${id}`, { withCredentials: true })
          )
        );
        addToast({ type: "success", message: "Selected employees deleted successfully" });
      } else {
        await Promise.all(
          selectedEmployees.map((id) =>
            axios.put(
              `${API_URL}/employees/${id}`,
              { status: action },
              { withCredentials: true }
            )
          )
        );
        addToast({ type: "success", message: `Selected employees set to ${action}` });
      }
      setSelectedEmployees([]);
      fetchEmployees();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to perform bulk action";
      addToast({ type: "error", message });
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await axios.put(
        `${API_URL}/employees/${id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      addToast({ type: "success", message: `Employee status set to ${newStatus}` });
      fetchEmployees();
    } catch (err) {
      addToast({ type: "error", message: "Failed to update status" });
    }
  };

  const exportToCSV = () => {
    try {
      const headers = Object.keys(exportFields).filter((key) => exportFields[key]);
      const rows = filteredEmployees.map((emp) =>
        headers.map((key) => emp[key] || "N/A")
      );
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `employees-${new Date().toISOString().split("T")[0]}.csv`);
      addToast({ type: "success", message: "Employees exported to CSV" });
    } catch (error) {
      addToast({ type: "error", message: "Failed to export employees" });
    }
  };

  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredEmployees = useMemo(() => {
    let result = employees.filter((emp) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        searchType === "name"
          ? emp.name.toLowerCase().includes(query)
          : searchType === "email"
          ? emp.email.toLowerCase().includes(query)
          : emp.employeeId.toLowerCase().includes(query);
      const matchesRole = filterRole === "All" || emp.role === filterRole;
      const matchesDepartment = filterDepartment
        ? emp.department.toLowerCase().includes(filterDepartment.toLowerCase())
        : true;
      const matchesStatus = filterStatus === "All" || emp.status === filterStatus;
      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (sortConfig.key === "salary") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return result;
  }, [employees, searchQuery, searchType, filterRole, filterDepartment, filterStatus, sortConfig]);

  const roleCounts = useMemo(() => {
    const counts = {};
    employees.forEach((emp) => {
      counts[emp.role] = (counts[emp.role] || 0) + 1;
    });
    return counts;
  }, [employees]);

  const departmentCounts = useMemo(() => {
    const counts = {};
    employees.forEach((emp) => {
      counts[emp.department] = (counts[emp.department] || 0) + 1;
    });
    return counts;
  }, [employees]);

  const chartData = {
    labels: [...new Set([...Object.keys(roleCounts), ...Object.keys(departmentCounts)])],
    datasets: [
      {
        label: "By Role",
        data: Object.keys(roleCounts).map((key) => roleCounts[key] || 0),
        backgroundColor: "rgba(125, 60, 255, 0.8)",
        borderColor: "#6b21a8",
        borderWidth: 1,
      },
      {
        label: "By Department",
        data: Object.keys(departmentCounts).map((key) => departmentCounts[key] || 0),
        backgroundColor: "rgba(242, 213, 60, 0.8)",
        borderColor: "#d4b932",
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
        text: "Employee Distribution",
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
        title: { display: true, text: "Category", font: { family: "Poppins", size: 14 } },
        grid: { display: false },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutCubic",
    },
  };

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fceed1] to-[#fce5b7] font-poppins py-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="bg-white rounded-3xl p-8 shadow-xl animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-xl">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fceed1] to-[#fce5b7] font-poppins py-12 px-4 sm:px-8 lg:px-12">
      <motion.div
        className="max-w-7xl mx-auto space-y-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7d3cff] to-[#f2d53c] tracking-tight">
            Employee Management
          </h1>
          <span className="text-gray-600 font-medium mt-4 sm:mt-0">
            {filteredEmployees.length} Employees
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

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, staggerChildren: 0.1 }}
        >
          <motion.div
            className="bg-white p-6 rounded-3xl shadow-xl backdrop-blur-md bg-opacity-90 hover:shadow-2xl transition-shadow relative overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(125, 60, 255, 0.2)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Employees</h3>
            <p className="text-3xl font-bold text-[#7d3cff] mt-3">{employees.length}</p>
          </motion.div>
          {Object.entries({
            Active: employees.filter((emp) => emp.status === "active").length,
            Inactive: employees.filter((emp) => emp.status === "inactive").length,
          }).map(([status, count]) => (
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

        <motion.div
          className="flex flex-col sm:flex-row gap-6 items-center bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
          <div className="relative flex-1 max-w-lg flex items-center gap-4">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="employeeId">Employee ID</option>
            </select>
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by ${searchType}...`}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
              />
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                >
                  <option value="All">All Roles</option>
                  <option value="manager">Manager</option>
                  <option value="technician">Technician</option>
                  <option value="support">Support</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  placeholder="Filter by department..."
                  className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex gap-4 flex-wrap">
            <motion.button
              onClick={() => handleBulkAction("active")}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition shadow-md disabled:opacity-50"
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              disabled={selectedEmployees.length === 0}
            >
              <FaCheckCircle className="mr-2" /> Activate Selected
            </motion.button>
            <motion.button
              onClick={() => handleBulkAction("inactive")}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-[#c80e13] to-[#a30b0f] text-white rounded-xl hover:from-[#a30b0f] hover:to-[#c80e13] transition shadow-md disabled:opacity-50"
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(200, 14, 19, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              disabled={selectedEmployees.length === 0}
            >
              <FaTimes className="mr-2" /> Deactivate Selected
            </motion.button>
            <motion.button
              onClick={() => handleBulkAction("delete")}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-[#c80e13] to-[#a30b0f] text-white rounded-xl hover:from-[#a30b0f] hover:to-[#c80e13] transition shadow-md disabled:opacity-50"
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(200, 14, 19, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              disabled={selectedEmployees.length === 0}
            >
              <FaTrash className="mr-2" /> Delete Selected
            </motion.button>
          </div>
          <div className="flex gap-4">
            <motion.button
              onClick={() => {
                setIsFormOpen(true);
                setEditingId(null);
                setForm({
                  employeeId: "",
                  name: "",
                  email: "",
                  role: "technician",
                  department: "",
                  phone: "",
                  status: "active",
                  salary: "",
                  notes: "",
                });
              }}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-[#7d3cff] to-[#6b21a8] text-white rounded-xl hover:from-[#6b21a8] hover:to-[#7d3cff] transition shadow-md"
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(125, 60, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUserPlus className="mr-2" /> Add New Employee
            </motion.button>
            <motion.div className="relative group">
              <motion.button
                onClick={exportToCSV}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#f2d53c] to-[#d4b932] text-white rounded-xl hover:from-[#d4b932] hover:to-[#f2d53c] transition shadow-md"
                whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(242, 213, 60, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <FaDownload className="mr-2" /> Export to CSV
              </motion.button>
              <div className="absolute hidden group-hover:block bg-white rounded-xl shadow-xl p-4 mt-2 right-0 w-64 z-10 border border-gray-100">
                <h3 className="text-sm font-semibold text-[#7d3cff] mb-2">Select Fields to Export</h3>
                {Object.keys(exportFields).map((field) => (
                  <label key={field} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={exportFields[field]}
                      onChange={() =>
                        setExportFields((prev) => ({ ...prev, [field]: !prev[field] }))
                      }
                    />
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
          <div className="p-8 overflow-x-auto">
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#7d3cff] to-[#f2d53c] mb-6">
              Employees
            </h2>
            {currentEmployees.length === 0 ? (
              <p className="text-gray-600 text-center py-10 text-lg italic">
                No employees found.
              </p>
            ) : (
              <table className="w-full table-auto">
                <thead className="bg-gradient-to-r from-[#7d3cff]/10 to-[#f2d53c]/10 sticky top-0 z-10">
                  <tr className="text-[#7d3cff] text-left text-sm font-semibold uppercase tracking-wide">
                    <th className="p-3">
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          setSelectedEmployees(
                            e.target.checked
                              ? currentEmployees.map((emp) => emp._id)
                              : []
                          )
                        }
                        checked={
                          selectedEmployees.length === currentEmployees.length &&
                          currentEmployees.length > 0
                        }
                      />
                    </th>
                    <th className="p-3"></th>
                    <th className="p-3 cursor-pointer" onClick={() => handleSort("name")}>
                      Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="p-3 cursor-pointer" onClick={() => handleSort("email")}>
                      Email {sortConfig.key === "email" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 cursor-pointer" onClick={() => handleSort("salary")}>
                      Salary {sortConfig.key === "salary" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.map((employee, index) => (
                    <motion.tr
                      key={employee._id}
                      className={`border-b border-gray-100 transition duration-300 ${
                        index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                      } hover:bg-gradient-to-r hover:from-[#7d3cff]/5 hover:to-[#f2d53c]/5`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee._id)}
                          onChange={() =>
                            setSelectedEmployees((prev) =>
                              prev.includes(employee._id)
                                ? prev.filter((id) => id !== employee._id)
                                : [...prev, employee._id]
                            )
                          }
                        />
                      </td>
                      <td className="p-3">
                        <div className="w-10 h-10 rounded-full bg-[#7d3cff]/20 flex items-center justify-center text-[#7d3cff] font-medium">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setViewEmployee(employee)}
                          className="font-medium text-[#7d3cff] hover:text-[#6b21a8] transition"
                        >
                          {employee.name}
                        </button>
                      </td>
                      <td className="p-3 text-gray-600">{employee.email}</td>
                      <td className="p-3 text-gray-600">
                        {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                      </td>
                      <td className="p-3 text-gray-600">{employee.department}</td>
                      <td className="p-3 text-gray-600">₹{employee.salary.toLocaleString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleStatusToggle(employee._id, employee.status)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            employee.status === "active" ? "bg-[#7d3cff]" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute h-4 w-4 bg-white rounded-full transition-transform ${
                              employee.status === "active" ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-3 flex space-x-4">
                        <motion.div className="relative group">
                          <motion.button
                            onClick={() => handleEdit(employee)}
                            className="text-[#7d3cff] hover:text-[#6b21a8]"
                            whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(125, 60, 255, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaEdit className="text-lg" />
                          </motion.button>
                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-3 -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap shadow-lg">
                            Edit Employee
                          </span>
                        </motion.div>
                        <motion.div className="relative group">
                          <motion.button
                            onClick={() => handleDelete(employee._id)}
                            className="text-[#c80e13] hover:text-[#a30b0f]"
                            whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(200, 14, 19, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaTrash className="text-lg" />
                          </motion.button>
                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-3 -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap shadow-lg">
                            Delete Employee
                          </span>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-gray-600">
                  Showing {indexOfFirstEmployee + 1} to{" "}
                  {Math.min(indexOfLastEmployee, filteredEmployees.length)} of{" "}
                  {filteredEmployees.length} employees
                </p>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gradient-to-r from-[#7d3cff] to-[#6b21a8] text-white rounded-xl disabled:opacity-50"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(125, 60, 255, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaChevronLeft />
                  </motion.button>
                  {[...Array(totalPages)].map((_, i) => (
                    <motion.button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`px-4 py-2 rounded-xl ${
                        currentPage === i + 1
                          ? "bg-[#7d3cff] text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(125, 60, 255, 0.2)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {i + 1}
                    </motion.button>
                  ))}
                  <motion.button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gradient-to-r from-[#7d3cff] to-[#6b21a8] text-white rounded-xl disabled:opacity-50"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(125, 60, 255, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaChevronRight />
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]">
              Employee Analytics
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

        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-30 backdrop-blur-md p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={() => setIsFormOpen(false)}
            >
              <motion.div
                className="bg-white bg-opacity-95 p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-lg border border-gray-100/50 relative"
                initial={{ scale: 0.85, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]">
                    {editingId ? "Edit Employee" : "Add New Employee"}
                  </h2>
                  <motion.button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-600 hover:text-gray-800"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTimes className="text-xl" />
                  </motion.button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Employee ID</label>
                      <input
                        type="text"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition disabled:bg-gray-100"
                        required
                        pattern="^[A-Za-z0-9_-]+$"
                        title="Employee ID must be alphanumeric"
                        disabled={!!editingId}
                      />
                      {formErrors.employeeId && (
                        <div className="text-[#c80e13] text-sm mt-1">{formErrors.employeeId}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                        required
                      />
                      {formErrors.name && (
                        <div className="text-[#c80e13] text-sm mt-1">{formErrors.name}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                        required
                      />
                      {formErrors.email && (
                        <div className="text-[#c80e13] text-sm mt-1">{formErrors.email}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Role</label>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                      >
                        <option value="manager">Manager</option>
                        <option value="technician">Technician</option>
                        <option value="support">Support</option>
                        <option value="other">Other</option>
                      </select>
                      {formErrors.role && (
                        <div className="text-[#c80e13] text-sm mt-1">{formErrors.role}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={form.department}
                        onChange={handleInputChange}
                        list="department-suggestions"
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                        required
                      />
                      <datalist id="department-suggestions">
                        {DEPARTMENT_SUGGESTIONS.map((dept) => (
                          <option key={dept} value={dept} />
                        ))}
                      </datalist>
                      {formErrors.department && (
                        <div className="text-[#c80e13] text-sm mt-1">{formErrors.department}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                        maxLength={10}
                        pattern="[6-9]{1}[0-9]{9}"
                        title="Enter a valid 10-digit Indian phone number"
                      />
                      {formErrors.phone && (
                        <div className="text-[#c80e13] text-sm mt-1">{formErrors.phone}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Status</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      {formErrors.status && (
                        <div className="text-[#c80e13] text-sm mt-1">{formErrors.status}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Salary (Monthly)</label>
                      <input
                        type="number"
                        name="salary"
                        value={form.salary}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                        required
                        min="10000"
                        max="50000"
                        step="1"
                      />
                      {formErrors.salary && (
                        <div className="text-[#c80e13] text-sm mt-1">{formErrors.salary}</div>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-gray-700 font-medium mb-1">Notes</label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] focus:ring-opacity-50 transition"
                        rows={4}
                        placeholder="Add any additional notes about the employee..."
                      />
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    className="mt-6 bg-gradient-to-r from-[#7d3cff] to-[#6b21a8] text-white px-6 py-3 rounded-xl hover:from-[#6b21a8] hover:to-[#7d3cff] flex items-center shadow-md transition"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(125, 60, 255, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaUserPlus className="mr-2" /> {editingId ? "Update Employee" : "Add Employee"}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {viewEmployee && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-30 backdrop-blur-md p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={() => setViewEmployee(null)}
            >
              <motion.div
                className="bg-white bg-opacity-95 p-8 rounded-3xl max-w-lg w-full shadow-2xl backdrop-blur-lg border border-gray-100/50 relative"
                initial={{ scale: 0.85, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]">
                    Employee Details
                  </h2>
                  <motion.button
                    onClick={() => setViewEmployee(null)}
                    className="text-gray-600 hover:text-gray-800"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTimes className="text-xl" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#7d3cff]/20 flex items-center justify-center text-[#7d3cff] font-medium text-xl">
                      {viewEmployee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{viewEmployee.name}</p>
                      <p className="text-sm text-gray-600">{viewEmployee.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Employee ID</p>
                    <p className="text-gray-600">{viewEmployee.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Role</p>
                    <p className="text-gray-600">
                      {viewEmployee.role.charAt(0).toUpperCase() + viewEmployee.role.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Department</p>
                    <p className="text-gray-600">{viewEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-gray-600">{viewEmployee.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Salary</p>
                    <p className="text-gray-600">₹{viewEmployee.salary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p
                      className={`inline-block px-4 py-1 rounded-full text-xs font-medium ${
                        viewEmployee.status === "active"
                          ? "bg-[#7d3cff]/20 text-[#7d3cff]"
                          : "bg-[#c80e13]/20 text-[#c80e13]"
                      }`}
                    >
                      {viewEmployee.status.charAt(0).toUpperCase() + viewEmployee.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Notes</p>
                    <p className="text-gray-600">{viewEmployee.notes || "No notes available"}</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => {
                    setViewEmployee(null);
                    handleEdit(viewEmployee);
                  }}
                  className="mt-6 bg-gradient-to-r from-[#7d3cff] to-[#6b21a8] text-white px-6 py-3 rounded-xl hover:from-[#6b21a8] hover:to-[#7d3cff] flex items-center shadow-md transition"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(125, 60, 255, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaEdit className="mr-2" /> Edit Employee
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`fixed bottom-8 right-8 p-5 rounded-2xl shadow-xl text-white flex items-center gap-4 ${
                toast.type === "success"
                  ? "bg-gradient-to-r from-green-600 to-green-700"
                  : "bg-gradient-to-r from-[#c80e13] to-[#a30b0f]"
              } max-w-sm cursor-pointer relative overflow-hidden`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7d3cff] to-[#f2d53c]"></div>
              <span>{toast.message}</span>
              <motion.button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-white hover:text-gray-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimes />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminEmployeeManagement;