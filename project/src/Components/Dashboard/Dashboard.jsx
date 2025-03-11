import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaCar, FaCalendarAlt, FaShoppingCart } from "react-icons/fa";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({ name: "", manufacturer: "", number: "" });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Debug user state
  useEffect(() => {
    console.log('Current user state:', user);
    console.log('Authorization header:', axios.defaults.headers.common['Authorization']);
  }, [user]);

  // Fetch vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user) {
        console.log('No user found, skipping vehicle fetch');
        return;
      }
      
      setLoading(true);
      try {
        console.log('Fetching vehicles with token');
        // Include withCredentials for cookie-based auth as fallback
        const response = await axios.get(`${API_URL}/vehicles`, { 
          withCredentials: true 
        });
        setVehicles(response.data);
        setError("");
      } catch (error) {
        console.error('Error fetching vehicles:', error.response || error);
        setError(error.response?.data?.message || "Failed to fetch vehicles");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const handleVehicleChange = (e) => {
    setVehicleForm({ ...vehicleForm, [e.target.name]: e.target.value });
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (vehicleForm.name && vehicleForm.manufacturer && vehicleForm.number) {
      setLoading(true);
      try {
        console.log('Adding vehicle with form data:', vehicleForm);
        // Include withCredentials for cookie-based auth as fallback
        const response = await axios.post(`${API_URL}/vehicles`, vehicleForm, { 
          withCredentials: true 
        });
        setVehicles([...vehicles, response.data]);
        setVehicleForm({ name: "", manufacturer: "", number: "" });
        setIsFormOpen(false);
        setError("");
      } catch (error) {
        console.error('Error adding vehicle:', error.response?.data || error);
        setError(error.response?.data?.message || "Failed to add vehicle");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Welcome Section */}
      <div className="bg-[#12343b] text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold">Welcome, {user?.user?.username || "Guest"}!</h1>
        <p className="text-lg mt-2">Your virtual garage is ready for you.</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaCar className="text-blue-500 text-3xl" />
          <div>
            <p className="text-gray-500">Vehicles Added</p>
            <h3 className="text-2xl font-bold">{vehicles.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaCalendarAlt className="text-green-500 text-3xl" />
          <div>
            <p className="text-gray-500">Upcoming Appointments</p>
            <h3 className="text-2xl font-bold">2</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaShoppingCart className="text-yellow-500 text-3xl" />
          <div>
            <p className="text-gray-500">Recent Orders</p>
            <h3 className="text-2xl font-bold">5</h3>
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Your Vehicles</h3>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add Vehicle
          </button>
        </div>

        {vehicles.length === 0 ? (
          <p className="text-gray-500">No vehicles added yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Manufacturer</th>
                <th className="p-3 text-left">Number</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id} className="border-b">
                  <td className="p-3">{vehicle.name}</td>
                  <td className="p-3">{vehicle.manufacturer}</td>
                  <td className="p-3">{vehicle.number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Vehicle Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add a Vehicle</h3>
            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="name" className="text-gray-700 font-medium">Vehicle Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={vehicleForm.name}
                  onChange={handleVehicleChange}
                  placeholder="e.g., My Sedan"
                  className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="manufacturer" className="text-gray-700 font-medium">Manufacturer</label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={vehicleForm.manufacturer}
                  onChange={handleVehicleChange}
                  placeholder="e.g., Toyota"
                  className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="number" className="text-gray-700 font-medium">Vehicle Number (License Plate/VIN)</label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={vehicleForm.number}
                  onChange={handleVehicleChange}
                  placeholder="e.g., ABC123 or 1HGCM82633A004352"
                  className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">Oil Change</td>
              <td className="p-3">2025-03-05</td>
              <td className="p-3">10:30 AM</td>
            </tr>
            <tr>
              <td className="p-3">Tire Rotation</td>
              <td className="p-3">2025-03-12</td>
              <td className="p-3">2:00 PM</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">Car Battery Replacement</td>
              <td className="p-3">$150</td>
              <td className="p-3 text-green-500">Completed</td>
            </tr>
            <tr>
              <td className="p-3">Engine Checkup</td>
              <td className="p-3">$80</td>
              <td className="p-3 text-yellow-500">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;