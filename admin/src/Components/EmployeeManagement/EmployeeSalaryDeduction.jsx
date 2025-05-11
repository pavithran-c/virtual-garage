import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaCheckCircle } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const EmployeeSalaryDeduction = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employee, setEmployee] = useState(null);
  const [deductions, setDeductions] = useState([]);
  const [netSalaryData, setNetSalaryData] = useState({
    baseSalary: 0,
    totalDeductions: 0,
    netSalary: 0,
  });
  const [form, setForm] = useState({
    amount: "",
    reason: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Helper to check if a date is in the current month
  const isCurrentMonth = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  };

  // Fetch all employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${API_URL}/employees`, {
          withCredentials: true,
        });
        setEmployees(response.data.employees);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load employees");
        setToast({ type: "error", message: "Failed to load employees" });
      }
    };
    fetchEmployees();
  }, []);

  // Fetch employee data when selectedEmployeeId changes
  useEffect(() => {
    if (!selectedEmployeeId) {
      setEmployee(null);
      setDeductions([]);
      setNetSalaryData({ baseSalary: 0, totalDeductions: 0, netSalary: 0 });
      return;
    }

    const fetchEmployeeData = async () => {
      setLoading(true);
      setError("");

      try {
        const [employeeResponse, deductionsResponse, netSalaryResponse] =
          await Promise.all([
            axios.get(`${API_URL}/employees/${selectedEmployeeId}`, {
              withCredentials: true,
            }),
            axios.get(`${API_URL}/employees/${selectedEmployeeId}/deductions`, {
              withCredentials: true,
            }),
            axios.get(`${API_URL}/employees/${selectedEmployeeId}/net-salary`, {
              withCredentials: true,
            }),
          ]);

        setEmployee(employeeResponse.data.employee);
        // Filter deductions for current month only
        const currentMonthDeductions = deductionsResponse.data.deductions.filter(
          (d) => isCurrentMonth(d.date)
        );
        setDeductions(currentMonthDeductions);
        setNetSalaryData(netSalaryResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch employee data");
        setToast({ type: "error", message: "Failed to fetch employee data" });
        setEmployee(null);
        setDeductions([]);
        setNetSalaryData({ baseSalary: 0, totalDeductions: 0, netSalary: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [selectedEmployeeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const handleDeduct = async (e) => {
    e.preventDefault();
    if (!employee) {
      setError("Please select an employee");
      setToast({ type: "error", message: "Please select an employee" });
      return;
    }

    // Client-side validation
    const newAmount = Number(form.amount);
    if (newAmount + netSalaryData.totalDeductions > netSalaryData.baseSalary) {
      setError("Total deductions cannot exceed employee salary");
      setToast({ type: "error", message: "Total deductions cannot exceed employee salary" });
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${API_URL}/employees/${employee._id}/deductions`,
        form,
        { withCredentials: true }
      );

      // Refresh data
      const [deductionsResponse, netSalaryResponse] = await Promise.all([
        axios.get(`${API_URL}/employees/${employee._id}/deductions`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/employees/${employee._id}/net-salary`, {
          withCredentials: true,
        }),
      ]);

      const currentMonthDeductions = deductionsResponse.data.deductions.filter(
        (d) => isCurrentMonth(d.date)
      );
      setDeductions(currentMonthDeductions);
      setNetSalaryData(netSalaryResponse.data);
      setForm({
        amount: "",
        reason: "",
        date: new Date().toISOString().split("T")[0],
      });
      setToast({ type: "success", message: "Deduction added successfully" });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to add deduction";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fceed1] font-poppins p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-5xl mx-auto space-y-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#7d3cff] tracking-tight">
            Employee Salary Deduction
          </h1>
          <span className="text-gray-600 font-medium">{employees.length} Employees</span>
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

        {/* Employee Selection */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label className="block text-gray-700 font-medium mb-2">Select Employee</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition disabled:bg-gray-100"
            disabled={loading}
          >
            <option value="">-- Select an Employee --</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-8">
            <motion.div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7d3cff]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            ></motion.div>
          </div>
        )}

        {employee && !loading && (
          <>
            {/* Employee Details */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-[#7d3cff] mb-4">Employee Details</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Name:</span> {employee.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {employee.email}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Role:</span>{" "}
                  {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Department:</span> {employee.department}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employee.status === "active"
                        ? "bg-[#7d3cff]/20 text-[#7d3cff]"
                        : "bg-[#c80e13]/20 text-[#c80e13]"
                    }`}
                  >
                    {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                  </span>
                </p>
              </div>
            </motion.div>

            {/* Salary Summary */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold text-[#7d3cff] mb-4">Salary Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#fceed1] rounded-xl shadow-sm">
                  <p className="text-gray-600 font-medium">Base Salary</p>
                  <p className="text-2xl font-bold text-[#7d3cff]">
                    ₹{netSalaryData.baseSalary.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-[#fceed1] rounded-xl shadow-sm">
                  <p className="text-gray-600 font-medium">Total Deductions</p>
                  <p className="text-2xl font-bold text-[#c80e13]">
                    ₹{netSalaryData.totalDeductions.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-[#fceed1] rounded-xl shadow-sm">
                  <p className="text-gray-600 font-medium">Net Salary</p>
                  <p className="text-2xl font-bold text-[#7d3cff]">
                    ₹{netSalaryData.netSalary.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Deduction Form */}
            <motion.div
              className="bg-white rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="sticky top-0 bg-[#7d3cff]/10 p-6 rounded-t-xl flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#7d3cff]">Add Deduction</h2>
                <motion.button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="text-[#7d3cff] hover:text-[#7d3cff]/80"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isFormOpen ? <FaTimes className="text-xl" /> : <FaPlus className="text-xl" />}
                </motion.button>
              </div>
              <AnimatePresence>
                {isFormOpen && (
                  <motion.form
                    onSubmit={handleDeduct}
                    className="p-6"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={form.amount}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition disabled:bg-gray-100"
                          required
                          min="0"
                          step="1"
                          max={netSalaryData.baseSalary - netSalaryData.totalDeductions}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Reason</label>
                        <input
                          type="text"
                          name="reason"
                          value={form.reason}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition disabled:bg-gray-100"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Date</label>
                        <input
                          type="date"
                          name="date" // Fixed: Corrected name from "reason" to "date"
                          value={form.date}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition disabled:bg-gray-100"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <motion.div className="relative group mt-6">
                      <motion.button
                        type="submit"
                        className="bg-[#7d3cff] text-white px-6 py-3 rounded-xl hover:bg-[#7d3cff]/80 flex items-center shadow-md transition disabled:bg-[#7d3cff]/50"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaPlus className="mr-2" /> {loading ? "Adding..." : "Add Deduction"}
                      </motion.button>
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                        Add Salary Deduction
                      </span>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Deduction List */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-xl font-semibold text-[#7d3cff] mb-4">Deductions</h2>
              {deductions.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No deductions recorded for this month.
                </p>
              ) : (
                <div className="space-y-4">
                  {deductions.map((deduction) => (
                    <motion.div
                      key={deduction._id}
                      className="flex justify-between items-center border-b border-gray-200 py-4 hover:bg-gray-50 transition"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <p className="font-medium text-[#c80e13]">
                          ₹{deduction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">{deduction.reason}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(deduction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}

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
  );
};

export default EmployeeSalaryDeduction;