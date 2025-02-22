import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaEnvelope,
  FaHome,
  FaBars,
  FaTimes,
  FaUser,
  FaWrench,
  FaTags,
  FaStore,
} from "react-icons/fa";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = (event) => {
      const isLoggedIn = localStorage.getItem("token");
      if (!isLoggedIn) {
        event.preventDefault();
        window.history.pushState(null, null, "/");
        navigate("/");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const navLinks = [
    { to: "/home", icon: "🏠", text: "Home" },
    { to: "/services", icon: "🔧", text: "Services" },
    { to: "/offers", icon: "🏷️", text: "Offers" },
    { to: "/shop", icon: "🛍️", text: "Shop" },
    { to: "/contact", icon: "✉️", text: "Contact" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.history.replaceState(null, null, "/");
    navigate("/", { replace: true });
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 h-20 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-[#12343b]/80 backdrop-blur-sm" 
            : "bg-[#12343b]/60 backdrop-blur-sm"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="mx-auto px-6 h-full flex justify-between items-center">
          <Link to="/home" className="flex items-center">
            <span className="text-2xl font-bold text-[#e1b382]">FRIENDS CAR CARE</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  location.pathname === link.to
                    ? "bg-[#2d545e]/80 text-[#e1b382]"
                    : "text-[#e1b382] hover:bg-[#2d545e]/60"
                }`}
              >
                {link.text}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="bg-[#2d545e]/80 text-[#e1b382] px-6 py-2 rounded-md hover:bg-[#12343b]/80 transition-colors"
            >
              Logout
            </button>
          </nav>

          <button
            className="md:hidden p-2 text-[#e1b382]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed top-20 left-0 right-0 z-40 bg-[#12343b]/90 backdrop-blur-sm shadow-lg md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-md transition-colors duration-200 ${
                    location.pathname === link.to
                      ? "bg-[#2d545e]/80 text-[#e1b382]"
                      : "text-[#e1b382] hover:bg-[#2d545e]/60"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.text}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="mt-2 bg-[#2d545e]/80 text-[#e1b382] px-4 py-3 rounded-md hover:bg-[#12343b]/80 transition-colors w-full text-left"
              >
                Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Spacer */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;