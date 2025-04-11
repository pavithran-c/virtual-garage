import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  FaCar,
  FaCalendarAlt,
  FaShoppingCart,
  FaSearch,
  FaPhoneAlt,
  FaPlus,
  FaTrash,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
} from "react-icons/fa";
import axios from "axios";
import { allServices } from "../../data/services";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Dashboard.css"; // Assuming this is where your Poppins font CSS lives

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
  const [appointments, setAppointments] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(!!initialServices.length);
  const [appointmentForm, setAppointmentForm] = useState({
    services: initialServices,
    date: "",
    time: "",
    number: "",
    phone: "",
    serviceOption: "Pick Up & Delivery",
    status: "Pending",
  });
  const [phoneError, setPhoneError] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showAppointmentDeleteModal, setShowAppointmentDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customService, setCustomService] = useState("");
  const MAX_APPOINTMENTS_PER_DAY = 8;

  const [isVehiclesOpen, setIsVehiclesOpen] = useState(true);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(true);
  const [isOrdersOpen, setIsOrdersOpen] = useState(true);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);

  const vehicleNumberRegex = /^[A-Z]{2}\s\d{2}\s[A-Z]\s\d{4}$/;
  const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.setMonth(today.getMonth() + 6));
    return maxDate.toISOString().split("T")[0];
  };

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
    return appointments.filter((appt) => appt.date === date && appt.status !== "Completed").length;
  };

  const isDuplicateAppointment = (newAppt) => {
    return appointments.some((appt) => {
      const sameNumber = appt.number === newAppt.number;
      return sameNumber && appt.status !== "Completed" && appt._id !== (editingAppointment?._id || "");
    });
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
    if (!editingAppointment && isDuplicateAppointment(appointmentForm)) {
      setError("An active appointment already exists for this vehicle.");
      return;
    }
    try {
      const response = editingAppointment
        ? await axios.put(`${API_URL}/appointments/${editingAppointment._id}`, appointmentForm, {
            withCredentials: true,
          })
        : await axios.post(`${API_URL}/appointments`, appointmentForm, { withCredentials: true });

      const updatedAppointment = response.data.appointment || response.data;
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
        status: "Pending",
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
      status: appointment.status || "Pending",
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

  // Chart Data for Appointments Over Time
  const chartData = {
    labels: appointments.map((appt) => appt.date),
    datasets: [
      {
        label: "Appointments",
        data: appointments.map((_, index) => index + 1),
        fill: false,
        borderColor: "#10b981",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Appointment Trends", font: { family: "Poppins", size: 18 } },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Number of Appointments" }, beginAtZero: true },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-6 rounded-xl shadow-lg mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Welcome, {user?.username || "Guest"}!
        </h1>
        <p className="text-sm md:text-base mt-2 opacity-90">Your vehicle management hub awaits.</p>
      </motion.div>

      {/* How It Works Outline */}
      <motion.div
        className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-teal-800 flex items-center">
            How This Dashboard Works
            <FaInfoCircle className="ml-2 text-teal-600" />
          </h2>
          <button
            onClick={() => setIsOutlineOpen(!isOutlineOpen)}
            className="text-teal-600 hover:text-teal-800 transition"
          >
            {isOutlineOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
        <AnimatePresence>
          {isOutlineOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-700 text-sm md:text-base"
            >
              <p className="mb-2">
                This dashboard is your one-stop solution to manage vehicles and appointments:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Quick Stats:</strong> See at a glance how many vehicles, upcoming appointments, and recent orders you have.
                </li>
                <li>
                  <strong>Vehicles:</strong> Add, view, or delete your vehicles. Click "Add Vehicle" to register a new one.
                </li>
                <li>
                  <strong>Appointments:</strong> Schedule new appointments or edit/delete existing ones. Use the form to pick services, dates, and times.
                </li>
                <li>
                  <strong>Recent Orders:</strong> Review completed appointments with key details.
                </li>
                <li>
                  <strong>Trends:</strong> Visualize your appointment activity over time with the chart below.
                </li>
                <li>
                  <strong>Navigation:</strong> Collapse sections with the arrows to focus on what matters most to you.
                </li>
              </ul>
              <p className="mt-2">
                Tip: Hover over icons for tooltips, and use the forms to keep everything up to date!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition group relative">
          <FaCar className="text-teal-600 text-3xl md:text-4xl" />
          <div>
            <p className="text-gray-600 text-sm md:text-base">Vehicles</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">{vehicles.length}</h3>
          </div>
          <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500">Total registered vehicles</span>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition group relative">
          <FaCalendarAlt className="text-emerald-600 text-3xl md:text-4xl" />
          <div>
            <p className="text-gray-600 text-sm md:text-base">Appointments</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">{appointments.length}</h3>
          </div>
          <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500">Upcoming services</span>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition group relative">
          <FaShoppingCart className="text-amber-600 text-3xl md:text-4xl" />
          <div>
            <p className="text-gray-600 text-sm md:text-base">Orders</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">{recentOrders.length}</h3>
          </div>
          <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500">Completed services</span>
        </div>
      </motion.div>

      {/* Vehicles Section */}
      <motion.div
        className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-teal-800 flex items-center">
            Your Vehicles
            <span className="ml-2 text-xs text-gray-500">({vehicles.length})</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsVehiclesOpen(!isVehiclesOpen)}
              className="text-teal-600 hover:text-teal-800 transition"
            >
              {isVehiclesOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 transition text-sm md:text-base"
            >
              <FaPlus className="mr-2" /> Add Vehicle
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isVehiclesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? (
                <p className="text-gray-600 text-center">Loading vehicles...</p>
              ) : vehicles.length === 0 ? (
                <p className="text-gray-600 text-center">No vehicles added yet. Click "Add Vehicle" to start!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Name</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Manufacturer</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Number</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle._id} className="border-b hover:bg-teal-50 transition">
                          <td className="p-3 text-gray-800">{vehicle.name}</td>
                          <td className="p-3 text-gray-800">{vehicle.manufacturer}</td>
                          <td className="p-3 text-gray-800">{vehicle.number}</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleDeleteVehicle(vehicle._id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete Vehicle"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Appointments Section */}
      <motion.div
        className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-teal-800 flex items-center">
            Upcoming Appointments
            <span className="ml-2 text-xs text-gray-500">({appointments.length})</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAppointmentsOpen(!isAppointmentsOpen)}
              className="text-teal-600 hover:text-teal-800 transition"
            >
              {isAppointmentsOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
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
                  status: "Pending",
                });
                setIsAppointmentFormOpen(true);
                setSearchTerm("");
                setCustomService("");
              }}
              className="flex items-center bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 transition text-sm md:text-base"
            >
              <FaPlus className="mr-2" /> Add Appointment
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isAppointmentsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {appointments.length === 0 ? (
                <p className="text-gray-600 text-center">No appointments scheduled yet. Book one now!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Services</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Date</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Time</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Vehicle</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Phone</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Option</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Status</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment._id} className="border-b hover:bg-teal-50 transition">
                          <td className="p-3 text-gray-800">
                            {(appointment.services || [appointment.service]).join(", ")}
                          </td>
                          <td className="p-3 text-gray-800">{appointment.date}</td>
                          <td className="p-3 text-gray-800">{appointment.time}</td>
                          <td className="p-3 text-gray-800">{appointment.number}</td>
                          <td className="p-3 text-gray-800">{appointment.phone || "N/A"}</td>
                          <td className="p-3 text-gray-800">{appointment.serviceOption || "N/A"}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === "Pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : appointment.status === "Accepted"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {appointment.status || "Pending"}
                            </span>
                          </td>
                          <td className="p-3 flex space-x-2">
                            {(appointment.status === "Pending" || appointment.changeRequested) && (
                              <>
                                <button
                                  onClick={() => handleEditAppointment(appointment)}
                                  className="text-amber-600 hover:text-amber-800 transition"
                                  title="Edit Appointment"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteAppointment(appointment._id)}
                                  className="text-red-600 hover:text-red-800 transition"
                                  title="Delete Appointment"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recent Orders Section */}
      <motion.div
        className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-teal-800 flex items-center">
            Recent Orders
            <span className="ml-2 text-xs text-gray-500">({recentOrders.length})</span>
          </h3>
          <button
            onClick={() => setIsOrdersOpen(!isOrdersOpen)}
            className="text-teal-600 hover:text-teal-800 transition"
          >
            {isOrdersOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
        <AnimatePresence>
          {isOrdersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {recentOrders.length === 0 ? (
                <p className="text-gray-600 text-center">No recent orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Order</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Date</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Vehicle</th>
                        <th className="p-3 text-sm md:text-base font-medium text-teal-800">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id} className="border-b hover:bg-teal-50 transition">
                          <td className="p-3 text-gray-800">{(order.services || []).join(", ")}</td>
                          <td className="p-3 text-gray-800">{order.date}</td>
                          <td className="p-3 text-gray-800">{order.number}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Appointment Trends Chart */}
      {appointments.length > 0 && (
        <motion.div
          className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <h3 className="text-lg md:text-xl font-semibold text-teal-800 mb-4">Appointment Trends</h3>
          <div className="max-w-3xl mx-auto">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>
      )}

      {/* Vehicle Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-teal-800 mb-4">Add a Vehicle</h3>
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                    Vehicle Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={vehicleForm.name}
                    onChange={handleVehicleChange}
                    placeholder="e.g., My Sedan"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="manufacturer" className="block text-gray-700 font-medium mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={vehicleForm.manufacturer}
                    onChange={handleVehicleChange}
                    placeholder="e.g., Toyota"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="number" className="block text-gray-700 font-medium mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    id="number"
                    name="number"
                    value={vehicleForm.number}
                    onChange={handleVehicleChange}
                    placeholder="e.g., TN 88 Y 0666"
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
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
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition disabled:bg-gray-400"
                    disabled={!!vehicleNumberError || loading}
                  >
                    {loading ? "Adding..." : "Add Vehicle"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Vehicle Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-teal-800 mb-4">Confirm Deletion</h3>
              <p className="mb-4 text-gray-600">
                Are you sure you want to delete this vehicle? This action cannot be undone.
              </p>
              {vehicleToDelete && vehicles.find((v) => v._id === vehicleToDelete) && (
                <p className="mb-4 text-gray-700">
                  Vehicle: {vehicles.find((v) => v._id === vehicleToDelete).name} (
                  {vehicles.find((v) => v._id === vehicleToDelete).manufacturer})
                </p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelDeleteVehicle}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteVehicle}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment Form Modal */}
      <AnimatePresence>
        {isAppointmentFormOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsAppointmentFormOpen(false)}
          >
            <motion.div
              className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl md:text-2xl font-bold text-teal-800 mb-6">
                {editingAppointment ? "Edit Appointment" : "Add Appointment"}
              </h3>
              {editingAppointment?.changeRequested && (
                <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-lg shadow-sm">
                  <p className="font-semibold">Admin Request:</p>
                  <p>Please change the appointment date. Reason: {editingAppointment.changeReason}</p>
                </div>
              )}
              <form onSubmit={handleAppointmentSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Services</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search services..."
                      className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="mt-3 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                    {filteredServices.length === 0 && !searchTerm ? (
                      <p className="text-gray-500 text-sm">No services available</p>
                    ) : filteredServices.length === 0 ? (
                      <p className="text-gray-500 text-sm">No services found</p>
                    ) : (
                      filteredServices.map((service) => (
                        <div key={service} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            id={`service-${service}`}
                            name="services"
                            value={service}
                            checked={appointmentForm.services.includes(service)}
                            onChange={handleAppointmentChange}
                            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <label htmlFor={`service-${service}`} className="text-gray-700 text-sm">
                            {service}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 flex items-center space-x-3">
                    <input
                      type="text"
                      value={customService}
                      onChange={handleCustomServiceChange}
                      onKeyPress={handleCustomServiceKeyPress}
                      placeholder="Add custom service..."
                      className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={addCustomService}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  {appointmentForm.services.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {appointmentForm.services.map((service) => (
                        <span
                          key={service}
                          className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full"
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
                            className="ml-2 text-teal-600 hover:text-teal-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {appointmentForm.services.length === 0 && (
                    <p className="text-red-500 text-sm mt-1">Please select or add at least one service</p>
                  )}
                </div>
                <div>
                  <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={appointmentForm.date}
                    onChange={handleAppointmentChange}
                    min={new Date().toISOString().split("T")[0]}
                    max={getMaxDate()}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  {appointmentForm.date &&
                    getAppointmentsForDate(appointmentForm.date) >= MAX_APPOINTMENTS_PER_DAY &&
                    !editingAppointment && (
                      <p className="text-red-500 text-sm mt-1">
                        This date is fully booked (max {MAX_APPOINTMENTS_PER_DAY} appointments)
                      </p>
                    )}
                </div>
                <div>
                  <label htmlFor="time" className="block text-gray-700 font-medium mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={appointmentForm.time}
                    onChange={handleAppointmentChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="number" className="block text-gray-700 font-medium mb-2">
                    Vehicle Number
                  </label>
                  <select
                    id="number"
                    name="number"
                    value={appointmentForm.number}
                    onChange={handleAppointmentChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle.number}>
                        {vehicle.number} ({vehicle.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
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
                      className={`w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        phoneError ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Service Option</label>
                  <div className="space-y-3">
                    {["Home Service", "Pick Up & Delivery", "On-Spot Service"].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="serviceOption"
                          value={option}
                          checked={appointmentForm.serviceOption === option}
                          onChange={handleAppointmentChange}
                          className="mr-2 h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {editingAppointment && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Status</label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        appointmentForm.status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : appointmentForm.status === "Accepted"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {appointmentForm.status || "Pending"}
                    </span>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsAppointmentFormOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition disabled:bg-gray-400"
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

      {/* Delete Appointment Modal */}
      <AnimatePresence>
        {showAppointmentDeleteModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowAppointmentDeleteModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-teal-800 mb-4">Confirm Deletion</h3>
              <p className="mb-4 text-gray-600">
                Are you sure you want to delete this appointment? This action cannot be undone.
              </p>
              {appointmentToDelete && appointments.find((a) => a._id === appointmentToDelete) && (
                <p className="mb-4 text-gray-700">
                  Appointment: {(appointments.find((a) => a._id === appointmentToDelete).services || []).join(", ")} on{" "}
                  {appointments.find((a) => a._id === appointmentToDelete).date} at{" "}
                  {appointments.find((a) => a._id === appointmentToDelete).time}
                </p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelDeleteAppointment}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAppointment}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;