"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaTools, FaCar, FaClock, FaSearch, FaStar, FaPhoneAlt, FaMapMarkerAlt, 
  FaCheckCircle, FaCogs, FaSoap, FaWater, FaSnowflake, FaHome, FaMoneyBillWave,
  FaCarSide, FaCalendarAlt, FaWrench, FaRobot, FaEnvelope, FaTimes, FaArrowLeft, FaArrowRight
} from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import { useState, useEffect, useContext } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { services } from "../../data/services"; // Import shared services
import { Link } from "react-router-dom";
import { Howl } from "howler";
import { ThemeContext } from "../../Components/ThemeContext"; // Import ThemeContext

// Sound effect for button clicks
const clickSound = new Howl({
  src: ["/sounds/click.mp3"], // You'll need to add a click.mp3 file in public/sounds/
  volume: 0.5,
});

// Service Result Card Component
const ServiceResultCard = ({ icon, title, description, delay }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="bg-gradient-to-br from-white/90 to-gray-100/80 dark:from-[#2d545e]/90 dark:to-[#12343b]/80 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-500 border border-[#e1b382]/50 backdrop-blur-md cursor-pointer w-full sm:w-[280px] md:w-[300px]"
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-2xl mb-2 text-[#2d545e] dark:text-[#e1b382]">{icon}</div>
      <h3 className="text-md font-bold mb-1 text-[#12343b] dark:text-[#e1b382]">{title}</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-2 text-xs">{description}</p>
      <Link
        to="/services"
        className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] dark:text-[#12343b] px-4 py-2 rounded-md font-bold text-sm hover:shadow-md transition-all duration-300 inline-block"
      >
        Apply Now
      </Link>
    </motion.div>
  );
};

// Image Background Component with Scrollable Search Results
const ImageBackground = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { theme } = useContext(ThemeContext);

  const allServices = Object.values(services.categories).flat();

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
    } else {
      const filtered = allServices.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery]);

  return (
    <div className={`relative min-h-screen overflow-hidden ${theme === "dark" ? "bg-gradient-to-b from-[#2d545e]/70 to-[#12343b]/90" : "bg-gradient-to-b from-[#2d545e]/50 to-[#12343b]/70"} pt-20`}>
      <img
        src="/images/background1.jpg"
        alt="Car Care Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: theme === "dark" ? "brightness(30%) blur(2px)" : "brightness(50%) blur(2px)" }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-8">
        <div className="flex flex-col items-center w-full max-w-4xl text-center">
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-[#e1b382] mb-6 tracking-wider whitespace-nowrap"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, type: "spring", stiffness: 80 }}
          >
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">FRIENDS CAR CARE</span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl md:text-2xl xl:text-3xl text-white mb-2 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
          >
            Experience Unrivaled Luxury in Car Maintenance
          </motion.p>
          <motion.p
            className="text-md sm:text-lg md:text-xl xl:text-2xl text-white mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
          >
            Available 24/7
          </motion.p>
        </div>

        <div className="relative flex items-center justify-center w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto mb-12">
          <input
            type="text"
            placeholder="Search for Premium Services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-l-xl ${theme === "dark" ? "bg-[#12343b]/50 text-white" : "bg-white/10 text-white"} border border-[#e1b382] focus:outline-none focus:ring-4 focus:ring-[#c89666]/50 transition-all duration-300 text-sm sm:text-base`}
          />
          <motion.button
            className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-r-xl font-bold text-sm sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => clickSound.play()}
          >
            <FaSearch className="mr-1 sm:mr-2" /> Search
          </motion.button>
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              className={`w-full max-w-4xl mx-auto px-4 sm:px-6 ${theme === "dark" ? "bg-[#12343b]/95" : "bg-[#12343b]/90"} rounded-2xl shadow-2xl z-20`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-[#e1b382] py-4 text-center">Search Results</h3>
              <div className="max-h-[300px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center px-4 pb-6">
                {searchResults.map((service, index) => (
                  <ServiceResultCard
                    key={index}
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
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

// Dashboard Section
const DashboardSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [counts, setCounts] = useState({ employees: 0, cars: 0, appointments: 0 });
  const { theme } = useContext(ThemeContext);

  const stats = [
    { icon: <FaTools />, label: "Employees Working", value: 25, key: "employees" },
    { icon: <FaCar />, label: "Cars Serviced", value: 1500, key: "cars" },
    { icon: <FaCalendarAlt />, label: "Appointments Booked", value: 2000, key: "appointments" },
  ];

  useEffect(() => {
    if (inView) {
      stats.forEach((stat) => {
        let start = 0;
        const end = stat.value;
        const duration = 2000;
        const increment = end / (duration / 60);

        const counter = setInterval(() => {
          start += increment;
          if (start >= end) {
            start = end;
            clearInterval(counter);
          }
          setCounts((prev) => ({
            ...prev,
            [stat.key]: Math.floor(start),
          }));
        }, 16);

        return () => clearInterval(counter);
      });
    }
  }, [inView]);

  return (
    <motion.section
      ref={ref}
      className={`py-12 sm:py-16 md:py-24 ${theme === "dark" ? "bg-gradient-to-b from-[#12343b]/50 to-[#2d545e]/50" : "bg-gradient-to-b from-[#e1b382]/10 to-transparent"}`}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
    >
      <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-8 sm:mb-12 md:mb-16 ${theme === "dark" ? "text-[#e1b382]" : "text-[#2d545e]"} tracking-wider`}>
        Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Achievements</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 max-w-5xl mx-auto px-4 sm:px-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className={`p-6 sm:p-8 rounded-xl shadow-lg text-center ${theme === "dark" ? "bg-[#2d545e]/80" : "bg-white"}`}
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: index * 0.2 }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl text-[#e1b382] mb-4">{stat.icon}</div>
            <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-[#e1b382]" : "text-[#12343b]"}`}>
              {counts[stat.key].toLocaleString()}{stat.key !== "employees" ? "+" : ""}
            </p>
            <p className={`text-sm sm:text-base ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const { theme } = useContext(ThemeContext);

  return (
    <motion.div
      ref={ref}
      className={`p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-[#e1b382]/50 backdrop-blur-md w-full ${theme === "dark" ? "bg-gradient-to-br from-[#2d545e]/90 to-[#12343b]/80" : "bg-gradient-to-br from-[#e1b382]/90 to-[#c89666]/80"}`}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 ${theme === "dark" ? "text-[#e1b382]" : "text-[#12343b]"}`}>{icon}</div>
      <h3 className={`text-xl sm:text-2xl font-extrabold mb-2 sm:mb-3 ${theme === "dark" ? "text-[#e1b382]" : "text-[#12343b]"} tracking-tight`}>{title}</h3>
      <p className={`text-sm sm:text-lg leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-[#2d545e]"}`}>{description}</p>
    </motion.div>
  );
};

// Features Section
const FeaturesSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const { theme } = useContext(ThemeContext);

  return (
    <motion.section
      ref={ref}
      className={`mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 ${theme === "dark" ? "bg-gradient-to-b from-[#12343b]/50 to-[#2d545e]/50" : "bg-gradient-to-b from-[#c89666]/20 to-[#e1b382]/10"}`}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
    >
      <motion.h2
        className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-12 md:mb-16 text-center ${theme === "dark" ? "text-[#e1b382]" : "text-[#2d545e]"} tracking-wider`}
        initial={{ opacity: 0, y: -60 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        Discover <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Our Premium Features</span>
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
        <FeatureCard icon={<FaTools />} title="Expert Mechanics" description="Certified professionals delivering top-tier service." delay={0} />
        <FeatureCard icon={<FaHome />} title="Service at Your Home or Office" description="Luxury service brought to your doorstep." delay={0.15} />
        <FeatureCard icon={<FaClock />} title="24/7 Availability" description="Round-the-clock care for your convenience." delay={0.3} />
        <FeatureCard icon={<FaMoneyBillWave />} title="Fair and Transparent Pricing" description="No hidden costs, just honest quotes." delay={0.45} />
      </div>
    </motion.section>
  );
};

// Why Choose Us Section
const WhyChooseUsSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const { theme } = useContext(ThemeContext);

  return (
    <motion.section
      ref={ref}
      className={`py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-16 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] mx-4 sm:mx-6 my-12 sm:my-20 ${theme === "dark" ? "bg-gradient-to-br from-[#12343b]/90 to-[#2d545e]/90" : "bg-gradient-to-br from-[#2d545e] to-[#12343b]"}`}
      initial={{ opacity: 0, y: 70 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1 }}
    >
      <motion.h2
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-8 sm:mb-12 text-[#e1b382] tracking-wider"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        Why Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">FRIENDS CAR CARE?</span>
      </motion.h2>
      <ul className="max-w-3xl mx-auto space-y-4 sm:space-y-6 text-base sm:text-lg md:text-xl text-[#c89666]">
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
            <FaCheckCircle className="text-[#e1b382] mr-2 sm:mr-3" />
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
};

// Car Brand Carousel
const CarBrandCarousel = () => {
  const { theme } = useContext(ThemeContext);

  const carBrands = [
    { name: "Toyota", logo: "/images/toyota.png" },
    { name: "Maruti Suzuki", logo: "/images/MARUTI.png" },
    { name: "Hyundai", logo: "/images/hyundai.png" },
    { name: "Mahindra", logo: "/images/Mahindra.png" },
    { name: "Ford", logo: "/images/ford.png" },
    { name: "Volkswagen", logo: "/images/volkswagen.png" },
    { name: "Renault", logo: "/images/Renault.png" },
    { name: "Nissan", logo: "/images/nissan.png" },
    { name: "BMW", logo: "/images/bmw.png" },
    { name: "Mercedes-Benz", logo: "/images/Benz.png" },
    { name: "Audi", logo: "/images/audi.png" },
    { name: "Kia", logo: "/images/Kia.png" },
    { name: "MG", logo: "/images/mg.png" },
    { name: "Skoda", logo: "/images/skoda.png" },
    { name: "Tata", logo: "/images/tata.png" },
    { name: "Honda", logo: "/images/honda.png" },
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
      className={`py-12 sm:py-16 md:py-24 ${theme === "dark" ? "bg-gradient-to-b from-[#2d545e]/50 to-[#12343b]/50" : "bg-gradient-to-b from-[#12343b]/10 to-transparent"}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <motion.h2
        className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-8 sm:mb-12 md:mb-16 ${theme === "dark" ? "text-[#e1b382]" : "text-[#2d545e]"} tracking-wider`}
        initial={{ opacity: 0, y: -60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Premium Multi-Brand <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Car Repair Service</span>
      </motion.h2>
      <Slider {...settings} className="px-4">
        {carBrands.map((brand, index) => (
          <div key={index} className="px-2 sm:px-4 text-center">
            <img
              src={brand.logo}
              alt={brand.name}
              className={`h-12 sm:h-16 object-contain mx-auto ${theme === "dark" ? "filter brightness-150" : "grayscale hover:grayscale-0"} transition duration-500`}
            />
            <p className={`mt-2 font-semibold text-sm sm:text-base ${theme === "dark" ? "text-[#e1b382]" : "text-[#12343b]"}`}>{brand.name}</p>
          </div>
        ))}
      </Slider>
    </motion.section>
  );
};

// How to Book Appointment Section
const HowToBookSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const { theme } = useContext(ThemeContext);

  const steps = [
    {
      icon: <FaCarSide />,
      title: "Get a Quote",
      description: "Tell us what your car needs or ask for a diagnostic. Receive a free, fast, fair & transparent price quote.",
    },
    {
      icon: <FaCalendarAlt />,
      title: "Book Appointment",
      description: "Provide your home or office location. Tell us when to meet you there.",
    },
    {
      icon: <FaWrench />,
      title: "Get Your Car Fixed",
      description: "That’s it. No more waiting in repair shops - our mechanics come to you.",
    },
  ];

  return (
    <motion.section
      ref={ref}
      className={`py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-16 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] mx-4 sm:mx-6 my-12 sm:my-20 ${theme === "dark" ? "bg-gradient-to-br from-[#12343b]/90 to-[#2d545e]/90" : "bg-gradient-to-br from-[#2d545e] to-[#12343b]"}`}
      initial={{ opacity: 0, y: 70 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1 }}
    >
      <motion.h2
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-8 sm:mb-12 text-[#e1b382] tracking-wider"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        How to Book Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Service</span>
      </motion.h2>
      <p className="text-center text-[#c89666] text-base sm:text-lg md:text-xl mb-8 sm:mb-12">
        Life’s too short to spend it at the repair shop. Enjoy convenient car repair and maintenance at your home or office.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 max-w-5xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="text-center"
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: index * 0.2 }}
          >
            <div className="text-4xl sm:text-5xl md:text-6xl text-[#e1b382] mb-4 sm:mb-6 mx-auto w-fit">{step.icon}</div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">{step.title}</h3>
            <p className="text-[#c89666] text-sm sm:text-base">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

// Location Section
const LocationSection = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <motion.section
      className={`py-12 sm:py-16 md:py-24 ${theme === "dark" ? "bg-gradient-to-b from-[#2d545e]/50 to-[#12343b]/50" : "bg-gradient-to-b from-[#12343b]/10 to-transparent"}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <motion.h2
        className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-8 sm:mb-12 md:mb-16 ${theme === "dark" ? "text-[#e1b382]" : "text-[#2d545e]"} tracking-wider`}
        initial={{ opacity: 0, y: -60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Visit Us at <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">FRIENDS CAR CARE</span>
      </motion.h2>
      <motion.div
        className={`w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl shadow-xl overflow-hidden border ${theme === "dark" ? "border-[#e1b382]/50" : "border-[#e1b382]/30"} mx-auto max-w-5xl`}
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
};

// Action Buttons Component
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
      {/* Action Buttons Container */}
      <motion.div
        className="fixed bottom-6 sm:bottom-10 right-6 sm:right-10 z-50 flex items-center gap-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
      >
        {/* Toggle Arrow Button */}
        <div className="relative group">
          <motion.button
            className={`bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] rounded-full p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 ${theme === "dark" ? "bg-gradient-to-r from-[#c89666] to-[#e1b382]" : ""}`}
            whileHover={{ scale: 1.15, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleExpand}
            aria-label={isExpanded ? "Collapse buttons" : "Expand buttons"}
          >
            {isExpanded ? <FaArrowRight size={20} /> : <FaArrowLeft size={20} />}
          </motion.button>
          <span className="absolute bottom-full mb-2 hidden group-hover:block bg-[#12343b]/90 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {isExpanded ? "Hide Actions" : "Show Actions"}
          </span>
        </div>

        {/* Collapsible Buttons */}
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
              {/* Contact Button */}
              <div className="relative group">
                <motion.button
                  variants={buttonVariants}
                  className={`bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] rounded-full p-4 sm:p-5 shadow-xl hover:shadow-2xl transition-all duration-300 ${theme === "dark" ? "bg-gradient-to-r from-[#c89666] to-[#e1b382]" : ""}`}
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

              {/* Book Your Service Button */}
              <div className="relative group">
                <motion.div variants={buttonVariants}>
                  <Link
                    to="/services"
                    className={`bg-gradient-to-r from-[#2d545e] to-[#12343b] text-[#e1b382] rounded-full p-4 sm:p-5 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center ${theme === "dark" ? "bg-gradient-to-r from-[#12343b] to-[#2d545e]" : ""}`}
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

              {/* AI Recommender Button */}
              <div className="relative group">
                <motion.div variants={buttonVariants}>
                  <Link
                    to="/ai-recommender"
                    className={`bg-gradient-to-r from-[#c89666] to-[#e1b382] text-[#12343b] rounded-full p-4 sm:p-5 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center ${theme === "dark" ? "bg-gradient-to-r from-[#e1b382] to-[#c89666]" : ""}`}
                    aria-label="AI Recommender"
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

      {/* Contact Popup */}
      <AnimatePresence>
        {isContactOpen && (
          <motion.div
            className={`fixed bottom-24 sm:bottom-28 right-6 sm:right-10 rounded-xl shadow-2xl p-6 w-72 sm:w-80 z-50 border ${theme === "dark" ? "bg-[#2d545e]/95 border-[#e1b382]/50" : "bg-[#12343b]/95 border-[#e1b382]/30"} backdrop-blur-md`}
            variants={contactPopupVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#e1b382]">Contact Us</h3>
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
                <a
                  href="tel:+1234567890"
                  className="text-[#c89666] hover:text-[#e1b382] transition-colors"
                >
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-[#e1b382]" size={18} />
                <a
                  href="mailto:support@friendscarcare.com"
                  className="text-[#c89666] hover:text-[#e1b382] transition-colors"
                >
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

// HomePage Component
const HomePage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`relative overflow-hidden ${theme === "dark" ? "bg-[#12343b]/90" : "bg-gray-50"}`}>
      <ImageBackground />
      <DashboardSection />
      <FeaturesSection />
      <WhyChooseUsSection />
      <CarBrandCarousel />
      <HowToBookSection />
      <LocationSection />
      <ActionButtons />
    </div>
  );
};

export default HomePage;