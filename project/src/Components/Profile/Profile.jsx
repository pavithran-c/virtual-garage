import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update user data (replace with API call)
    alert("Profile updated successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <motion.section
        className="max-w-4xl mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-extrabold mb-12 text-center text-[#2d545e]">
          Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666]">Profile</span>
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Name"
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
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 p-4 rounded-xl border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382]"
                required
              />
            </div>
            <div className="relative md:col-span-2">
              <FaPhoneAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-12 p-4 rounded-xl border border-[#e1b382]/50 focus:outline-none focus:ring-2 focus:ring-[#e1b382]"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            className="mt-6 w-full bg-gradient-to-r from-[#e1b382] to-[#c89666] text-[#12343b] px-6 py-3 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Update Profile
          </motion.button>
        </form>
      </motion.section>
    </div>
  );
};

export default Profile;