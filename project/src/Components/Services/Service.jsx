"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaWrench, FaCar, FaTachometerAlt, FaBatteryHalf, FaOilCan, FaStar, FaPlayCircle, FaPhoneAlt,
  FaTools, FaWind, FaPaintRoller, FaShieldAlt, FaCogs, FaSnowflake, FaCarSide, FaCheckCircle,
  FaComment, FaTimes, FaSoap, FaWater, FaSprayCan, FaCarCrash, FaClock, FaEllipsisH, FaCheck, FaInfoCircle
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

// Service Card Component
const ServiceCard = ({ icon, title, description, price, rating, delay, onClick }) => {
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
        rotateX: 5,
        rotateY: 5,
        background: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(225, 179, 130, 0.2))",
        boxShadow: "0 25px 60px rgba(200, 150, 102, 0.4)",
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
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

// Service Detail Modal
const ServiceDetailModal = ({ service, onClose, onApply }) => (
  <motion.div
    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-white p-10 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 relative"
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50 }}
      transition={{ duration: 0.5 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="absolute top-4 right-4 text-gray-600 hover:text-[#e1b382]" onClick={onClose}>
        <FaTimes className="text-2xl" />
      </button>
      <div className="text-6xl mb-6 text-[#2d545e] mx-auto w-fit">{service.icon}</div>
      <h3 className="text-3xl font-extrabold mb-4 text-[#12343b] text-center">{service.title}</h3>
      <p className="text-gray-700 mb-6 text-lg leading-relaxed">{service.fullDescription}</p>
      <p className="text-[#e1b382] font-extrabold text-2xl mb-6 text-center">₹{service.price}</p>
      <ul className="list-disc list-inside text-gray-700 mb-6">
        {service.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
      <motion.button
        onClick={onApply}
        className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 w-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Apply Now
      </motion.button>
    </motion.div>
  </motion.div>
);

// Detailed Service Tracker Modal
const TrackerDetailModal = ({ service, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-gradient-to-br from-white to-gray-50 p-10 rounded-3xl shadow-2xl max-w-3xl w-full mx-4 relative border border-[#e1b382]/30 backdrop-blur-sm"
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50 }}
      transition={{ duration: 0.5 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="absolute top-4 right-4 text-gray-600 hover:text-[#e1b382]" onClick={onClose}>
        <FaTimes className="text-2xl" />
      </button>
      <div className="flex items-center mb-6">
        <FaCarCrash className="text-5xl text-[#2d545e] mr-4" />
        <div>
          <h3 className="text-3xl font-extrabold text-[#12343b]">{service.car}</h3>
          <p className="text-gray-600">Owner: {service.owner}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-[#e1b382] font-semibold mb-2">Service Type:</p>
          <p className="text-gray-700 text-lg">{service.serviceType}</p>
          <p className="text-[#e1b382] font-semibold mt-4 mb-2">Progress:</p>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#e1b382] to-[#c89666]"
              initial={{ width: 0 }}
              animate={{ width: `${service.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-[#e1b382] text-lg font-bold mt-2">{service.progress}% Complete</p>
          <p className="text-[#e1b382] font-semibold mt-4 mb-2">Status:</p>
          <p className={`text-lg font-semibold ${service.progress === 100 ? 'text-green-500' : service.progress >= 90 ? 'text-blue-500' : 'text-[#e1b382]'}`}>
            {service.status}
          </p>
        </div>
        <div>
          <p className="text-[#e1b382] font-semibold mb-2">Estimated Completion:</p>
          <p className="text-gray-700 text-lg flex items-center"><FaClock className="mr-2" /> {new Date(service.estimatedCompletion).toLocaleString()}</p>
          <p className="text-[#e1b382] font-semibold mt-4 mb-2">Technician:</p>
          <p className="text-gray-700 text-lg">{service.technician}</p>
        </div>
      </div>
      <div className="mt-6">
        <p className="text-[#e1b382] font-semibold mb-2">Parts Used:</p>
        <ul className="list-disc list-inside text-gray-700">
          {service.partsUsed.map((part, i) => (
            <li key={i} className="text-lg">{part.name} - ₹{part.cost}</li>
          ))}
        </ul>
        <p className="text-[#e1b382] font-bold mt-2 text-lg">Total Parts Cost: ₹{service.partsUsed.reduce((sum, part) => sum + part.cost, 0)}</p>
      </div>
      <div className="mt-6">
        <p className="text-[#e1b382] font-semibold mb-2">Repairs Done:</p>
        <ul className="space-y-2">
          {service.repairsDone.map((repair, i) => (
            <li key={i} className="flex items-center text-gray-700 text-lg">
              <FaCheck className="text-green-500 mr-2" /> {repair}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  </motion.div>
);

// Services Section
const ServicesSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedService, setSelectedService] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const eliteServices = [
    { icon: <FaWrench />, title: "General Maintenance", description: "Comprehensive vehicle check-up and servicing.", price: "4,999", rating: 5, fullDescription: "Keep your vehicle in top condition with our thorough maintenance package, covering all essential checks.", features: ["Oil check & top-up", "Brake inspection", "Tire pressure check", "Fluid level inspection"] },
    { icon: <FaCar />, title: "Engine Overhaul", description: "Full engine diagnostics and rebuild.", price: "24,999", rating: 4, fullDescription: "Revitalize your engine with a complete overhaul, including diagnostics and part replacements.", features: ["Engine diagnostics", "Piston replacement", "Valve tuning", "Performance testing"] },
    { icon: <FaTachometerAlt />, title: "Transmission Repair", description: "Expert transmission tuning and repair.", price: "29,999", rating: 4, fullDescription: "Ensure smooth gear shifts with our expert transmission repair and maintenance services.", features: ["Gearbox inspection", "Clutch repair", "Fluid replacement", "Test drive"] },
    { icon: <FaBatteryHalf />, title: "Battery Replacement", description: "High-quality battery installation.", price: "3,999", rating: 5, fullDescription: "Quick and reliable battery replacement with premium brands for uninterrupted performance.", features: ["Battery testing", "New battery installation", "Old battery disposal", "Warranty included"] },
    { icon: <FaOilCan />, title: "Oil & Filter Change", description: "Synthetic oil and premium filter swap.", price: "2,499", rating: 5, fullDescription: "Extend engine life with our premium oil change service using synthetic oils.", features: ["Synthetic oil change", "Filter replacement", "Engine cleaning", "Leak check"] },
    { icon: <FaTools />, title: "Wheel Alignment & Balancing", description: "Precision alignment for smooth rides.", price: "3,499", rating: 4, fullDescription: "Achieve perfect handling and tire longevity with our advanced alignment technology.", features: ["Wheel alignment", "Tire balancing", "Suspension check", "Road test"] },
    { icon: <FaWind />, title: "AC Servicing", description: "Complete AC gas refill and repair.", price: "6,999", rating: 5, fullDescription: "Stay cool with our full AC service, including gas recharge and component repair.", features: ["AC gas refill", "Compressor check", "Leak detection", "Cooling test"] },
    { icon: <FaPaintRoller />, title: "Car Detailing", description: "Luxury interior and exterior polishing.", price: "9,999", rating: 5, fullDescription: "Transform your car with our premium detailing for a showroom finish.", features: ["Exterior polishing", "Interior deep clean", "Wax application", "Odor removal"] },
    { icon: <FaShieldAlt />, title: "Ceramic Coating", description: "Premium paint protection with shine.", price: "19,999", rating: 5, fullDescription: "Protect your car’s paint with our advanced ceramic coating for long-lasting shine.", features: ["Ceramic layer application", "UV protection", "Scratch resistance", "Gloss finish"] },
    { icon: <FaCogs />, title: "Brake System Repair", description: "Brake pad replacement and tuning.", price: "7,999", rating: 4, fullDescription: "Ensure safety with our comprehensive brake system repair and maintenance.", features: ["Brake pad replacement", "Disc cleaning", "Fluid top-up", "Brake testing"] },
    { icon: <FaSnowflake />, title: "Coolant Flush", description: "Engine cooling system maintenance.", price: "4,499", rating: 4, fullDescription: "Prevent overheating with our coolant flush and system maintenance service.", features: ["Coolant replacement", "Radiator flush", "Thermostat check", "Leak inspection"] },
    { icon: <FaCarSide />, title: "Dent & Scratch Removal", description: "Professional bodywork restoration.", price: "12,999", rating: 5, fullDescription: "Restore your car’s body with our expert dent and scratch removal techniques.", features: ["Dent removal", "Scratch buffing", "Paint touch-up", "Final polish"] },
  ];

  const washingServices = [
    { icon: <FaSoap />, title: "Basic Wash", description: "Quick exterior wash and dry.", price: "499", rating: 4, fullDescription: "A quick and effective wash to keep your car looking clean and fresh.", features: ["Exterior foam wash", "Hand drying", "Tire cleaning", "Quick rinse"] },
    { icon: <FaWater />, title: "Premium Wash", description: "Deep clean with wax finish.", price: "999", rating: 5, fullDescription: "A thorough wash with premium wax for a glossy, protected finish.", features: ["Foam cannon wash", "Wax application", "Wheel detailing", "Interior vacuum"] },
    { icon: <FaSprayCan />, title: "Luxury Wash & Polish", description: "Full wash with polish and interior care.", price: "1,999", rating: 5, fullDescription: "An all-inclusive wash with premium polishing and interior refreshment.", features: ["High-pressure wash", "Polish application", "Interior detailing", "Glass cleaning"] },
  ];

  const handleApply = (service) => {
    alert(`Applying for ${service.title}! Redirecting to booking...`);
    setSelectedService(null);
  };

  return (
    <motion.section
      ref={ref}
      className=" mx-auto px-6 py-24 bg-gradient-to-b from-gray-100 to-white"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
    >
      <motion.h2 className="text-5xl font-extrabold mb-16 text-center text-[#2d545e] tracking-wider" initial={{ opacity: 0, y: -60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay: 0.2 }}>
        Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Elite Services</span>
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        {eliteServices.map((service, index) => (
          <ServiceCard key={index} {...service} delay={index * 0.15} onClick={() => setSelectedService(service)} />
        ))}
      </div>

      <motion.h2 className="text-5xl font-extrabold mb-16 text-center text-[#2d545e] tracking-wider" initial={{ opacity: 0, y: -60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay: 0.4 }}>
        Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Washing Services</span>
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
        {washingServices.map((service, index) => (
          <ServiceCard key={index} {...service} delay={index * 0.15} onClick={() => setSelectedService(service)} />
        ))}
      </div>

      <AnimatePresence>
        {selectedService && (
          <ServiceDetailModal service={selectedService} onClose={() => setSelectedService(null)} onApply={() => handleApply(selectedService)} />
        )}
      </AnimatePresence>

      <motion.div className="text-center mt-16" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.9, delay: 0.6 }}>
        <p className="text-xl text-gray-700 mb-6 font-medium">Witness our expertise:</p>
        <motion.button
          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
          className="bg-gradient-to-r from-[#2d545e] to-[#12343b] text-[#e1b382] px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
          whileHover={{ scale: 1.15, boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.2)" }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlayCircle className="inline mr-3" /> {isVideoPlaying ? "Close Video" : "Watch Demo"}
        </motion.button>
        <AnimatePresence>
          {isVideoPlaying && (
            <motion.div className="mt-10" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.6 }}>
              <iframe width="100%" height="450" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" title="Service Highlights" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-xl shadow-2xl max-w-5xl mx-auto"></iframe>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
};

// Live Service Tracker Section
const LiveServiceTracker = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [liveServices, setLiveServices] = useState([
    { id: 1, car: "Toyota Corolla", owner: "Rakesh Sharma", serviceType: "Engine Overhaul", progress: 75, status: "In Progress", estimatedCompletion: "2025-02-21 15:00", partsUsed: [{ name: "Piston Set", cost: 4500 }, { name: "Oil Filter", cost: 500 }, { name: "Gasket Kit", cost: 1200 }], repairsDone: ["Engine diagnostics", "Piston replacement", "Valve cleaning"], technician: "Vikram Patel" },
    { id: 2, car: "Honda Civic", owner: "Priya Patel", serviceType: "Ceramic Coating", progress: 90, status: "Finishing Up", estimatedCompletion: "2025-02-20 17:30", partsUsed: [{ name: "Ceramic Compound", cost: 8000 }, { name: "Microfiber Pads", cost: 300 }], repairsDone: ["Surface preparation", "Coating application"], technician: "Neha Gupta" },
    { id: 3, car: "Maruti Swift", owner: "Amit Singh", serviceType: "Basic Wash", progress: 40, status: "In Progress", estimatedCompletion: "2025-02-20 14:45", partsUsed: [{ name: "Foam Soap", cost: 200 }, { name: "Wax Solution", cost: 150 }], repairsDone: ["Exterior wash started"], technician: "Rahul Kumar" },
    { id: 4, car: "Hyundai Creta", owner: "Sonia Mehta", serviceType: "Car Detailing", progress: 60, status: "In Progress", estimatedCompletion: "2025-02-20 16:00", partsUsed: [{ name: "Polishing Compound", cost: 1500 }, { name: "Wax Sealant", cost: 800 }, { name: "Interior Cleaner", cost: 400 }], repairsDone: ["Exterior polishing", "Interior vacuuming"], technician: "Karan Singh" },
    { id: 5, car: "BMW X5", owner: "Vikram Rao", serviceType: "Brake System Repair", progress: 85, status: "In Progress", estimatedCompletion: "2025-02-21 11:30", partsUsed: [{ name: "Brake Pads", cost: 3500 }, { name: "Brake Fluid", cost: 600 }, { name: "Disc Rotors", cost: 4500 }], repairsDone: ["Brake pad replacement", "Disc cleaning"], technician: "Anil Sharma" },
    { id: 6, car: "Audi Q7", owner: "Neha Gupta", serviceType: "Dent & Scratch Removal", progress: 30, status: "In Progress", estimatedCompletion: "2025-02-21 13:00", partsUsed: [{ name: "Paint Primer", cost: 700 }, { name: "Clear Coat", cost: 900 }], repairsDone: ["Dent assessment", "Surface sanding"], technician: "Priya Desai" }
  ]);
  const [completedServices, setCompletedServices] = useState([]);

  const additionalRepairs = [
    "Final inspection", "Quality check", "Test drive", "Fluid top-up", "Wheel alignment",
    "Polishing", "Sealant application", "Component testing", "Cleaning", "Adjustment"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveServices(prevData => {
        const updatedServices = prevData.map(item => {
          if (item.progress < 100) {
            const newProgress = Math.min(100, item.progress + Math.floor(Math.random() * 3) + 1);
            const remainingProgress = 100 - newProgress;
            const minutesRemaining = remainingProgress * 10; // Assuming 10 minutes per 1% progress
            const newEstimatedCompletion = new Date(Date.now() + minutesRemaining * 60 * 1000);

            // Add a random repair when progress increases significantly
            if (Math.random() > 0.7 && item.repairsDone.length < 6) {
              const newRepair = additionalRepairs[Math.floor(Math.random() * additionalRepairs.length)];
              if (!item.repairsDone.includes(newRepair)) {
                item.repairsDone.push(newRepair);
              }
            }

            return {
              ...item,
              progress: newProgress,
              status: newProgress === 100 ? "Completed" : newProgress >= 90 ? "Finishing Up" : "In Progress",
              estimatedCompletion: newEstimatedCompletion.toISOString()
            };
          }
          return item;
        });

        // Move completed services to completed section
        const ongoing = updatedServices.filter(s => s.progress < 100);
        const completed = updatedServices.filter(s => s.progress === 100);
        if (completed.length > 0) {
          setCompletedServices(prev => [...prev, ...completed]);
        }
        return ongoing;
      });
    }, 10000); // Update every 10 seconds for slower progress

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      ref={ref}
      className="mx-auto px-6 py-24 bg-gradient-to-b from-white to-gray-100"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
    >
      {/* Live Services */}
      <motion.h2 className="text-5xl font-extrabold mb-16 text-center text-[#2d545e] tracking-wider" initial={{ opacity: 0, y: -60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay: 0.2 }}>
        Live <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Service Tracker</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {liveServices.map((service, index) => (
          <motion.div
            key={service.id}
            className="relative bg-white/95 p-8 rounded-2xl shadow-xl border border-[#e1b382]/30 backdrop-blur-sm overflow-hidden cursor-pointer"
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: index * 0.15 }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 20px 50px rgba(225,179,130,0.3)",
              background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(225,179,130,0.15))"
            }}
            onClick={() => setSelectedTracker(service)}
          >
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold text-white ${
              service.progress >= 90 ? 'bg-blue-500' : 'bg-[#e1b382]'
            }`}>
              {service.status}
            </div>

            <div className="flex items-center mb-6">
              <FaCarCrash className="text-4xl text-[#2d545e] mr-4 animate-pulse" />
              <div>
                <h3 className="text-2xl font-bold text-[#12343b]">{service.car}</h3>
                <p className="text-gray-600 text-sm">Owner: {service.owner}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[#e1b382] font-semibold text-sm">
                Service: <span className="text-gray-700">{service.serviceType}</span>
              </p>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-semibold text-[#2d545e]">Progress</span>
                  <span className="text-sm font-bold text-[#e1b382]">{service.progress}%</span>
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-xl bg-gray-200">
                  <motion.div
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#e1b382] to-[#c89666]"
                    initial={{ width: 0 }}
                    animate={{ width: `${service.progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <p className="text-gray-700 text-sm flex items-center">
                <FaClock className="mr-2 text-[#2d545e]" />
                Est. Completion: {new Date(service.estimatedCompletion).toLocaleTimeString()}
              </p>

              <p className="text-gray-700 text-sm">Technician: <span className="font-semibold">{service.technician}</span></p>
            </div>

            <motion.div
              className="absolute bottom-4 right-4 flex items-center text-[#e1b382]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaEllipsisH className="mr-2" />
              <span className="text-xs">Live</span>
            </motion.div>
            <motion.button
              className="absolute bottom-4 left-4 text-[#2d545e] hover:text-[#e1b382] flex items-center"
              whileHover={{ scale: 1.1 }}
            >
              <FaInfoCircle className="mr-1" /> Details
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Completed Services */}
      {completedServices.length > 0 && (
        <>
          <motion.h2 className="text-5xl font-extrabold mb-16 mt-20 text-center text-[#2d545e] tracking-wider" initial={{ opacity: 0, y: -60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay: 0.4 }}>
            Completed <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Services</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {completedServices.map((service, index) => (
              <motion.div
                key={service.id}
                className="relative bg-white/95 p-8 rounded-2xl shadow-xl border border-[#e1b382]/30 backdrop-blur-sm overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 60 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 20px 50px rgba(225,179,130,0.3)",
                  background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(225,179,130,0.15))"
                }}
                onClick={() => setSelectedTracker(service)}
              >
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold text-white bg-green-500">
                  Completed
                </div>

                <div className="flex items-center mb-6">
                  <FaCarCrash className="text-4xl text-[#2d545e] mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-[#12343b]">{service.car}</h3>
                    <p className="text-gray-600 text-sm">Owner: {service.owner}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[#e1b382] font-semibold text-sm">
                    Service: <span className="text-gray-700">{service.serviceType}</span>
                  </p>
                  <p className="text-gray-700 text-sm">Technician: <span className="font-semibold">{service.technician}</span></p>
                  <p className="text-gray-700 text-sm flex items-center">
                    <FaCheckCircle className="mr-2 text-green-500" />
                    Completed on: {new Date(service.estimatedCompletion).toLocaleTimeString()}
                  </p>
                </div>

                <motion.button
                  className="absolute bottom-4 left-4 text-[#2d545e] hover:text-[#e1b382] flex items-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <FaInfoCircle className="mr-1" /> Details
                </motion.button>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <motion.div className="text-center mt-12" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.9, delay: 0.6 }}>
        <motion.button
          onClick={() => setLiveServices([...liveServices])}
          className="bg-gradient-to-r from-[#2d545e] to-[#12343b] text-[#e1b382] px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Refresh Live Data
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {selectedTracker && (
          <TrackerDetailModal service={selectedTracker} onClose={() => setSelectedTracker(null)} />
        )}
      </AnimatePresence>
    </motion.section>
  );
};

// Booking Form
const BookingForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", service: "", date: "" });
  const [appointmentStatus, setAppointmentStatus] = useState(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const handleSubmit = (e) => {
    e.preventDefault();
    setAppointmentStatus("Pending Confirmation");
    setTimeout(() => setAppointmentStatus("Confirmed! Check your email."), 2000);
    setFormData({ name: "", email: "", service: "", date: "" });
  };

  useEffect(() => {
    flatpickr(".flatpickr", {
      minDate: "today",
      dateFormat: "Y-m-d H:i",
      enableTime: true,
      time_24hr: true,
      disable: [(date) => date.getDay() === 0],
    });
  }, []);

  return (
    <motion.div
      ref={ref}
      className="bg-gradient-to-br from-[#2d545e] to-[#12343b] py-24 px-10 md:px-24 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] mx-6 my-20"
      initial={{ opacity: 0, y: 70 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1 }}
    >
      <motion.h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-[#e1b382] tracking-wider" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.9, delay: 0.2 }}>
        Reserve Your <span className="text-white">Elite Service</span>
      </motion.h2>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8">
        {["name", "email", "service", "date"].map((field, index) => (
          <motion.div key={field} initial={{ opacity: 0, x: -60 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: index * 0.2 }}>
            {field === "service" ? (
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-5 py-4 rounded-xl bg-white bg-opacity-10 text-white border border-[#e1b382] focus:outline-none focus:ring-4 focus:ring-[#c89666]/50 transition-all duration-300"
                required
              >
                <option value="" disabled className="text-gray-400">Choose a Service</option>
                {["General Maintenance", "Engine Overhaul", "Transmission Repair", "Battery Replacement", "Oil & Filter Change", "Wheel Alignment & Balancing", "AC Servicing", "Car Detailing", "Ceramic Coating", "Brake System Repair", "Coolant Flush", "Dent & Scratch Removal", "Basic Wash", "Premium Wash", "Luxury Wash & Polish"].map((service) => (
                  <option key={service} value={service} className="text-gray-800">{service}</option>
                ))}
              </select>
            ) : (
              <input
                type={field === "email" ? "email" : field === "date" ? "text" : "text"}
                placeholder={field === "date" ? "Pick Date & Time" : `Your ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className={`w-full px-5 py-4 rounded-xl bg-white bg-opacity-10 text-white border border-[#e1b382] focus:outline-none focus:ring-4 focus:ring-[#c89666]/50 transition-all duration-300 ${field === "date" ? "flatpickr" : ""}`}
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
          Confirm Booking
        </motion.button>
      </form>
      {appointmentStatus && (
        <motion.div className="mt-6 text-center text-[#e1b382] font-semibold text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <FaCheckCircle className="inline mr-2" /> {appointmentStatus}
        </motion.div>
      )}
    </motion.div>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [comments, setComments] = useState([
    { name: "Rakesh Sharma", quote: "Unmatched quality! My car feels brand new.", rating: 5, comment: "The team was very professional!" },
    { name: "Priya Patel", quote: "Luxury service at affordable prices!", rating: 5, comment: "Worth every rupee." },
    { name: "Amit Singh", quote: "Fast, reliable, and professional team.", rating: 4, comment: "Quick service, highly recommend." },
    { name: "Neha Gupta", quote: "The ceramic coating is phenomenal!", rating: 5, comment: "My car shines like never before." },
    { name: "Vikram Rao", quote: "Best car care in town, hands down!", rating: 5, comment: "Amazing attention to detail." },
  ]);
  const [newComment, setNewComment] = useState({ name: "", comment: "" });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.name && newComment.comment) {
      setComments([...comments, { ...newComment, quote: "Great service!", rating: 5 }]);
      setNewComment({ name: "", comment: "" });
    }
  };

  return (
    <motion.section
      ref={ref}
      className="py-24 px-6 bg-gradient-to-t from-[#f8f8f8] to-white"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
    >
      <motion.h2 className="text-5xl font-extrabold text-[#2d545e] text-center mb-20 tracking-wider" initial={{ opacity: 0, y: -60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay: 0.2 }}>
        Our <span className="text-[#e1b382] bg-clip-text bg-gradient-to-r from-[#e1b382] to-[#c89666]">Valued Clients</span>
      </motion.h2>
      <div className="mx-auto flex flex-col md:flex-row gap-12">
        <motion.div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8" initial={{ opacity: 0, x: -60 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, delay: 0.4 }}>
          {comments.map((testimonial, index) => (
            <motion.div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden border border-[#e1b382]/20" initial={{ opacity: 0, y: 60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: index * 0.15 }} whileHover={{ y: -10, scale: 1.02 }}>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2d545e] to-[#e1b382]" />
              <p className="text-gray-700 mb-3 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
              <p className="text-[#2d545e] font-bold text-xl mb-2">{testimonial.name}</p>
              <div className="text-[#e1b382] mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="inline mr-1" />
                ))}
              </div>
              <p className="text-gray-600 text-sm">{testimonial.comment}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div className="md:w-1/3 bg-gradient-to-br from-[#2d545e] to-[#12343b] p-8 rounded-2xl shadow-xl" initial={{ opacity: 0, x: 60 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, delay: 0.6 }}>
          <h3 className="text-2xl font-bold text-[#e1b382] mb-6 text-center">Leave a Review</h3>
          <form onSubmit={handleCommentSubmit} className="space-y-6">
            <input type="text" placeholder="Your Name" value={newComment.name} onChange={(e) => setNewComment({ ...newComment, name: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 text-white border border-[#e1b382] focus:outline-none focus:ring-2 focus:ring-[#c89666] transition-all duration-300" required />
            <textarea placeholder="Your Comment" value={newComment.comment} onChange={(e) => setNewComment({ ...newComment, comment: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 text-white border border-[#e1b382] focus:outline-none focus:ring-2 focus:ring-[#c89666] transition-all duration-300 h-32" required />
            <motion.button type="submit" className="bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Submit Review
            </motion.button>
          </form>
        </motion.div>
      </div>
    </motion.section>
  );
};

// Live Chat
const LiveChat = () => (
  <motion.div
    className="fixed bottom-17 right-8 bg-gradient-to-r from-[#e1b382] to-[#c89666] rounded-full p-5 shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] z-50"
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

// Services Page
const ServicesPage = ({ cart = [], user, setUser }) => (
  <div className="relative bg-gray-50 overflow-hidden">
    <motion.div className="absolute inset-0 bg-gradient-to-b from-[#2d545e]/10 to-transparent pointer-events-none z-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} />
    <ServicesSection />
    <LiveServiceTracker />
    <BookingForm />
    <TestimonialsSection />
    <LiveChat />
  </div>
);

export default ServicesPage;