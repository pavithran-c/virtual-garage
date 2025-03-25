import { motion, AnimatePresence } from "framer-motion";
import {
  FaWrench, FaCar, FaTachometerAlt, FaBatteryHalf, FaOilCan, FaTools, FaWind, FaPaintRoller,
  FaShieldAlt, FaCogs, FaSnowflake, FaCarSide, FaCheckCircle, FaSoap, FaWater, FaSprayCan,
  FaSearch, FaTimes, FaCalendarAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCarCrash
} from "react-icons/fa";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { services, allServices } from "../../data/services";
import { useNavigate } from "react-router-dom"; // Replace useRouter

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
  const navigate = useNavigate(); // Replace useRouter

  const mainCategories = Object.keys(services.categories).map(category => ({
    title: category,
    icon: services.categories[category][0].icon,
  }));

  const filteredCategories = mainCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = (service) => {
    if (service) {
      // Single service
      navigate(`/dashboard?services=${encodeURIComponent(service.title)}`);
    } else if (selectedCategory) {
      // All services in category
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

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", date: "", service: "",
    serviceOption: "Pick Up & Delivery", notes: "",
  });
  const [serviceSuggestions, setServiceSuggestions] = useState([]);

  const handleServiceChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, service: value });
    if (value.length > 0) {
      const filtered = allServices.filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setServiceSuggestions(filtered);
    } else {
      setServiceSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, service: suggestion });
    setServiceSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Booking submitted! We’ll contact you soon with details.");
    setFormData({
      name: "", email: "", phone: "", address: "", date: "", service: "",
      serviceOption: "Pick Up & Delivery", notes: "",
    });
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-8 text-center text-[#2d545e]">Book Your Service</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <FaCarCrash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-12 p-4 rounded-xl border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382]"
              required
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-12 p-4 rounded-xl border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382]"
              required
            />
          </div>
          <div className="relative">
            <FaPhoneAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="tel"
              placeholder="Your Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-12 p-4 rounded-xl border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382]"
              required
            />
          </div>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Your Address (for Home/Delivery)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full pl-12 p-4 rounded-xl border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382]"
              required={formData.serviceOption !== "On-Spot Service"}
            />
          </div>
          <div className="relative">
            <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full pl-12 p-4 rounded-xl border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382]"
              required
            />
          </div>
          <div className="relative">
            <FaWrench className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Service Needed (e.g., Engine)"
              value={formData.service}
              onChange={handleServiceChange}
              className="w-full pl-12 p-4 rounded-xl border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382]"
              required
            />
            {serviceSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-[#e1b382]/50 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-lg">
                {serviceSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-2 text-gray-700 hover:bg-[#e1b382]/20 cursor-pointer"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-[#2d545e] font-bold mb-2">Service Option</label>
            <div className="flex gap-4">
              {["Pick Up & Delivery", "On-Spot Service", "Home Service"].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="serviceOption"
                    value={option}
                    checked={formData.serviceOption === option}
                    onChange={(e) => setFormData({ ...formData, serviceOption: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <textarea
              placeholder="Additional Notes (e.g., specific issues)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-4 rounded-xl border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382] h-32"
            />
          </div>
          <motion.button
            type="submit"
            className="md:col-span-2 bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Now
          </motion.button>
        </form>
      </div>
    </section>
  );
};

const ServicesPage = ({ cart = [], user, setUser }) => (
  <div className="relative bg-gray-50 overflow-hidden">
    <motion.div className="absolute inset-0 bg-gradient-to-b from-[#2d545e]/10 to-transparent pointer-events-none z-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} />
    <ServicesSection />
    <LiveServiceTracker />
    <BookingForm />
  </div>
);

export default ServicesPage;