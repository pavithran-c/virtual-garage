import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../Components/ThemeContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = (event) => {
      if (!user) {
        event.preventDefault();
        window.history.pushState(null, null, "/");
        navigate("/");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate, user]);

  // Move "Profile" to the end and remove "Logout"
  const navLinks = [
    { to: "/home", text: "Home" },
    { to: "/services", text: "Services" },
    { to: "/dashboard", text: "Dashboard" },
    { to: "/live-track", text: "Live Track" },
    { to: "/ai-recommender", text: "AI Recommender" },
    { to: "/about", text: "About" },
    { to: "/contact", text: "Contact" },
    { to: "/profile", text: "Profile" }, // Profile moved to last
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 h-20 z-50 transition-all duration-300 ${theme === "dark" ? "bg-black/90" : "bg-[#0d2a32]/80"} backdrop-blur-sm`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="mx-auto px-6 h-full flex justify-between items-center">
          <Link to="/home" className="flex items-center">
            <span className="text-2xl font-bold text-[#e1b382]">FRIENDS CAR CARE</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-full transition-colors duration-200 flex items-center justify-center
                  ${location.pathname === link.to
                    ? "bg-[#e1b382] text-[#12343b] shadow-md ring-2 ring-[#e1b382]"
                    : theme === "dark"
                    ? "text-[#e1b382] hover:bg-[#2d545e]/60"
                    : "text-[#e1b382] hover:bg-[#2d545e]/60"}
                `}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <span className="whitespace-nowrap">{link.text}</span>
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full flex items-center justify-center transition-all duration-300 shadow-md
                ${theme === "dark"
                  ? "bg-[#e1b382] text-[#12343b] hover:bg-[#f3d9b1]"
                  : "bg-[#12343b] text-[#e1b382] hover:bg-[#2d545e]"}
                ring-2 ring-transparent focus:ring-[#e1b382]`}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{ width: 44, height: 44 }}
            >
              {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </nav>

          <button
            className="md:hidden p-2 rounded-full bg-[#e1b382] text-[#12343b] shadow-md flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            style={{ width: 44, height: 44 }}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={`fixed top-20 left-0 right-0 z-40 shadow-lg md:hidden ${theme === "dark" ? "bg-black/90" : "bg-[#0d2a32]/80"} backdrop-blur-sm`}
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
                  className={`flex items-center gap-2 px-4 py-3 rounded-full transition-colors duration-200 justify-center
                    ${location.pathname === link.to
                      ? "bg-[#e1b382] text-[#12343b] shadow-md ring-2 ring-[#e1b382]"
                      : theme === "dark"
                      ? "text-[#e1b382] hover:bg-[#2d545e]/60"
                      : "text-[#e1b382] hover:bg-[#2d545e]/60"}
                  `}
                  style={{ minWidth: 44, minHeight: 44 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="whitespace-nowrap">{link.text}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className={`mt-2 px-4 py-3 rounded-full transition-colors w-full text-center flex items-center justify-center
                  ${theme === "dark"
                    ? "bg-[#e1b382] text-[#12343b] hover:bg-[#f3d9b1] shadow-md"
                    : "bg-[#12343b] text-[#e1b382] hover:bg-[#2d545e] shadow-md"}
                `}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
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