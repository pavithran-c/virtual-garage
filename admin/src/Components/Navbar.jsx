import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-teal-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="text-xl font-bold">
              Admin Portal
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-teal-700" : "hover:bg-teal-700"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/employee"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-teal-700" : "hover:bg-teal-700"
                }`
              }
            >
              Employee Management
            </NavLink>
            <NavLink
              to="/deduction"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-teal-700" : "hover:bg-teal-700"
                }`
              }
            >
              Salary Deduction
            </NavLink>
            <NavLink
              to="/salary-summary"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-teal-700" : "hover:bg-teal-700"
                }`
              }
            >
              Salary Summary
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-teal-700 focus:outline-none"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? "bg-teal-700" : "hover:bg-teal-700"
                }`
              }
              onClick={toggleMenu}
            >
              Home
            </NavLink>
            <NavLink
              to="/employee"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? "bg-teal-700" : "hover:bg-teal-700"
                }`
              }
              onClick={toggleMenu}
            >
              Employee Management
            </NavLink>
            <NavLink
              to="/deduction"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? "bg-teal-700" : "hover:bg-teal-700"
                }`
              }
              onClick={toggleMenu}
            >
              Salary Deduction
            </NavLink>
            <NavLink
              to="/salary-summary"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? "bg-teal-700" : "hover:bg-teal-700"
                }`
              }
              onClick={toggleMenu}
            >
              Salary Summary
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;