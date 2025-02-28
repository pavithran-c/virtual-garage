import React from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowUp } from "react-icons/fa";

const Footer = () => {
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
    <footer className="mx-auto bg-[#e1b382] text-[#12343b] py-16 relative">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className=" mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.button 
          onClick={scrollToTop}
          className="absolute right-4 bottom-4 sm:right-5 sm:bottom-8 bg-[#12343b] p-3 rounded-full shadow-lg hover:bg-[#2d545e] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
        >
          <FaArrowUp className="text-[#e1b382] text-xl" />
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <motion.h3 
              className="text-3xl font-bold"
              variants={itemVariants}
            >
              FRIENDS CAR CARE
            </motion.h3>
            <p className="text-lg leading-relaxed">
              Luxury Car Maintenance and Repair Services at Your Convenience.
            </p>
            <p className="text-base">
              <a href="tel:+1234567890" className="hover:text-[#2d545e] transition-colors duration-300">+1 (234) 567-890</a><br />
              <a href="mailto:info@friendscarcare.com" className="hover:text-[#2d545e] transition-colors duration-300">info@friendscarcare.com</a>
            </p>
          </motion.div>

          {/* Popular Services */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-2xl font-bold text-[#2d545e]">Popular Services</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <motion.li key={index} variants={itemVariants}>
                  <a href={`/services#${service.toLowerCase().replace(/ /g, '-')}`} className="text-[#12343b] hover:text-[#2d545e] transition-colors duration-300">
                    {service}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-2xl font-bold text-[#2d545e]">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'Home', path: '/home' },
                { name: 'About Us', path: '/about' },
                { name: 'Testimonials', path: '/testimonials' },
                { name: 'Contact', path: '/contact' }
              ].map((link) => (
                <motion.li key={link.name} variants={itemVariants}>
                  <a href={link.path} className="text-[#12343b] hover:text-[#2d545e] transition-colors duration-300">
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social & Newsletter */}
          <motion.div variants={itemVariants} className="space-y-8">
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
                  className="bg-[#12343b] p-3 rounded-full text-[#e1b382] hover:text-white transition-colors"
                >
                  <Icon className="text-xl md:text-2xl" style={{ color }} />
                </motion.a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-[#2d545e] 
                          text-[#12343b] placeholder-[#2d545e]/70 transition-all duration-300"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-[#2d545e] rounded-lg 
                          text-white font-semibold shadow-lg hover:bg-[#12343b] transition-all duration-300"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-[#12343b]/20 text-center"
        >
          <motion.p 
            className="text-[#12343b] text-sm"
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