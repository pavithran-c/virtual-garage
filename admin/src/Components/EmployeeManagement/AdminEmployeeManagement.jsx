import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserPlus, FaEdit, FaTrash, FaTimes, FaCheckCircle } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  });
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/employees`, { withCredentials: true });
      setEmployees(response.data.employees);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employees");
      setToast({ type: "error", message: "Failed to load employees" });
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
      setToast({ type: "error", message: "Please fix the form errors" });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/employees/${editingId}`, form, {
          withCredentials: true,
        });
        setToast({ type: "success", message: "Employee updated successfully" });
      } else {
        await axios.post(`${API_URL}/employees`, form, { withCredentials: true });
        setToast({ type: "success", message: "Employee added successfully" });
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
      });
      setEditingId(null);
      setFormErrors({});
      fetchEmployees();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save employee";
      setError(message);
      setToast({ type: "error", message });
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
    });
    setEditingId(employee._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`${API_URL}/employees/${id}`, { withCredentials: true });
        setToast({ type: "success", message: "Employee deleted successfully" });
        fetchEmployees();
      } catch (err) {
        const message = err.response?.data?.message || "Failed to delete employee";
        setError(message);
        setToast({ type: "error", message });
      }
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { Active: 0, Inactive: 0 };
    employees.forEach((emp) => {
      counts[emp.status.charAt(0).toUpperCase() + emp.status.slice(1)] += 1;
    });
    return counts;
  }, [employees]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fceed1] flex items-center justify-center">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7d3cff]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fceed1] font-poppins py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-5xl mx-auto space-y-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#7d3cff] tracking-tight">
            Employee Management
          </h1>
          <span className="text-gray-600 font-medium">{employees.length} Employees</span>
        </div>

        {/* Stats Card */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white p-4 rounded-xl shadow-md backdrop-blur-md bg-opacity-80">
            <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
            <p className="text-2xl font-bold text-[#7d3cff]">{employees.length}</p>
          </div>
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

        {/* Add/Edit Form */}
        <motion.div
          className="bg-white rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="sticky top-0 bg-[#7d3cff]/10 p-6 rounded-t-xl flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#7d3cff]">
              {editingId ? "Edit Employee" : "Add New Employee"}
            </h2>
            <motion.button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="text-[#7d3cff] hover:text-[#7d3cff]/80"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFormOpen ? <FaTimes className="text-xl" /> : <FaUserPlus className="text-xl" />}
            </motion.button>
          </div>
          <AnimatePresence>
            {isFormOpen && (
              <motion.form
                onSubmit={handleSubmit}
                className="p-6"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={form.employeeId}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition disabled:bg-gray-100"
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
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
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
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
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
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
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
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
                      required
                    />
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
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
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
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
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
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d3cff] transition"
                      required
                      min="10000"
                      max="50000"
                      step="1"
                    />
                    {formErrors.salary && (
                      <div className="text-[#c80e13] text-sm mt-1">{formErrors.salary}</div>
                    )}
                  </div>
                </div>
                <motion.button
                  type="submit"
                  className="mt-6 bg-[#7d3cff] text-white px-6 py-3 rounded-xl hover:bg-[#7d3cff]/80 flex items-center shadow-md transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaUserPlus className="mr-2" /> {editingId ? "Update Employee" : "Add Employee"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Employee List */}
        <motion.div
          className="bg-white rounded-xl shadow-md backdrop-blur-md bg-opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#7d3cff] mb-4">Employees</h2>
            {employees.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No employees found.</p>
            ) : (
              <div className="space-y-4">
                {employees.map((employee) => (
                  <motion.div
                    key={employee._id}
                    className="flex justify-between items-center border-b py-4 hover:bg-gray-50 transition"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.email}</p>
                      <p className="text-sm text-gray-600">
                        {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)} -{" "}
                        {employee.department} - ₹{employee.salary.toLocaleString()}
                      </p>
                      <p className="text-sm">
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
                    <div className="flex space-x-4">
                      <motion.div className="relative group">
                        <motion.button
                          onClick={() => handleEdit(employee)}
                          className="text-[#7d3cff] hover:text-[#7d3cff]/80"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaEdit className="text-lg" />
                        </motion.button>
                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                          Edit Employee
                        </span>
                      </motion.div>
                      <motion.div className="relative group">
                        <motion.button
                          onClick={() => handleDelete(employee._id)}
                          className="text-[#c80e13] hover:text-[#c80e13]/80"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaTrash className="text-lg" />
                        </motion.button>
                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                          Delete Employee
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
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

export default AdminEmployeeManagement;