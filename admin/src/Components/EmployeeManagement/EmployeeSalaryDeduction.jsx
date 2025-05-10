import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";

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
        console.error("Fetch employees error:", err);
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
      return;
    }

    // Client-side validation
    const newAmount = Number(form.amount);
    if (newAmount + netSalaryData.totalDeductions > netSalaryData.baseSalary) {
      setError("Total deductions cannot exceed employee salary");
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

      setDeductions(deductionsResponse.data.deductions);
      setNetSalaryData(netSalaryResponse.data);
      setForm({
        amount: "",
        reason: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add deduction");
      console.error("Deduction error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 sm:p-6 font-poppins">
      <motion.div
        className="w-full max-w-5xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-teal-800 mb-6">
          Employee Salary Deduction
        </h1>

        {/* Employee Selection */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Select Employee
          </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-200"
            disabled={loading}
          >
            <option value="">-- Select an Employee --</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-6 flex justify-center">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {employee && !loading && (
          <>
            {/* Employee Details */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <h2 className="text-xl font-semibold text-teal-800 mb-4">
                Employee Details
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Name:</span> {employee.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {employee.email}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Role:</span> {employee.role}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Department:</span>{" "}
                  {employee.department}
                </p>
              </div>
            </div>

            {/* Salary Summary */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <h2 className="text-xl font-semibold text-teal-800 mb-4">
                Salary Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600">Base Salary</p>
                  <p className="text-lg font-medium">
                    ₹{netSalaryData.baseSalary.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Deductions</p>
                  <p className="text-lg font-medium">
                    ₹{netSalaryData.totalDeductions.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Net Salary</p>
                  <p className="text-lg font-medium text-teal-600">
                    ₹{netSalaryData.netSalary.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Deduction Form */}
            <form
              onSubmit={handleDeduct}
              className="bg-white p-6 rounded-xl shadow-md mb-6"
            >
              <h2 className="text-xl font-semibold text-teal-800 mb-4">
                Add Deduction
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-200"
                    required
                    min="0"
                    step="1"
                    max={netSalaryData.baseSalary - netSalaryData.totalDeductions}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    name="reason"
                    value={form.reason}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-200"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="reason"
                    value={form.date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-200"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center disabled:bg-teal-400"
                disabled={loading}
              >
                <FaPlus className="mr-2" /> {loading ? "Adding..." : "Add Deduction"}
              </button>
            </form>

            {/* Deduction List */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-teal-800 mb-4">
                Deductions
              </h2>
              {deductions.length === 0 ? (
                <p className="text-gray-600">No deductions recorded.</p>
              ) : (
                <div className="space-y-4">
                  {deductions.map((deduction) => (
                    <div
                      key={deduction._id}
                      className="flex justify-between items-center border-b border-gray-200 py-2"
                    >
                      <div>
                        <p className="font-medium">
                          ₹{deduction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">{deduction.reason}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(deduction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default EmployeeSalaryDeduction;