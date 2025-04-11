import { motion, AnimatePresence } from "framer-motion";
import {
  FaWrench, FaCar, FaTachometerAlt, FaBatteryHalf, FaOilCan, FaTools, FaWind, FaPaintRoller,
  FaShieldAlt, FaCogs, FaSnowflake, FaCarSide, FaCheckCircle, FaSoap, FaWater, FaSprayCan,
  FaSearch, FaTimes, FaCalendarAlt, FaPhoneAlt, FaCarCrash, FaStar, FaArrowLeft, FaArrowRight, FaRobot, FaEnvelope
} from "react-icons/fa";
import { useState, useContext, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { services, allServices } from "../../data/services";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../Components/ThemeContext";
import axios from "axios";
import { Howl } from "howler";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const clickSound = new Howl({
  src: ["/sounds/click.mp3"],
  volume: 0.5,
});

const ServiceCard = ({ icon, title, onClick }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const { theme } = useContext(ThemeContext);

  return (
    <motion.div
      ref={ref}
      className={`p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[#e1b382]/50 cursor-pointer ${
        theme === "dark" ? "bg-gradient-to-br from-[#2d545e]/90 to-[#12343b]/80" : "bg-gradient-to-br from-white/90 to-gray-100/80"
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${title} services`}
    >
      <div className={`text-4xl mb-3 ${theme === "dark" ? "text-[#e1b382]" : "text-[#2d545e]"}`}>{icon}</div>
      <h3 className={`text-lg font-bold tracking-tight ${theme === "dark" ? "text-[#e1b382]" : "text-[#12343b]"}`}>{title}</h3>
    </motion.div>
  );
};

const SubServiceCard = ({ title, description, onClick }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#e1b382]/50 cursor-pointer ${
        theme === "dark" ? "bg-gradient-to-br from-[#2d545e]/90 to-[#12343b]/80" : "bg-gradient-to-br from-white/90 to-gray-100/80"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title}`}
    >
      <h3 className={`text-lg font-bold mb-2 tracking-tight ${theme === "dark" ? "text-[#e1b382]" : "text-[#12343b]"}`}>{title}</h3>
      <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{description}</p>
    </div>
  );
};

const ServiceDetailModal = ({ service, onClose, onApply }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
    >
      <motion.div
        className={`p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4 relative ${
          theme === "dark" ? "bg-[#12343b]/95" : "bg-white"
        }`}
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-[#e1b382]"
          onClick={onClose}
          aria-label="Close service details"
        >
          <FaTimes className="text-2xl" />
        </button>
        <h3 id="service-modal-title" className={`text-2xl font-extrabold mb-4 text-center ${theme === "dark" ? "text-[#e1b382]" : "text-[#12343b]"}`}>
          {service.title}
        </h3>
        <p className={`mb-6 text-base leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{service.fullDescription}</p>
        <ul className={`list-disc list-inside mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
          {service.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        <motion.button
          onClick={onApply}
          className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-6 py-3 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 w-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Apply for ${service.title}`}
        >
          Apply Now
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const BookingForm = ({ isOpen, setIsOpen, user, theme, navigate, vehicles, appointments, setAppointments }) => {
  const [bookingForm, setBookingForm] = useState({
    services: [],
    date: "",
    time: "",
    number: "",
    phone: "",
    serviceOption: "Pick Up & Delivery",
  });
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [customService, setCustomService] = useState("");
  const MAX_APPOINTMENTS_PER_DAY = 8;
  const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

  useEffect(() => {
    if (!user) return;
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${API_URL}/vehicles`, { withCredentials: true });
        vehicles.current = response.data;
      } catch (error) {
        console.error("Error fetching vehicles:", error.response || error);
        setError(error.response?.data?.message || "Failed to fetch vehicles");
      }
    };
    fetchVehicles();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${API_URL}/appointments`, { withCredentials: true });
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error.response || error);
        setError(error.response?.data?.message || "Failed to fetch appointments");
      }
    };
    fetchAppointments();
  }, [user]);

  const handleBookingChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "services") {
      setBookingForm((prev) => {
        const services = checked
          ? [...prev.services, value]
          : prev.services.filter((service) => service !== value);
        return { ...prev, services };
      });
    } else {
      setBookingForm({ ...prev, [name]: value });
      if (name === "phone") {
        if (!phoneRegex.test(value)) {
          setPhoneError("Phone number must be in format: 9876543210 or +919876543210");
        } else {
          setPhoneError("");
        }
      }
    }
  };

  const handleCustomServiceChange = (e) => setCustomService(e.target.value);

  const addCustomService = () => {
    const trimmedService = customService.trim();
    if (trimmedService && !bookingForm.services.includes(trimmedService)) {
      setBookingForm((prev) => ({
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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (
      bookingForm.services.length === 0 ||
      !bookingForm.date ||
      !bookingForm.time ||
      !bookingForm.number ||
      !bookingForm.phone
    ) {
      setError("All fields are required, including at least one service and phone number");
      return;
    }
    if (!phoneRegex.test(bookingForm.phone)) {
      setPhoneError("Phone number must be in format: 9876543210 or +919876543210");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/appointments`, bookingForm, { withCredentials: true });
      setAppointments([...appointments, response.data]);
      setBookingForm({ services: [], date: "", time: "", number: "", phone: "", serviceOption: "Pick Up & Delivery" });
      setIsOpen(false);
      setError("");
      setPhoneError("");
      setSearchTerm("");
      setCustomService("");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error booking service:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to book service");
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredServices = allServices.filter((service) =>
    service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <motion.div
            className={`rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col ${
              theme === "dark" ? "bg-gradient-to-b from-[#2d545e]/95 to-[#12343b]/95" : "bg-gradient-to-b from-white to-gray-100"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Iframe-like container with internal scrolling */}
            <div className="relative border-2 border-[#e1b382]/50 rounded-xl p-6 bg-opacity-90 backdrop-blur-md flex-1 overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-[#e1b382]"
                onClick={() => setIsOpen(false)}
                aria-label="Close booking form"
              >
                <FaTimes className="text-2xl" />
              </button>
              <h3 id="booking-modal-title" className={`text-2xl font-extrabold mb-6 text-center ${theme === "dark" ? "text-[#e1b382]" : "text-[#12343b]"}`}>
                Book Your Service
              </h3>
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="flex flex-col">
                  <label htmlFor="services-search" className={`font-semibold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                    Services
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="services-search"
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search services..."
                      className={`w-full pl-10 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e1b382] transition-all ${
                        theme === "dark" ? "bg-[#12343b]/80 border-[#e1b382]/30 text-gray-200" : "bg-white border-gray-200 text-gray-800"
                      }`}
                      aria-label="Search services to book"
                    />
                  </div>
                  <div className={`mt-3 max-h-48 overflow-y-auto rounded-lg p-3 shadow-inner ${
                    theme === "dark" ? "bg-[#12343b]/70 border-[#e1b382]/30" : "bg-gray-50 border-gray-200"
                  }`}>
                    {filteredServices.length === 0 && !searchTerm ? (
                      <p className="text-gray-500 text-sm">No services available</p>
                    ) : filteredServices.length === 0 ? (
                      <p className="text-gray-500 text-sm">No services found</p>
                    ) : (
                      filteredServices.map((service) => (
                        <div key={service} className="flex items-center space-x-2 py-2 hover:bg-[#e1b382]/10 rounded-md px-2 transition">
                          <input
                            type="checkbox"
                            id={`service-${service}`}
                            name="services"
                            value={service}
                            checked={bookingForm.services.includes(service)}
                            onChange={handleBookingChange}
                            className="h-4 w-4 text-[#e1b382] border-gray-300 rounded focus:ring-[#e1b382]"
                            aria-label={`Select ${service}`}
                          />
                          <label htmlFor={`service-${service}`} className={`text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-800"} cursor-pointer`}>
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
                      className={`flex-1 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e1b382] transition-all ${
                        theme === "dark" ? "bg-[#12343b]/80 border-[#e1b382]/30 text-gray-200" : "bg-white border-gray-200 text-gray-800"
                      }`}
                      aria-label="Add a custom service"
                    />
                    <motion.button
                      type="button"
                      onClick={addCustomService}
                      className="px-4 py-2 bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] rounded-lg shadow-md hover:shadow-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      aria-label="Add custom service to booking"
                    >
                      Add
                    </motion.button>
                  </div>
                  {bookingForm.services.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {bookingForm.services.map((service) => (
                        <span key={service} className="inline-flex items-center px-3 py-1 bg-[#e1b382]/20 text-[#12343b] text-sm rounded-full shadow-sm">
                          {service}
                          <button
                            type="button"
                            onClick={() => setBookingForm((prev) => ({ ...prev, services: prev.services.filter((s) => s !== service) }))}
                            className="ml-2 text-[#12343b] hover:text-[#c89666] focus:outline-none"
                            aria-label={`Remove ${service} from booking`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {bookingForm.services.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">Please select or add at least one service</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label htmlFor="date" className={`font-semibold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={bookingForm.date}
                    onChange={handleBookingChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e1b382] transition-all ${
                      theme === "dark" ? "bg-[#12343b]/80 border-[#e1b382]/30 text-gray-200" : "bg-white border-gray-200 text-gray-800"
                    }`}
                    required
                    aria-label="Select booking date"
                  />
                  {bookingForm.date && getAppointmentsForDate(bookingForm.date) >= MAX_APPOINTMENTS_PER_DAY && (
                    <p className="text-red-500 text-sm mt-2">This date is fully booked (max {MAX_APPOINTMENTS_PER_DAY} appointments)</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label htmlFor="time" className={`font-semibold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={bookingForm.time}
                    onChange={handleBookingChange}
                    className={`p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e1b382] transition-all ${
                      theme === "dark" ? "bg-[#12343b]/80 border-[#e1b382]/30 text-gray-200" : "bg-white border-gray-200 text-gray-800"
                    }`}
                    required
                    aria-label="Select booking time"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="number" className={`font-semibold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                    Vehicle Number
                  </label>
                  <select
                    id="number"
                    name="number"
                    value={bookingForm.number}
                    onChange={handleBookingChange}
                    className={`p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e1b382] transition-all ${
                      theme === "dark" ? "bg-[#12343b]/80 border-[#e1b382]/30 text-gray-200" : "bg-white border-gray-200 text-gray-800"
                    }`}
                    required
                    aria-label="Select vehicle number"
                  >
                    <option value="">Select Vehicle Number</option>
                    {vehicles.current.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle.number}>
                        {vehicle.number} ({vehicle.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="phone" className={`font-semibold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={bookingForm.phone}
                      onChange={handleBookingChange}
                      placeholder="e.g., 9876543210"
                      className={`w-full pl-10 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e1b382] transition-all ${
                        theme === "dark" ? "bg-[#12343b]/80 border-[#e1b382]/30 text-gray-200" : "bg-white border-gray-200 text-gray-800"
                      } ${phoneError ? "border-red-500" : ""}`}
                      required
                      aria-label="Enter phone number"
                    />
                  </div>
                  {phoneError && <p className="text-red-500 text-sm mt-2" role="alert">{phoneError}</p>}
                </div>
                <div className="flex flex-col">
                  <label className={`font-semibold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>Service Option</label>
                  <div className="mt-1 flex flex-col space-y-3">
                    {["Home Service", "Pick Up & Delivery", "On-Spot Service"].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="serviceOption"
                          value={option}
                          checked={bookingForm.serviceOption === option}
                          onChange={handleBookingChange}
                          className="mr-2 h-4 w-4 text-[#e1b382] border-gray-300 focus:ring-[#e1b382]"
                          aria-label={`Select ${option} service option`}
                        />
                        <span className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-[#e1b382]/30">
                  <motion.button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className={`px-5 py-2 rounded-lg font-semibold transition shadow-md ${
                      theme === "dark" ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    aria-label="Cancel booking"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    disabled={phoneError || (bookingForm.date && getAppointmentsForDate(bookingForm.date) >= MAX_APPOINTMENTS_PER_DAY)}
                    aria-label="Submit booking"
                  >
                    Book
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ServicesSection = ({ setBookingFormOpen }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const mainCategories = Object.keys(services.categories).map(category => ({
    title: category,
    icon: services.categories[category][0].icon,
  }));

  const filteredCategories = mainCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = (service) => {
    if (service) {
      navigate(`/dashboard?services=${encodeURIComponent(service.title)}`);
    } else if (selectedCategory) {
      const categoryServices = services.categories[selectedCategory].map(s => s.title);
      navigate(`/dashboard?services=${encodeURIComponent(categoryServices.join(","))}`);
    }
    setSelectedService(null);
  };

  return (
    <motion.section
      ref={ref}
      className={`mx-auto px-6 py-24 ${theme === "dark" ? "bg-gradient-to-b from-[#12343b]/50 to-[#2d545e]/50" : "bg-gradient-to-b from-gray-100 to-white"}`}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
    >
      <motion.h2
        className={`text-5xl font-extrabold mb-8 text-center tracking-wider ${theme === "dark" ? "text-[#e1b382]" : "text-[#2d545e]"}`}
        initial={{ opacity: 0, y: -60 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Elite Services</span>
      </motion.h2>
      <div className="max-w-3xl mx-auto mb-12 flex items-center gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-[#e1b382] text-gray-700 ${
              theme === "dark" ? "bg-[#2d545e]/80 border-[#e1b382]/50" : "bg-white border-[#e1b382]/50"
            }`}
            aria-label="Search for services"
          />
        </div>
        <motion.button
          onClick={() => setBookingFormOpen(true)}
          className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-6 py-3 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open booking form"
        >
          Book Now
        </motion.button>
      </div>
      {!selectedCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredCategories.map((category, index) => (
            <ServiceCard
              key={index}
              icon={category.icon}
              title={category.title}
              onClick={() => setSelectedCategory(category.title)}
            />
          ))}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-8">
            <motion.button
              onClick={() => setSelectedCategory(null)}
              className={`font-bold text-lg hover:text-[#e1b382] transition-colors ${theme === "dark" ? "text-[#e1b382]" : "text-[#2d545e]"}`}
              whileHover={{ scale: 1.05 }}
              aria-label="Back to service categories"
            >
              ← Back to Categories
            </motion.button>
            <h3 className={`text-3xl font-bold ${theme === "dark" ? "text-[#e1b382]" : "text-[#2d545e]"}`}>{selectedCategory} Services</h3>
            <motion.button
              onClick={() => handleApply(null)}
              className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-6 py-2 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Apply for all ${selectedCategory} services`}
            >
              Apply Now
            </motion.button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.categories[selectedCategory].map((service, index) => (
              <SubServiceCard
                key={index}
                title={service.title}
                description={service.description}
                onClick={() => setSelectedService(service)}
              />
            ))}
          </div>
        </div>
      )}
      <AnimatePresence>
        {selectedService && (
          <ServiceDetailModal service={selectedService} onClose={() => setSelectedService(null)} onApply={() => handleApply(selectedService)} />
        )}
      </AnimatePresence>
    </motion.section>
  );
};

const BookingSection = ({ setBookingFormOpen }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <section className={`py-24 ${theme === "dark" ? "bg-[#12343b]/90" : "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto px-6">
        <h2 className={`text-4xl font-bold mb-8 text-center ${theme === "dark" ? "text-[#e1b382]" : "text-[#2d545e]"}`}>
          Book Your Service
        </h2>
        <div className="text-center mb-12">
          <motion.button
            onClick={() => setBookingFormOpen(true)}
            className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open booking form"
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </section>
  );
};

const LiveServiceTracker = () => {
  const { theme } = useContext(ThemeContext);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={ref}
      className={`py-16 ${theme === "dark" ? "bg-gradient-to-b from-[#2d545e]/90 to-[#12343b]/90" : "bg-[#2d545e]"} text-white`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-8 text-center">Live Service Tracker</h2>
        <p className="text-center text-lg mb-12">Monitor your vehicle’s service in real-time—know when work starts, progresses, or completes!</p>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
            hidden: {},
          }}
        >
          <motion.div
            className="text-center p-6 bg-white/10 rounded-xl shadow-lg"
            variants={stepVariants}
            transition={{ duration: 0.5 }}
          >
            <FaCar className="text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Step 1: Service Initiated</h3>
            <p className="text-sm">Our team begins working on your vehicle.</p>
          </motion.div>
          <motion.div
            className="text-center p-6 bg-white/10 rounded-xl shadow-lg"
            variants={stepVariants}
            transition={{ duration: 0.5 }}
          >
            <FaTools className="text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Step 2: In Progress</h3>
            <p className="text-sm">Repairs or maintenance are actively underway.</p>
          </motion.div>
          <motion.div
            className="text-center p-6 bg-white/10 rounded-xl shadow-lg"
            variants={stepVariants}
            transition={{ duration: 0.5 }}
          >
            <FaCheckCircle className="text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Step 3: Ready for Checkout</h3>
            <p className="text-sm">Service completed—your vehicle is ready!</p>
          </motion.div>
        </motion.div>
        <div className="text-center">
          <Link to="/live-track">
            <motion.button
              className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => clickSound.play()}
              aria-label="Track your vehicle status"
            >
              Track Your Vehicle
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const ReviewSection = () => {
  const { theme } = useContext(ThemeContext);
  const [reviews, setReviews] = useState([
    { id: 1, name: "John Doe", rating: 5, comment: "Excellent service, highly recommend!" },
    { id: 2, name: "Jane Smith", rating: 4, comment: "Quick and professional." },
    { id: 3, name: "Mike Johnson", rating: 5, comment: "Top-notch quality!" },
    { id: 4, name: "Sarah Lee", rating: 3, comment: "Good, but could improve timing." },
    { id: 5, name: "Emily Brown", rating: 5, comment: "Fantastic experience!" },
    { id: 6, name: "David Wilson", rating: 4, comment: "Reliable and efficient." },
  ]);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [error, setError] = useState("");
  const reviewContainerRef = useRef(null);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) {
      setError("Name and comment are required");
      return;
    }
    const newReviewData = { id: reviews.length + 1, ...newReview };
    setReviews([newReviewData, ...reviews]);
    setNewReview({ name: "", rating: 5, comment: "" });
    setError("");
  };

  // Auto-scroll effect
  useEffect(() => {
    const container = reviewContainerRef.current;
    if (!container) return;

    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollHeight <= clientHeight) return; // No scrolling needed if content fits

    const scroll = () => {
      if (container.scrollTop + clientHeight >= scrollHeight) {
        container.scrollTop = 0; // Reset to top
      } else {
        container.scrollTop += 1; // Scroll down by 1px
      }
    };

    const interval = setInterval(scroll, 50); // Adjust speed by changing interval (lower = faster)
    return () => clearInterval(interval);
  }, [reviews]);

  const reviewVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className={`py-16 ${theme === "dark" ? "bg-[#12343b]/90" : "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto px-6">
        <h2 className={`text-4xl font-bold mb-8 text-center ${theme === "dark" ? "text-[#e1b382]" : "text-[#2d545e]"}`}>
          Customer Reviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Auto-Scrolling Reviews */}
          <div
            ref={reviewContainerRef}
            className={`max-h-96 overflow-y-hidden rounded-xl shadow-md p-4 ${theme === "dark" ? "bg-[#2d545e]/80" : "bg-white"}`}
            style={{ scrollBehavior: "smooth" }}
          >
            {reviews.length === 0 ? (
              <p className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>No reviews yet.</p>
            ) : (
              reviews.concat(reviews).map((review, index) => ( // Duplicate reviews for seamless looping
                <motion.div
                  key={`${review.id}-${index}`}
                  className="p-4 mb-4 border-b border-[#e1b382]/20 last:border-b-0"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.2 }}
                  variants={reviewVariants}
                  transition={{ duration: 0.5 }}
                  role="article"
                  aria-labelledby={`review-title-${review.id}-${index}`}
                >
                  <div className="flex items-center mb-2">
                    <span id={`review-title-${review.id}-${index}`} className="font-semibold mr-2">{review.name}</span>
                    <div className="flex" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < review.rating ? "text-[#e1b382]" : "text-gray-400"} />
                      ))}
                    </div>
                  </div>
                  <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>{review.comment}</p>
                </motion.div>
              ))
            )}
          </div>
          {/* Right: Review Form */}
          <div className={`p-6 rounded-xl shadow-md ${theme === "dark" ? "bg-[#2d545e]/80" : "bg-white"}`}>
            <h3 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-[#e1b382]" : "text-[#12343b]"}`}>
              Submit Your Review
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label htmlFor="review-name" className={`block mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Name
                </label>
                <input
                  id="review-name"
                  type="text"
                  name="name"
                  value={newReview.name}
                  onChange={handleReviewChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b382] ${
                    theme === "dark" ? "bg-[#12343b]/80 border-[#e1b382]/50" : "bg-gray-50 border-gray-300"
                  }`}
                  required
                  aria-label="Enter your name"
                />
              </div>
              <div>
                <label htmlFor="review-rating" className={`block mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Rating
                </label>
                <select
                  id="review-rating"
                  name="rating"
                  value={newReview.rating}
                  onChange={handleReviewChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b382] ${
                    theme === "dark" ? "bg-[#12343b]/80 border-[#e1b382]/50" : "bg-gray-50 border-gray-300"
                  }`}
                  aria-label="Select your rating"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>{num} Star{num > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="review-comment" className={`block mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Comment
                </label>
                <textarea
                  id="review-comment"
                  name="comment"
                  value={newReview.comment}
                  onChange={handleReviewChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b382] ${
                    theme === "dark" ? "bg-[#12343b]/80 border-[#e1b382]/50" : "bg-gray-50 border-gray-300"
                  }`}
                  rows="4"
                  required
                  aria-label="Enter your review comment"
                />
              </div>
              {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-6 py-3 rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Submit your review"
              >
                Submit Review
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const ActionButtons = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { theme } = useContext(ThemeContext);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    clickSound.play();
  };
  const toggleContact = () => {
    setIsContactOpen(!isContactOpen);
    clickSound.play();
  };

  const buttonVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  const contactPopupVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 sm:bottom-10 right-6 sm:right-10 z-50 flex items-center gap-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
      >
        <div className="relative group">
          <motion.button
            className={`bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] rounded-full p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              theme === "dark" ? "bg-gradient-to-r from-[#c89666] to-[#e1b382]" : ""
            }`}
            whileHover={{ scale: 1.15, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleExpand}
            aria-label={isExpanded ? "Collapse action buttons" : "Expand action buttons"}
          >
            {isExpanded ? <FaArrowRight size={20} /> : <FaArrowLeft size={20} />}
          </motion.button>
          <span className="absolute bottom-full mb-2 hidden group-hover:block bg-[#12343b]/90 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {isExpanded ? "Hide Actions" : "Show Actions"}
          </span>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex gap-4"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: { transition: { staggerChildren: 0.05 } },
              }}
            >
              <div className="relative group">
                <motion.button
                  variants={buttonVariants}
                  className={`bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] rounded-full p-4 sm:p-5 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                    theme === "dark" ? "bg-gradient-to-r from-[#c89666] to-[#e1b382]" : ""
                  }`}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleContact}
                  aria-label="Open contact information"
                >
                  <FaPhoneAlt size={20} />
                </motion.button>
                <span className="absolute bottom-full mb-2 hidden group-hover:block bg-[#12343b]/90 text-white text-xs rounded py-1 px-2">
                  Contact Us
                </span>
              </div>

              <div className="relative group">
                <motion.div variants={buttonVariants}>
                  <Link
                    to="/services"
                    className={`bg-gradient-to-r from-[#2d545e] to-[#12343b] text-[#e1b382] rounded-full p-4 sm:p-5 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center ${
                      theme === "dark" ? "bg-gradient-to-r from-[#12343b] to-[#2d545e]" : ""
                    }`}
                    aria-label="Book your service"
                    onClick={() => clickSound.play()}
                  >
                    <FaCalendarAlt size={20} />
                  </Link>
                </motion.div>
                <span className="absolute bottom-full mb-2 hidden group-hover:block bg-[#12343b]/90 text-white text-xs rounded py-1 px-2">
                  Book Now
                </span>
              </div>

              <div className="relative group">
                <motion.div variants={buttonVariants}>
                  <Link
                    to="/ai-recommender"
                    className={`bg-gradient-to-r from-[#c89666] to-[#e1b382] text-[#12343b] rounded-full p-4 sm:p-5 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center ${
                      theme === "dark" ? "bg-gradient-to-r from-[#e1b382] to-[#c89666]" : ""
                    }`}
                    aria-label="Go to AI Recommender"
                    onClick={() => clickSound.play()}
                  >
                    <FaRobot size={20} />
                  </Link>
                </motion.div>
                <span className="absolute bottom-full mb-2 hidden group-hover:block bg-[#12343b]/90 text-white text-xs rounded py-1 px-2">
                  AI Recommender
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isContactOpen && (
          <motion.div
            className={`fixed bottom-24 sm:bottom-28 right-6 sm:right-10 rounded-xl shadow-2xl p-6 w-72 sm:w-80 z-50 border ${
              theme === "dark" ? "bg-[#2d545e]/95 border-[#e1b382]/50" : "bg-[#12343b]/95 border-[#e1b382]/30"
            } backdrop-blur-md`}
            variants={contactPopupVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-popup-title"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id="contact-popup-title" className="text-lg font-bold text-[#e1b382]">Contact Us</h3>
              <button
                className="text-[#e1b382] hover:text-[#c89666] transition-colors"
                onClick={toggleContact}
                aria-label="Close contact popup"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FaPhoneAlt className="text-[#e1b382]" size={18} />
                <a href="tel:+1234567890" className="text-[#c89666] hover:text-[#e1b382] transition-colors" aria-label="Call us at +1 (234) 567-890">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-[#e1b382]" size={18} />
                <a href="mailto:support@friendscarcare.com" className="text-[#c89666] hover:text-[#e1b382] transition-colors" aria-label="Email us at support@friendscarcare.com">
                  support@friendscarcare.com
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ServicesPage = ({ cart = [], user, setUser }) => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const vehicles = { current: [] };
  const [appointments, setAppointments] = useState([]);

  return (
    <div className={`relative overflow-hidden ${theme === "dark" ? "bg-[#12343b]/90" : "bg-gray-50"}`}>
      <motion.div
        className={`absolute inset-0 pointer-events-none z-0 ${
          theme === "dark" ? "bg-gradient-to-b from-[#2d545e]/20 to-[#12343b]/20" : "bg-gradient-to-b from-[#2d545e]/10 to-transparent"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5 }}
      />
      <ServicesSection setBookingFormOpen={setIsBookingFormOpen} />
      <BookingSection setBookingFormOpen={setIsBookingFormOpen} />
      <BookingForm
        isOpen={isBookingFormOpen}
        setIsOpen={setIsBookingFormOpen}
        user={user}
        theme={theme}
        navigate={navigate}
        vehicles={vehicles}
        appointments={appointments}
        setAppointments={setAppointments}
      />
      <LiveServiceTracker />
      <ReviewSection />
      <ActionButtons />
    </div>
  );
};

export default ServicesPage;