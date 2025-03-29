import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaCar, FaCalendarAlt, FaShoppingCart, FaSearch, FaPhoneAlt } from "react-icons/fa";
import axios from "axios";
import { allServices } from "../../data/services";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({ name: "", manufacturer: "", number: "" });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [vehicleNumberError, setVehicleNumberError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialServices = queryParams.get("services")?.split(",").map(decodeURIComponent) || [];
  const [appointments, setAppointments] = useState([]); // Active appointments (Pending/Accepted)
  const [recentOrders, setRecentOrders] = useState([]); // Completed appointments
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(!!initialServices.length);
  const [appointmentForm, setAppointmentForm] = useState({
    services: initialServices,
    date: "",
    time: "",
    number: "",
    phone: "",
    serviceOption: "Pick Up & Delivery",
  });
  const [phoneError, setPhoneError] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showAppointmentDeleteModal, setShowAppointmentDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customService, setCustomService] = useState("");
  const MAX_APPOINTMENTS_PER_DAY = 8;

  const vehicleNumberRegex = /^[A-Z]{2}\s\d{2}\s[A-Z]\s\d{4}$/;
  const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/vehicles`, { withCredentials: true });
        setVehicles(response.data);
        setError("");
      } catch (error) {
        console.error("Error fetching vehicles:", error.response || error);
        setError(error.response?.data?.message || "Failed to fetch vehicles");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchVehicles();
  }, [user]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${API_URL}/appointments`, { withCredentials: true });
        const allAppointments = response.data;
        // Split into active appointments and recent orders based on status
        const activeAppointments = allAppointments.filter(
          (appt) => appt.status !== "Completed"
        );
        const completedAppointments = allAppointments.filter(
          (appt) => appt.status === "Completed"
        );
        setAppointments(activeAppointments);
        setRecentOrders(completedAppointments);
        setError("");
      } catch (error) {
        console.error("Error fetching appointments:", error.response || error);
        setError(error.response?.data?.message || "Failed to fetch appointments");
      }
    };
    if (user) fetchAppointments();
  }, [user]);

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm({ ...vehicleForm, [name]: value });
    if (name === "number") {
      if (!vehicleNumberRegex.test(value)) {
        setVehicleNumberError("Vehicle number must be in the format: TN 88 Y 0666");
      } else {
        setVehicleNumberError("");
      }
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleForm.name || !vehicleForm.manufacturer || !vehicleForm.number) {
      setError("All fields are required");
      return;
    }
    if (!vehicleNumberRegex.test(vehicleForm.number)) {
      setVehicleNumberError("Vehicle number must be in the format: TN 88 Y 0666");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/vehicles`, vehicleForm, { withCredentials: true });
      setVehicles([...vehicles, response.data]);
      setVehicleForm({ name: "", manufacturer: "", number: "" });
      setIsFormOpen(false);
      setError("");
      setVehicleNumberError("");
    } catch (error) {
      console.error("Error adding vehicle:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = (vehicleId) => {
    setVehicleToDelete(vehicleId);
    setShowDeleteModal(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!vehicleToDelete) {
      setShowDeleteModal(false);
      setError("No vehicle selected for deletion");
      return;
    }
    try {
      await axios.delete(`${API_URL}/vehicles/${vehicleToDelete}`, { withCredentials: true });
      setVehicles(vehicles.filter((vehicle) => vehicle._id !== vehicleToDelete));
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      setError("");
    } catch (error) {
      console.error("Error deleting vehicle:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to delete vehicle");
      setShowDeleteModal(false);
    }
  };

  const cancelDeleteVehicle = () => {
    setShowDeleteModal(false);
    setVehicleToDelete(null);
  };

  const handleAppointmentChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "services") {
      setAppointmentForm((prev) => {
        const services = checked
          ? [...prev.services, value]
          : prev.services.filter((service) => service !== value);
        return { ...prev, services };
      });
    } else {
      setAppointmentForm({ ...appointmentForm, [name]: value });
      if (name === "phone") {
        if (!phoneRegex.test(value)) {
          setPhoneError("Phone number must be in format: 9876543210 or +919876543210 or 919876543210");
        } else {
          setPhoneError("");
        }
      }
    }
  };

  const handleCustomServiceChange = (e) => {
    setCustomService(e.target.value);
  };

  const addCustomService = () => {
    const trimmedService = customService.trim();
    if (trimmedService && !appointmentForm.services.includes(trimmedService)) {
      setAppointmentForm((prev) => ({
        ...prev,
        services: [...prev.services, trimmedService],
      }));
      setCustomService("");
    }
  };

  const handleCustomServiceKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomService();
    }
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter((appt) => appt.date === date).length;
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (
      appointmentForm.services.length === 0 ||
      !appointmentForm.date ||
      !appointmentForm.time ||
      !appointmentForm.number ||
      !appointmentForm.phone
    ) {
      setError("All fields are required, including at least one service and phone number");
      return;
    }
    if (!phoneRegex.test(appointmentForm.phone)) {
      setPhoneError("Phone number must be in format: +919876543210 or 9876543210 or 9876543210");
      return;
    }
    try {
      const response = editingAppointment
        ? await axios.put(`${API_URL}/appointments/${editingAppointment._id}`, appointmentForm, {
            withCredentials: true,
          })
        : await axios.post(`${API_URL}/appointments`, appointmentForm, { withCredentials: true });

      const updatedAppointment = response.data.appointment || response.data; // Handle response structure
      if (editingAppointment) {
        if (updatedAppointment.status === "Completed") {
          setAppointments(
            appointments.filter((appt) => appt._id !== editingAppointment._id)
          );
          setRecentOrders([...recentOrders, updatedAppointment]);
        } else {
          setAppointments(
            appointments.map((appt) =>
              appt._id === editingAppointment._id ? updatedAppointment : appt
            )
          );
        }
        setEditingAppointment(null);
      } else {
        setAppointments([...appointments, updatedAppointment]);
      }
      setAppointmentForm({
        services: [],
        date: "",
        time: "",
        number: "",
        phone: "",
        serviceOption: "Pick Up & Delivery",
      });
      setIsAppointmentFormOpen(false);
      setError("");
      setPhoneError("");
      setSearchTerm("");
      setCustomService("");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving appointment:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to save appointment");
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setAppointmentForm({
      services: appointment.services || [appointment.service],
      date: appointment.date,
      time: appointment.time,
      number: appointment.number,
      phone: appointment.phone || "",
      serviceOption: appointment.serviceOption || "Pick Up & Delivery",
    });
    setIsAppointmentFormOpen(true);
  };

  const handleDeleteAppointment = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
    setShowAppointmentDeleteModal(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) {
      setShowAppointmentDeleteModal(false);
      setError("No appointment selected for deletion");
      return;
    }
    try {
      const appointment = appointments.find((appt) => appt._id === appointmentToDelete);
      await axios.delete(`${API_URL}/appointments/${appointmentToDelete}`, { withCredentials: true });
      if (appointment.status === "Completed") {
        setRecentOrders(recentOrders.filter((order) => order._id !== appointmentToDelete));
      } else {
        setAppointments(appointments.filter((appt) => appt._id !== appointmentToDelete));
      }
      setShowAppointmentDeleteModal(false);
      setAppointmentToDelete(null);
      setError("");
    } catch (error) {
      console.error("Error deleting appointment:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to delete appointment");
      setShowAppointmentDeleteModal(false);
    }
  };

  const cancelDeleteAppointment = () => {
    setShowAppointmentDeleteModal(false);
    setAppointmentToDelete(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredServices = allServices.filter((service) =>
    service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-[#12343b] text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold">Welcome, {user?.username || "Guest"}!</h1>
        <p className="text-lg mt-2">Your virtual garage is ready for you.</p>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaCar className="text-blue-500 text-3xl" />
          <div>
            <p className="text-gray-500">Vehicles Added</p>
            <h3 className="text-2xl font-bold">{vehicles.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaCalendarAlt className="text-green-500 text-3xl" />
          <div>
            <p className="text-gray-500">Upcoming Appointments</p>
            <h3 className="text-2xl font-bold">{appointments.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaShoppingCart className="text-yellow-500 text-3xl" />
          <div>
            <p className="text-gray-500">Recent Orders</p>
            <h3 className="text-2xl font-bold">{recentOrders.length}</h3>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Your Vehicles</h3>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add Vehicle
          </button>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p className="text-gray-500">No vehicles added yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Manufacturer</th>
                <th className="p-3 text-left">Number</th>
                <th className="p-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id} className="border-b">
                  <td className="p-3">{vehicle.name}</td>
                  <td className="p-3">{vehicle.manufacturer}</td>
                  <td className="p-3">{vehicle.number}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteVehicle(vehicle._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            animate={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Add a Vehicle</h3>
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-gray-700 font-medium">
                    Vehicle Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={vehicleForm.name}
                    onChange={handleVehicleChange}
                    placeholder="e.g., My Sedan"
                    className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="manufacturer" className="text-gray-700 font-medium">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={vehicleForm.manufacturer}
                    onChange={handleVehicleChange}
                    placeholder="e.g., Toyota"
                    className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="number" className="text-gray-700 font-medium">
                    Vehicle Number (License Plate)
                  </label>
                  <input
                    type="text"
                    id="number"
                    name="number"
                    value={vehicleForm.number}
                    onChange={handleVehicleChange}
                    placeholder="e.g., TN 88 Y 0666"
                    className={`mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      vehicleNumberError ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {vehicleNumberError && (
                    <p className="text-red-500 text-sm mt-1">{vehicleNumberError}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    disabled={!!vehicleNumberError}
                  >
                    Add Vehicle
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            animate={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
              <p className="mb-4">Are you sure you want to delete this vehicle? This action cannot be undone.</p>
              {vehicleToDelete && vehicles.find((v) => v._id === vehicleToDelete) ? (
                <p className="mb-4 text-gray-600">
                  Vehicle: {vehicles.find((v) => v._id === vehicleToDelete).name} (
                  {vehicles.find((v) => v._id === vehicleToDelete).manufacturer})
                </p>
              ) : (
                <p className="mb-4 text-gray-600">Vehicle ID: {vehicleToDelete}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelDeleteVehicle}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteVehicle}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Upcoming Appointments</h3>
          <button
            onClick={() => {
              setEditingAppointment(null);
              setAppointmentForm({
                services: [],
                date: "",
                time: "",
                number: "",
                phone: "",
                serviceOption: "Pick Up & Delivery",
              });
              setIsAppointmentFormOpen(true);
              setSearchTerm("");
              setCustomService("");
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add Appointment
          </button>
        </div>
        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments scheduled yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Services</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Vehicle Number</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Service Option</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="border-b">
                  <td className="p-3">
                    {(appointment.services || [appointment.service]).join(", ")}
                  </td>
                  <td className="p-3">{appointment.date}</td>
                  <td className="p-3">{appointment.time}</td>
                  <td className="p-3">{appointment.number}</td>
                  <td className="p-3">{appointment.phone || "N/A"}</td>
                  <td className="p-3">{appointment.serviceOption || "N/A"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        appointment.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : appointment.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {appointment.status || "Pending"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <AnimatePresence>
        {isAppointmentFormOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto"
            initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            animate={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsAppointmentFormOpen(false)}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-[#12343b] mb-6">
                {editingAppointment ? "Edit Appointment" : "Add Appointment"}
              </h3>
              <form onSubmit={handleAppointmentSubmit} className="space-y-6">
                <div className="flex flex-col">
                  <label className="text-gray-700 font-semibold mb-2">Services</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search services..."
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                  <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                    {filteredServices.length === 0 && !searchTerm ? (
                      <p className="text-gray-500 text-sm">No services available</p>
                    ) : filteredServices.length === 0 ? (
                      <p className="text-gray-500 text-sm">No services found</p>
                    ) : (
                      filteredServices.map((service) => (
                        <div
                          key={service}
                          className="flex items-center space-x-2 py-2 hover:bg-gray-100 rounded-md px-2"
                        >
                          <input
                            type="checkbox"
                            id={`service-${service}`}
                            name="services"
                            value={service}
                            checked={appointmentForm.services.includes(service)}
                            onChange={handleAppointmentChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`service-${service}`}
                            className="text-gray-700 text-sm cursor-pointer"
                          >
                            {service}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <input
                      type="text"
                      value={customService}
                      onChange={handleCustomServiceChange}
                      onKeyPress={handleCustomServiceKeyPress}
                      placeholder="Add custom service..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={addCustomService}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      Add
                    </button>
                  </div>
                  {appointmentForm.services.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {appointmentForm.services.map((service) => (
                        <span
                          key={service}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() =>
                              setAppointmentForm((prev) => ({
                                ...prev,
                                services: prev.services.filter((s) => s !== service),
                              }))
                            }
                            className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {appointmentForm.services.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">Please select or add at least one service</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label htmlFor="date" className="text-gray-700 font-semibold mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={appointmentForm.date}
                    onChange={handleAppointmentChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    required
                  />
                  {appointmentForm.date &&
                    getAppointmentsForDate(appointmentForm.date) >= MAX_APPOINTMENTS_PER_DAY &&
                    !editingAppointment && (
                      <p className="text-red-500 text-sm mt-2">
                        This date is fully booked (max {MAX_APPOINTMENTS_PER_DAY} appointments)
                      </p>
                    )}
                </div>
                <div className="flex flex-col">
                  <label htmlFor="time" className="text-gray-700 font-semibold mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={appointmentForm.time}
                    onChange={handleAppointmentChange}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="number" className="text-gray-700 font-semibold mb-2">
                    Vehicle Number
                  </label>
                  <select
                    id="number"
                    name="number"
                    value={appointmentForm.number}
                    onChange={handleAppointmentChange}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    required
                  >
                    <option value="">Select Vehicle Number</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle.number}>
                        {vehicle.number} ({vehicle.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="phone" className="text-gray-700 font-semibold mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={appointmentForm.phone}
                      onChange={handleAppointmentChange}
                      placeholder="e.g., 9876543210"
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 ${
                        phoneError ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {phoneError && <p className="text-red-500 text-sm mt-2">{phoneError}</p>}
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-semibold mb-2">Service Option</label>
                  <div className="mt-1 flex flex-col space-y-3">
                    {["Home Service", "Pick Up & Delivery", "On-Spot Service"].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="serviceOption"
                          value={option}
                          checked={appointmentForm.serviceOption === option}
                          onChange={handleAppointmentChange}
                          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsAppointmentFormOpen(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                    disabled={
                      phoneError ||
                      (appointmentForm.date &&
                        getAppointmentsForDate(appointmentForm.date) >= MAX_APPOINTMENTS_PER_DAY &&
                        !editingAppointment)
                    }
                  >
                    {editingAppointment ? "Update" : "Book"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAppointmentDeleteModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            animate={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowAppointmentDeleteModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
              <p className="mb-4">Are you sure you want to delete this appointment? This action cannot be undone.</p>
              {appointmentToDelete && appointments.find((a) => a._id === appointmentToDelete) ? (
                <p className="mb-4 text-gray-600">
                  Appointment: {(appointments.find((a) => a._id === appointmentToDelete).services || []).join(", ")} on{" "}
                  {appointments.find((a) => a._id === appointmentToDelete).date} at{" "}
                  {appointments.find((a) => a._id === appointmentToDelete).time}
                </p>
              ) : (
                <p className="mb-4 text-gray-600">Appointment ID: {appointmentToDelete}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelDeleteAppointment}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAppointment}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">No recent orders yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Vehicle Number</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="p-3">{(order.services || []).join(", ")}</td>
                  <td className="p-3">{order.date}</td>
                  <td className="p-3">{order.number}</td>
                  <td className="p-3 text-green-500">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;