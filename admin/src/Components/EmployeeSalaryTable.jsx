import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const API_URL = "http://localhost:5001/api";

const getMonthStart = (year, month) => new Date(year, month, 1);
const getMonthEnd = (year, month) => new Date(year, month + 1, 0, 23, 59, 59, 999);

const EmployeeSalaryTable = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .get(
        `${API_URL}/employees/salary-summaries?year=${year}&month=${month + 1}`,
        { withCredentials: true }
      )
      .then((res) => {
        setSummaries(res.data.summaries);
        setToast(null);
      })
      .catch((err) => {
        const message = err.response?.data?.message || "Failed to fetch salary summaries";
        setError(message);
        setToast({ type: "error", message });
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  const handleMonthChange = (e) => setMonth(Number(e.target.value));
  const handleYearChange = (e) => setYear(Number(e.target.value));

  // Generate last 5 years for dropdown
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate aggregate stats
  const stats = useMemo(() => {
    const totalBaseSalary = summaries.reduce((sum, emp) => sum + (emp.baseSalary || 0), 0);
    const totalDeductions = summaries.reduce((sum, emp) => sum + (emp.totalDeductions || 0), 0);
    const totalNetSalary = summaries.reduce((sum, emp) => sum + (emp.netSalary || 0), 0);
    return {
      totalEmployees: summaries.length,
      totalBaseSalary,
      totalDeductions,
      totalNetSalary,
    };
  }, [summaries]);

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
            Employee Salary Summaries
          </h1>
          <span className="text-gray-600 font-medium">{summaries.length} Employees</span>
        </div>

        {/* Stats Card */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white p-4 rounded-xl shadow-md backdrop-blur-md bg-opacity-80">
            <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
            <p className="text-2xl font-bold text-[#7d3cff]">{stats.totalEmployees}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md backdrop-blur-md bg-opacity-80">
            <h3 className="text-sm font-medium text-gray-600">Total Base Salary</h3>
            <p className="text-2xl font-bold text-[#7d3cff]">
              ₹{stats.totalBaseSalary.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md backdrop-blur-md bg-opacity-80">
            <h3 className="text-sm font-medium text-gray-600">Total Deductions</h3>
            <p className="text-2xl font-bold text-[#c80e13]">
              ₹{stats.totalDeductions.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md backdrop-blur-md bg-opacity-80">
            <h3 className="text-sm font-medium text-gray-600">Total Net Salary</h3>
            <p className="text-2xl font-bold text-[#7d3cff]">
              ₹{stats.totalNetSalary.toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Filters and Table */}
        <motion.div
          className="bg-white rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-[#7d3cff]">
              Salary Summary for {months[month]} {year}
            </h2>
            <div className="flex gap-4">
              <motion.div className="relative group">
                <select
                  value={month}
                  onChange={handleMonthChange}
                  className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                  Select Month
                </span>
              </motion.div>
              <motion.div className="relative group">
                <select
                  value={year}
                  onChange={handleYearChange}
                  className="p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                  Select Year
                </span>
              </motion.div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <motion.div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7d3cff]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </div>
          ) : summaries.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No salary summaries available for {months[month]} {year}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="sticky top-0 bg-[#7d3cff]/10">
                  <tr className="text-[#7d3cff] text-left text-sm font-semibold">
                    <th className="p-4 min-w-[150px]">Name</th>
                    <th className="p-4 min-w-[120px]">Base Salary</th>
                    <th className="p-4 min-w-[120px]">Total Deductions</th>
                    <th className="p-4 min-w-[120px]">Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((emp) => (
                    <motion.tr
                      key={emp._id}
                      className="border-b hover:bg-gray-50 transition"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="p-4 truncate" title={emp.name}>{emp.name}</td>
                      <td className="p-4">₹{emp.baseSalary?.toLocaleString() || 0}</td>
                      <td className="p-4 text-[#c80e13]">
                        ₹{emp.totalDeductions?.toLocaleString() || 0}
                      </td>
                      <td className="p-4 text-[#7d3cff] font-semibold">
                        ₹{emp.netSalary?.toLocaleString() || 0}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

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

export default EmployeeSalaryTable;