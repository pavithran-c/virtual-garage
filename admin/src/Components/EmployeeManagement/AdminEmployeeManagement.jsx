import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaUserPlus, FaEdit, FaTrash } from "react-icons/fa";

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
    if (Object.keys(errors).length > 0) return;

    try {
      if (editingId) {
        await axios.put(`${API_URL}/employees/${editingId}`, form, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${API_URL}/employees`, form, { withCredentials: true });
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
      setError(err.response?.data?.message || "Failed to save employee");
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
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`${API_URL}/employees/${id}`, { withCredentials: true });
        fetchEmployees();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete employee");
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading employees...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-teal-800 mb-6">Employee Management</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Add/Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={form.employeeId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                pattern="^[A-Za-z0-9_-]+$"
                title="Employee ID must be alphanumeric"
                disabled={!!editingId}
              />
              {formErrors.employeeId && (
                <div className="text-red-600 text-sm">{formErrors.employeeId}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              {formErrors.name && (
                <div className="text-red-600 text-sm">{formErrors.name}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              {formErrors.email && (
                <div className="text-red-600 text-sm">{formErrors.email}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="manager">Manager</option>
                <option value="technician">Technician</option>
                <option value="support">Support</option>
                <option value="other">Other</option>
              </select>
              {formErrors.role && (
                <div className="text-red-600 text-sm">{formErrors.role}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              {formErrors.department && (
                <div className="text-red-600 text-sm">{formErrors.department}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                maxLength={10}
                pattern="[6-9]{1}[0-9]{9}"
                title="Enter a valid 10-digit Indian phone number"
              />
              {formErrors.phone && (
                <div className="text-red-600 text-sm">{formErrors.phone}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {formErrors.status && (
                <div className="text-red-600 text-sm">{formErrors.status}</div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Salary (Monthly)</label>
              <input
                type="number"
                name="salary"
                value={form.salary}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                min="10000"
                max="50000"
                step="1"
              />
              {formErrors.salary && (
                <div className="text-red-600 text-sm">{formErrors.salary}</div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center"
          >
            <FaUserPlus className="mr-2" /> {editingId ? "Update Employee" : "Add Employee"}
          </button>
        </form>

        {/* Employee List */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-teal-800 mb-4">Employees</h2>
          {employees.length === 0 ? (
            <p className="text-gray-600">No employees found.</p>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div
                  key={employee._id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                    <p className="text-sm text-gray-600">
                      {employee.role} - {employee.department} - ₹{employee.salary}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-teal-600 hover:text-teal-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminEmployeeManagement;