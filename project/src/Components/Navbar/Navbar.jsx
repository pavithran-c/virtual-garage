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

  const navLinks = [
    { to: "/home", text: "Home" },
    { to: "/services", text: "Services" },
    { to: "/dashboard", text: "Dashboard" },
    { to: "/live-track", text: "Live Track" },
    { to: "/ai-recommender", text: "AI Recommender" },
    { to: "/about", text: "About" },
    { to: "/profile", text: "Profile" },
    { to: "/contact", text: "Contact" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 h-20 z-50 transition-all duration-300 ${theme === "dark" ? "bg-[#12343b]/90" : "bg-[#0d2a32]/80"} backdrop-blur-sm`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="mx-auto px-6 h-full flex justify-between items-center">
          <Link to="/home" className="flex items-center">
            <span className="text-2xl font-bold text-[#e1b382]">FRIENDS CAR CARE</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  location.pathname === link.to
                    ? theme === "dark"
                      ? "bg-[#2d545e]/80 text-[#e1b382]"
                      : "bg-[#2d545e]/80 text-[#e1b382]"
                    : theme === "dark"
                    ? "text-[#e1b382] hover:bg-[#2d545e]/60"
                    : "text-[#e1b382] hover:bg-[#2d545e]/60"
                }`}
              >
                {link.text}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className={`px-6 py-2 rounded-md transition-colors ${theme === "dark" ? "bg-[#2d545e]/80 text-[#e1b382] hover:bg-[#12343b]/80" : "bg-[#2d545e]/80 text-[#e1b382] hover:bg-[#0d2a32]/80"}`}
              >
                Logout
              </button>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === "dark" ? "bg-[#e1b382] text-[#12343b]" : "bg-[#12343b] text-[#e1b382]"} hover:shadow-md transition-all duration-300`}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
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
            className={`fixed top-20 left-0 right-0 z-40 shadow-lg md:hidden ${theme === "dark" ? "bg-[#12343b]/90" : "bg-[#0d2a32]/80"} backdrop-blur-sm`}
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
                      ? theme === "dark"
                        ? "bg-[#2d545e]/80 text-[#e1b382]"
                        : "bg-[#2d545e]/80 text-[#e1b382]"
                      : theme === "dark"
                      ? "text-[#e1b382] hover:bg-[#2d545e]/60"
                      : "text-[#e1b382] hover:bg-[#2d545e]/60"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.text}
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleLogout}
                  className={`mt-2 px-4 py-3 rounded-md transition-colors w-full text-left ${theme === "dark" ? "bg-[#2d545e]/80 text-[#e1b382] hover:bg-[#12343b]/80" : "bg-[#2d545e]/80 text-[#e1b382] hover:bg-[#0d2a32]/80"}`}
                >
                  Logout
                </button>
              )}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className={`mt-2 px-4 py-3 rounded-md transition-colors w-full text-left ${theme === "dark" ? "bg-[#e1b382] text-[#12343b]" : "bg-[#12343b] text-[#e1b382]"} hover:shadow-md`}
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