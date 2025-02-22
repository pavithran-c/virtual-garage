"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaTools, FaCar, FaClock, FaSearch, FaShieldAlt, FaStar, FaPhoneAlt, FaMapMarkerAlt, 
  FaCheckCircle, FaCogs, FaSoap, FaWater, FaSnowflake
} from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Navbar from "../Navbar/Navbar";
// Service Result Card Component
const ServiceResultCard = ({ icon, title, description, price, rating, delay }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="relative bg-gradient-to-br from-white/90 to-gray-100/80 p-8 rounded-2xl shadow-xl hover:shadow-[0_20px_50px_rgba(225,179,130,0.3)] transition-all duration-500 border border-[#e1b382]/50 backdrop-blur-md overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      whileHover={{
        scale: 1.05,
        background: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(225, 179, 130, 0.2))",
        boxShadow: "0 25px 60px rgba(200, 150, 102, 0.4)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 right-0 bg-gradient-to-r from-[#e1b382] to-[#c89666] text-white px-4 py-1 rounded-bl-xl text-sm font-semibold z-10">
        {[...Array(rating)].map((_, i) => (
          <FaStar key={i} className="inline mr-1" />
        ))}
      </div>
      <div className="text-5xl mb-6 text-[#2d545e] animate-pulse relative z-10">{icon}</div>
      <h3 className="text-2xl font-extrabold mb-3 text-[#12343b] tracking-tight relative z-10">{title}</h3>
      <p className="text-gray-700 mb-4 text-sm leading-relaxed relative z-10">{description}</p>
      <p className="text-[#e1b382] font-extrabold text-xl relative z-10">₹{price}</p>
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#2d545e] to-[#e1b382]"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: delay + 0.3 }}
      />
      <div className="absolute inset-0 border-2 border-[#e1b382]/20 rounded-2xl pointer-events-none" />
    </motion.div>
  );
};

// Image Background Component with Search Functionality
const ImageBackground = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const services = [
    { icon: <FaCogs />, title: "Engine Overhaul", description: "Full engine diagnostics and rebuild.", price: "24,999", rating: 4 },
    { icon: <FaShieldAlt />, title: "Ceramic Coating", description: "Premium paint protection with shine.", price: "19,999", rating: 5 },
    { icon: <FaTools />, title: "Car Detailing", description: "Luxury interior and exterior polishing.", price: "9,999", rating: 5 },
    { icon: <FaCar />, title: "Brake System Repair", description: "Brake pad replacement and tuning.", price: "7,999", rating: 4 },
    { icon: <FaSoap />, title: "Basic Wash", description: "Quick exterior wash and dry.", price: "499", rating: 4 },
    { icon: <FaWater />, title: "Premium Wash", description: "Deep clean with wax finish.", price: "999", rating: 5 },
    { icon: <FaTools />, title: "Wheel Alignment", description: "Precision alignment for smooth rides.", price: "3,499", rating: 4 },
    { icon: <FaSnowflake />, title: "AC Servicing", description: "Complete AC gas refill and repair.", price: "6,999", rating: 5 }
  ];

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
    } else {
      const filtered = services.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery]);

  return (
    <div className="relative min-h-[120vh] overflow-hidden mt-[-5rem]"> {/* Added mt-[-5rem] to offset the padding */}
      <img
        src="../../../public/images/background1.jpg"
        alt="Car Care Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(50%) blur(2px)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d545e]/50 to-[#12343b]/70 flex flex-col items-center justify-center">
        <motion.div
          className="text-center z-10 px-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring", stiffness: 80 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#e1b382] mb-4 tracking-wider">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">FRIENDS CAR CARE</span>
          </h1>
          <p className="text-xl md:text-3xl text-white mb-8 leading-relaxed">
            Experience Unrivaled Luxury in Car Maintenance <br /> Available 24/7
          </p>
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for Premium Services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-6 py-4 rounded-l-xl bg-white/10 text-white border border-[#e1b382] focus:outline-none focus:ring-4 focus:ring-[#c89666]/50 transition-all duration-300 w-full"
            />
            <motion.button
              className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-8 py-4 rounded-r-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSearch className="mr-2" /> Search
            </motion.button>
          </div>
          <motion.p
            className="text-sm text-white/80 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            Discover our elite services tailored for your vehicle
          </motion.p>
        </motion.div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              className="absolute top-[60%] left-0 right-0 mx-auto max-w-5xl px-6 py-8 bg-gradient-to-b from-[#12343b]/90 to-[#2d545e]/90 rounded-2xl shadow-2xl z-20 max-h-[50vh] overflow-y-auto" // Adjusted position and added scroll
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-[#e1b382] mb-6 text-center">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((service, index) => (
                  <ServiceResultCard
                    key={index}
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                    price={service.price}
                    rating={service.rating}
                    delay={index * 0.15}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="relative bg-gradient-to-br from-[#e1b382]/90 to-[#c89666]/80 p-8 rounded-2xl shadow-xl hover:shadow-[0_20px_50px_rgba(225,179,130,0.3)] transition-all duration-500 border border-[#e1b382]/50 backdrop-blur-md overflow-hidden"
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      whileHover={{
        scale: 1.05,
        background: "linear-gradient(145deg, rgba(225, 179, 130, 0.95), rgba(200, 150, 102, 0.2))",
        boxShadow: "0 25px 60px rgba(200, 150, 102, 0.4)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-6xl mb-6 text-[#12343b] animate-pulse">{icon}</div>
      <h3 className="text-2xl font-extrabold mb-3 text-[#12343b] tracking-tight">{title}</h3>
      <p className="text-[#2d545e] text-lg leading-relaxed">{description}</p>
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#2d545e] to-[#e1b382]"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: delay + 0.3 }}
      />
    </motion.div>
  );
};

// Features Section
const FeaturesSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.section
      ref={ref}
      className="container mx-auto px-6 py-24 bg-gradient-to-b from-[#c89666]/20 to-[#e1b382]/10"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
    >
      <motion.h2
        className="text-5xl font-extrabold mb-16 text-center text-[#2d545e] tracking-wider"
        initial={{ opacity: 0, y: -60 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        Discover <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Our Premium Features</span>
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <FeatureCard icon={<FaTools />} title="Expert Mechanics" description="Certified professionals delivering top-tier service." delay={0} />
        <FeatureCard icon={<FaCar />} title="On-Site Repairs" description="Luxury service brought to your doorstep." delay={0.15} />
        <FeatureCard icon={<FaClock />} title="24/7 Availability" description="Round-the-clock care for your convenience." delay={0.3} />
        <FeatureCard icon={<FaShieldAlt />} title="Premium Protection" description="Advanced coatings and warranties included." delay={0.45} />
      </div>
    </motion.section>
  );
};

// Why Choose Us Section
const WhyChooseUsSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.section
      ref={ref}
      className="bg-gradient-to-br from-[#2d545e] to-[#12343b] py-24 px-6 md:px-16 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] mx-6 my-20"
      initial={{ opacity: 0, y: 70 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1 }}
    >
      <motion.h2
        className="text-5xl font-extrabold text-center mb-12 text-[#e1b382] tracking-wider"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        Why Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">FRIENDS CAR CARE?</span>
      </motion.h2>
      <ul className="max-w-3xl mx-auto space-y-6 text-lg md:text-xl text-[#c89666]">
        {[
          "Certified and Experienced Mechanics",
          "Convenient On-Site Luxury Repairs",
          "24/7 Availability, Including Holidays",
          "Transparent Pricing with No Hidden Costs",
          "Unmatched Customer Service Excellence",
          "State-of-the-Art Diagnostic Tools",
          "Eco-Friendly Maintenance Practices"
        ].map((item, index) => (
          <motion.li
            key={index}
            className="flex items-center"
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: index * 0.2 }}
          >
            <FaCheckCircle className="text-[#e1b382] mr-3" />
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
};

// Car Brand Carousel
const CarBrandCarousel = () => {
  const carBrands = [
    "../../../public/images/toyota.png", "../../../public/images/nissan.png", "../../../public/images/ford.png", "../../../public/images/audi.png",
    "../../../public/images/Benz.png", "../../../public/images/Mahindra.png", "../../../public/images/hyundai.png", "../../../public/images/bmw.png"
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: "linear",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } }
    ],
    arrows: false,
  };

  return (
    <motion.section
      className="py-24 bg-gradient-to-b from-[#12343b]/10 to-transparent"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <motion.h2
        className="text-5xl font-extrabold text-center mb-16 text-[#2d545e] tracking-wider"
        initial={{ opacity: 0, y: -60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Premium Multi-Brand <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Car Repair Service</span>
      </motion.h2>
      <Slider {...settings}>
        {carBrands.map((brand, index) => (
          <div key={index} className="px-4">
            <motion.div
              className="p-6 rounded-2xl bg-white/95 border border-[#e1b382]/30 shadow-lg hover:shadow-2xl transition-all duration-500"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={brand}
                alt={`Brand ${index + 1}`}
                className="h-20 object-contain grayscale hover:grayscale-0 transition duration-500"
              />
            </motion.div>
          </div>
        ))}
      </Slider>
    </motion.section>
  );
};

// Request Appointment Form
const RequestAppointmentForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", date: "", time: "", service: "", message: "" });
  const [appointmentStatus, setAppointmentStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAppointmentStatus("Pending Confirmation");
    setTimeout(() => {
      setAppointmentStatus("Confirmed! We'll contact you soon.");
      setFormData({ name: "", email: "", date: "", time: "", service: "", message: "" });
    }, 2000);
  };

  useEffect(() => {
    flatpickr(".flatpickr-date", { minDate: "today", dateFormat: "Y-m-d" });
    flatpickr(".flatpickr-time", { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true });
  }, []);

  return (
    <motion.section
      className="bg-gradient-to-br from-[#2d545e] to-[#12343b] py-24 px-6 md:px-16 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] mx-6 my-20"
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <motion.h2
        className="text-5xl font-extrabold text-center mb-12 text-[#e1b382] tracking-wider"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Schedule Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Luxury Service</span>
      </motion.h2>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
        {["name", "email", "date", "time", "service", "message"].map((field, index) => (
          <motion.div
            key={field}
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            {field === "service" ? (
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-5 py-4 rounded-xl bg-white/10 text-white border border-[#e1b382] focus:outline-none focus:ring-4 focus:ring-[#c89666]/50 transition-all duration-300"
                required
              >
                <option value="" disabled className="text-gray-400">Select a Service</option>
                {["Engine Overhaul", "Ceramic Coating", "Car Detailing", "Brake Repair", "Basic Wash", "Premium Wash"].map((service) => (
                  <option key={service} value={service} className="text-gray-800">{service}</option>
                ))}
              </select>
            ) : field === "message" ? (
              <textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-5 py-4 rounded-xl bg-white/10 text-white border border-[#e1b382] focus:outline-none focus:ring-4 focus:ring-[#c89666]/50 transition-all duration-300 h-32"
                required
              />
            ) : (
              <input
                type={field === "email" ? "email" : field === "date" ? "text" : field === "time" ? "text" : "text"}
                placeholder={`Your ${field.charAt(0).toUpperCase() + field.slice(1)}${field === "date" ? " (YYYY-MM-DD)" : field === "time" ? " (HH:MM)" : ""}`}
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className={`w-full px-5 py-4 rounded-xl bg-white/10 text-white border border-[#e1b382] focus:outline-none focus:ring-4 focus:ring-[#c89666]/50 transition-all duration-300 ${field === "date" ? "flatpickr-date" : field === "time" ? "flatpickr-time" : ""}`}
                required
              />
            )}
          </motion.div>
        ))}
        <motion.button
          type="submit"
          className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-10 py-4 rounded-xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full"
          whileHover={{ scale: 1.08, boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.2)" }}
          whileTap={{ scale: 0.95 }}
        >
          Book Now
        </motion.button>
      </form>
      {appointmentStatus && (
        <motion.div
          className="mt-6 text-center text-[#e1b382] font-semibold text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaCheckCircle className="inline mr-2" /> {appointmentStatus}
        </motion.div>
      )}
    </motion.section>
  );
};

// Location Section
const LocationSection = () => (
  <motion.section
    className="py-24 bg-gradient-to-b from-[#12343b]/10 to-transparent"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 1 }}
    viewport={{ once: true }}
  >
    <motion.h2
      className="text-5xl font-extrabold text-center mb-16 text-[#2d545e] tracking-wider"
      initial={{ opacity: 0, y: -60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2 }}
      viewport={{ once: true }}
    >
      Visit Us at <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">FRIENDS CAR CARE</span>
    </motion.h2>
    <motion.div
      className="w-full h-[400px] md:h-[500px] rounded-2xl shadow-xl overflow-hidden border border-[#e1b382]/30"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.4 }}
      viewport={{ once: true }}
    >
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2176.9932972018332!2d77.87283525015197!3d11.494286915736716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba95e3e310837d7%3A0x530acf67217dbdb0!2sFriends%20Car%20Care!5e0!3m2!1sen!2sin!4v1740113635595!5m2!1sen!2sin"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      />
    </motion.div>
  </motion.section>
);

// Live Chat
const LiveChat = () => (
  <motion.div
    className="fixed bottom-8 right-8 bg-gradient-to-r from-[#e1b382] to-[#c89666] rounded-full p-5 shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] z-50"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ duration: 0.6, delay: 1.5 }}
    whileHover={{ scale: 1.15, rotate: 10 }}
  >
    <a href="#" className="text-[#12343b] text-3xl">
      <FaPhoneAlt />
    </a>
  </motion.div>
);

// HomePage Component
const HomePage = () => (
  <div className="relative bg-gray-50 overflow-hidden">
    <motion.div
      className="absolute inset-0 bg-gradient-to-b from-[#2d545e]/10 to-transparent pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5 }}
    />
    <ImageBackground />
    <FeaturesSection />
    <WhyChooseUsSection />
    <CarBrandCarousel />
    <RequestAppointmentForm />
    <LocationSection />
    <LiveChat />
  </div>
);

export default HomePage;