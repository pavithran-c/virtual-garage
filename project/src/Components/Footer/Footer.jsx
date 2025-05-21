import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowUp } from "react-icons/fa";

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState("");

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setNewsletterSuccess("");
    if (!validateEmail(newsletterEmail)) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }
    setNewsletterError("");
    setNewsletterSuccess("Subscribed successfully!");
    setNewsletterEmail("");
    // Here you can add your API call for newsletter subscription
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
  };

  const socialIconVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, 0],
      transition: { type: "spring", stiffness: 300 }
    }
  };

  const services = [
    'Tire Repair', 'Brake Repair', 'Engine Repair', 'Steering Repair', 
    'Cooling System', 'Wheel Alignment', 'Battery Starting', 'Suspension Repair'
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#e1b382] via-[#f3e9dc] to-[#e1b382] text-[#12343b] py-10 shadow-inner">
      {/* Decorative Blobs */}
      <div className="absolute -top-16 -left-16 w-56 h-56 bg-[#2d545e]/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute -bottom-20 right-0 w-72 h-72 bg-[#12343b]/10 rounded-full blur-2xl animate-pulse" />
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.button 
          onClick={scrollToTop}
          className="absolute right-6 bottom-6 sm:right-10 sm:bottom-10 bg-[#12343b] p-3 rounded-full shadow-xl hover:bg-[#2d545e] transition-colors border-4 border-[#e1b382] hover:scale-110"
          whileHover={{ scale: 1.1, rotate: -12 }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
        >
          <FaArrowUp className="text-[#e1b382] text-xl" />
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-3">
            <motion.h3 
              className="text-2xl font-extrabold tracking-tight drop-shadow-lg"
              variants={itemVariants}
            >
              FRIENDS CAR CARE
            </motion.h3>
            <p className="text-base leading-relaxed font-medium">
              Luxury Car Maintenance and Repair Services at Your Convenience.
            </p>
            <div className="flex flex-col gap-1 text-sm">
              <a href="tel:+91 9842734744" className="hover:text-[#2d545e] transition-colors duration-300 font-semibold">+91 9842734744 </a>
              <a href="mailto:info@friendscarcare.com" className="hover:text-[#2d545e] transition-colors duration-300 font-semibold">info@friendscarcare.com</a>
            </div>
          </motion.div>

          {/* Popular Services */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-lg font-bold text-[#2d545e]">Popular Services</h3>
            <ul className="space-y-1">
              {services.map((service, index) => (
                <motion.li key={index} variants={itemVariants}>
                  <a href={`/services#${service.toLowerCase().replace(/ /g, '-')}`} className="text-[#12343b] hover:text-[#2d545e] transition-colors duration-300 font-medium text-sm">
                    <span className="inline-block w-2 h-2 bg-[#2d545e] rounded-full mr-2 align-middle"></span>
                    {service}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-lg font-bold text-[#2d545e]">Quick Links</h3>
            <ul className="space-y-1">
              {[
                { name: 'Home', path: '/home' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact', path: '/contact' }
              ].map((link) => (
                <motion.li key={link.name} variants={itemVariants}>
                  <a href={link.path} className="text-[#12343b] hover:text-[#2d545e] transition-colors duration-300 font-medium text-sm">
                    <span className="inline-block w-2 h-2 bg-[#e1b382] rounded-full mr-2 align-middle"></span>
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social & Newsletter */}
          <motion.div variants={itemVariants} className="space-y-5">
            <h3 className="text-2xl font-bold text-[#2d545e]">Stay Connected</h3>
            
            {/* Social Icons */}
            <div className="flex space-x-4">
              {[
                { Icon: FaFacebookF, url: 'https://facebook.com/friendscarcare', color: '#1877f2' },
                { Icon: FaTwitter, url: 'https://twitter.com/friendscarcare', color: '#1da1f2' },
                { Icon: FaInstagram, url: 'https://instagram.com/friendscarcare', color: '#e4405f' },
                { Icon: FaLinkedinIn, url: 'https://linkedin.com/company/friendscarcare', color: '#0077b5' }
              ].map(({ Icon, url, color }, index) => (
                <motion.a 
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={socialIconVariants}
                  whileHover="hover"
                  className="bg-[#12343b] p-3 rounded-full text-[#e1b382] hover:text-white transition-colors shadow-lg"
                >
                  <Icon className="text-2xl" style={{ color }} />
                </motion.a>
              ))}
            </div>

            {/* Newsletter */}
            <form className="relative mt-4" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d545e] text-[#12343b] placeholder-[#2d545e]/70 transition-all duration-300 shadow"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#2d545e] rounded-lg text-white font-semibold shadow-lg hover:bg-[#12343b] transition-all duration-300"
              >
                Subscribe
              </motion.button>
              {newsletterError && (
                <p className="text-red-600 text-xs mt-1">{newsletterError}</p>
              )}
              {newsletterSuccess && (
                <p className="text-green-600 text-xs mt-1">{newsletterSuccess}</p>
              )}
            </form>
          </motion.div>
        </div>

        {/* Divider with gradient */}
        <div className="w-full h-1 bg-gradient-to-r from-[#e1b382]/0 via-[#2d545e]/30 to-[#e1b382]/0 my-12 rounded-full"></div>

        {/* Copyright */}
        <motion.div 
          variants={itemVariants}
          className="pt-4 text-center"
        >
          <motion.p 
            className="text-[#12343b] text-sm font-medium tracking-wide"
            whileHover={{ scale: 1.02 }}
          >
            © {new Date().getFullYear()} FRIENDS CAR CARE. All rights reserved.
          </motion.p>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;