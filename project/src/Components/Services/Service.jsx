import { motion, AnimatePresence } from "framer-motion";
import {
  FaWrench, FaCar, FaTachometerAlt, FaBatteryHalf, FaOilCan, FaTools, FaWind, FaPaintRoller,
  FaShieldAlt, FaCogs, FaSnowflake, FaCarSide, FaCheckCircle, FaSoap, FaWater, FaSprayCan,
  FaSearch, FaTimes, FaCalendarAlt, FaPhoneAlt, FaCarCrash
} from "react-icons/fa";
import { useState, useContext, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { services, allServices } from "../../data/services";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ServiceCard = ({ icon, title, onClick }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="bg-gradient-to-br from-white/90 to-gray-100/80 p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[#e1b382]/50 cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      onClick={onClick}
    >
      <div className="text-4xl mb-3 text-[#2d545e]">{icon}</div>
      <h3 className="text-lg font-bold text-[#12343b] tracking-tight">{title}</h3>
    </motion.div>
  );
};

const SubServiceCard = ({ title, description, onClick }) => (
  <div
    className="bg-gradient-to-br from-white/90 to-gray-100/80 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#e1b382]/50 cursor-pointer"
    onClick={onClick}
  >
    <h3 className="text-lg font-bold mb-2 text-[#12343b] tracking-tight">{title}</h3>
    <p className="text-gray-700 text-xs leading-relaxed">{description}</p>
  </div>
);

const ServiceDetailModal = ({ service, onClose, onApply }) => (
  <motion.div
    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4 relative"
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50 }}
      transition={{ duration: 0.5 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="absolute top-4 right-4 text-gray-600 hover:text-[#e1b382]" onClick={onClose}>
        <FaTimes className="text-2xl" />
      </button>
      <h3 className="text-2xl font-extrabold mb-4 text-[#12343b] text-center">{service.title}</h3>
      <p className="text-gray-700 mb-6 text-base leading-relaxed">{service.fullDescription}</p>
      <ul className="list-disc list-inside text-gray-700 mb-6">
        {service.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
      <motion.button
        onClick={onApply}
        className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-6 py-3 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 w-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Apply Now
      </motion.button>
    </motion.div>
  </motion.div>
);

const ServicesSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

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
      className="mx-auto px-6 py-24 bg-gradient-to-b from-gray-100 to-white"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
    >
      <motion.h2 className="text-5xl font-extrabold mb-8 text-center text-[#2d545e] tracking-wider" initial={{ opacity: 0, y: -60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay: 0.2 }}>
        Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Elite Services</span>
      </motion.h2>
      <div className="max-w-md mx-auto mb-12">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382] text-gray-700"
          />
        </div>
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
              className="text-[#2d545e] font-bold text-lg hover:text-[#e1b382] transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              ← Back to Categories
            </motion.button>
            <h3 className="text-3xl font-bold text-[#2d545e]">{selectedCategory} Services</h3>
            <motion.button
              onClick={() => handleApply(null)}
              className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-6 py-2 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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

const LiveServiceTracker = () => (
  <section className="py-16 bg-[#2d545e] text-white">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-4xl font-bold mb-8 text-center">Live Service Tracker</h2>
      <p className="text-center text-lg mb-12">Track your vehicle’s service progress in real-time.</p>
      <div className="bg-white/10 p-6 rounded-xl text-center">
        <p>Coming Soon: Real-time updates on your service status!</p>
      </div>
    </div>
  </section>
);

const BookingSection = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
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
    const fetchVehicles = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${API_URL}/vehicles`, { withCredentials: true });
        setVehicles(response.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error.response || error);
        setError(error.response?.data?.message || "Failed to fetch vehicles");
      }
    };
    if (user) fetchVehicles();
  }, [user]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${API_URL}/appointments`, { withCredentials: true });
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error.response || error);
        setError(error.response?.data?.message || "Failed to fetch appointments");
      }
    };
    if (user) fetchAppointments();
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
      setBookingForm({ ...bookingForm, [name]: value });
      if (name === "phone") {
        if (!phoneRegex.test(value)) {
          setPhoneError("Phone number must be in format: 9876543210 or +919876543210");
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
      setIsBookingFormOpen(false);
      setError("");
      setPhoneError("");
      setSearchTerm("");
      setCustomService("");
      navigate("/dashboard"); // Redirect to dashboard after booking
    } catch (error) {
      console.error("Error booking service:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to book service");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredServices = allServices.filter((service) =>
    service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-8 text-center text-[#2d545e]">Book Your Service</h2>
        <div className="text-center mb-12">
          <motion.button
            onClick={() => setIsBookingFormOpen(true)}
            className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Now
          </motion.button>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">{error}</div>
        )}
      </div>
      <AnimatePresence>
        {isBookingFormOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto"
            initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            animate={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsBookingFormOpen(false)}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-[#12343b] mb-6">Book Your Service</h3>
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="flex flex-col">
                  <label className="text-gray-700 font-semibold mb-2">Services</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search services..."
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b382] bg-gray-50"
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
                            checked={bookingForm.services.includes(service)}
                            onChange={handleBookingChange}
                            className="h-4 w-4 text-[#e1b382] border-gray-300 rounded focus:ring-[#e1b382]"
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
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b382] bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={addCustomService}
                      className="px-4 py-2 bg-[#e1b382] text-[#12343b] rounded-lg hover:bg-[#c89666] transition"
                    >
                      Add
                    </button>
                  </div>
                  {bookingForm.services.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {bookingForm.services.map((service) => (
                        <span
                          key={service}
                          className="inline-flex items-center px-3 py-1 bg-[#e1b382]/20 text-[#12343b] text-sm rounded-full"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() =>
                              setBookingForm((prev) => ({
                                ...prev,
                                services: prev.services.filter((s) => s !== service),
                              }))
                            }
                            className="ml-2 text-[#12343b] hover:text-[#c89666] focus:outline-none"
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
                  <label htmlFor="date" className="text-gray-700 font-semibold mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={bookingForm.date}
                    onChange={handleBookingChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b382] bg-gray-50"
                    required
                  />
                  {bookingForm.date &&
                    getAppointmentsForDate(bookingForm.date) >= MAX_APPOINTMENTS_PER_DAY && (
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
                    value={bookingForm.time}
                    onChange={handleBookingChange}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b382] bg-gray-50"
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
                    value={bookingForm.number}
                    onChange={handleBookingChange}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b382] bg-gray-50"
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
                      value={bookingForm.phone}
                      onChange={handleBookingChange}
                      placeholder="e.g., 9876543210"
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e1b382] bg-gray-50 ${
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
                          checked={bookingForm.serviceOption === option}
                          onChange={handleBookingChange}
                          className="mr-2 h-4 w-4 text-[#e1b382] border-gray-300 focus:ring-[#e1b382]"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsBookingFormOpen(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#e1b382] text-[#12343b] rounded-lg hover:bg-[#c89666] transition font-medium"
                    disabled={
                      phoneError ||
                      (bookingForm.date &&
                        getAppointmentsForDate(bookingForm.date) >= MAX_APPOINTMENTS_PER_DAY)
                    }
                  >
                    Book
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ServicesPage = ({ cart = [], user, setUser }) => (
  <div className="relative bg-gray-50 overflow-hidden">
    <motion.div className="absolute inset-0 bg-gradient-to-b from-[#2d545e]/10 to-transparent pointer-events-none z-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} />
    <ServicesSection />
    <LiveServiceTracker />
    <BookingSection />
  </div>
);

export default ServicesPage;