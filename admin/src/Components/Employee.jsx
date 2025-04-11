import { useState, useEffect } from "react";
// Remove ServiceProgressInput since progress isn’t in the schema
// import ServiceProgressInput from "./ServiceProgressInput";

const ADMIN_API_URL = "http://localhost:5001/api/admin/appointments";

const AdminPortal = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const reasons = [
    "Employee Shortage",
    "Workshop Holiday",
    "Equipment Maintenance",
    "Unexpected Closure",
  ];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(ADMIN_API_URL, {
          method: "GET",
          headers: {
            Authorization: "Basic " + btoa("admin:admin123"),
          },
        });
        if (!response.ok) throw new Error("Failed to fetch appointments");
        const data = await response.json();
        setAppointments(
          data.map((appt) => ({
            id: appt._id,
            name: appt.username, // User ID as string (no username)
            service: appt.services.join(", "),
            date: appt.date,
            status: appt.status,
            changeRequested: appt.changeRequested || false,
            changeReason: appt.changeReason || null,
          }))
        );
      } catch (error) {
        console.error("Error fetching appointments:", error);
        alert("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleAccept = async (id) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/accept/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("admin:admin123"),
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to accept appointment: ${errorData.message || response.statusText}`);
      }
      const updatedAppointment = await response.json();
      setAppointments(
        appointments.map((appt) =>
          appt.id === id ? { ...appt, status: updatedAppointment.status } : appt
        )
      );
    } catch (error) {
      console.error("Error accepting appointment:", error);
      alert(error.message);
    }
  };

  const handleInProgress = async (id) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/in-progress/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("admin:admin123"),
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to set In Progress: ${errorData.message || response.statusText}`);
      }
      const updatedAppointment = await response.json();
      setAppointments(
        appointments.map((appt) =>
          appt.id === id ? { ...appt, status: updatedAppointment.status } : appt
        )
      );
    } catch (error) {
      console.error("Error setting In Progress:", error);
      alert(error.message);
    }
  };

  const handleComplete = async (id) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/complete/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("admin:admin123"),
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to complete appointment: ${errorData.message || response.statusText}`);
      }
      const updatedAppointment = await response.json();
      setAppointments(
        appointments.map((appt) =>
          appt.id === id ? { ...appt, status: updatedAppointment.status } : appt
        )
      );
    } catch (error) {
      console.error("Error completing appointment:", error);
      alert(error.message);
    }
  };

  const handleRequestDateChange = async (id, reason) => {
    if (!reason || reason === "") {
      alert("Please select a reason before requesting a date change.");
      return;
    }
    try {
      const response = await fetch(`${ADMIN_API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("admin:admin123"),
        },
        body: JSON.stringify({ changeRequested: true, changeReason: reason }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to request date change: ${errorData.message || response.statusText}`);
      }
      const updatedAppointment = await response.json();
      setAppointments(
        appointments.map((appt) =>
          appt.id === id
            ? {
                ...appt,
                changeRequested: updatedAppointment.changeRequested,
                changeReason: updatedAppointment.changeReason,
              }
            : appt
        )
      );
      alert(`Requested ${updatedAppointment.user} to change their appointment date. Reason: ${reason}`);
    } catch (error) {
      console.error("Error requesting date change:", error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
        <p className="text-gray-500 text-sm sm:text-base">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 tracking-tight text-center sm:text-left">
          Appointment Management Dashboard
        </h1>

        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center text-sm sm:text-base py-8">
            No appointments available at this time.
          </p>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row sm:items-start justify-between p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 mb-4 sm:mb-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    {appointment.name} {/* Displays user ID */}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-700 text-sm sm:text-base">
                      <span className="font-medium text-gray-900">Service:</span>{" "}
                      {appointment.service}
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      <span className="font-medium text-gray-900">Date:</span>{" "}
                      {appointment.date}
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      <span className="font-medium text-gray-900">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                          appointment.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : appointment.status === "Accepted"
                            ? "bg-blue-100 text-blue-800"
                            : appointment.status === "In Progress"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </p>
                    {appointment.changeRequested && appointment.status === "Pending" && (
                      <p className="text-orange-600 text-sm sm:text-base mt-2 flex items-center">
                        <span className="font-medium">Change Requested:</span>{" "}
                        <span className="ml-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                          {appointment.changeReason}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {appointment.status === "Pending" && !appointment.changeRequested && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <select
                        id={`reason-${appointment.id}`}
                        defaultValue=""
                        className="w-full sm:w-48 p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                      >
                        <option value="" disabled>
                          Select Reason
                        </option>
                        {reasons.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() =>
                          handleRequestDateChange(
                            appointment.id,
                            document.getElementById(`reason-${appointment.id}`).value
                          )
                        }
                        className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition duration-300 shadow-sm"
                      >
                        Request Change
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleAccept(appointment.id)}
                    disabled={appointment.status !== "Pending"}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition duration-300 shadow-sm ${
                      appointment.status !== "Pending"
                        ? "bg-blue-600 text-white cursor-not-allowed opacity-60 hover:bg-blue-600"
                        : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }`}
                  >
                    {appointment.status === "Pending" ? "Accept" : "Accepted"}
                  </button>
                  {appointment.status === "Accepted" && (
                    <button
                      onClick={() => handleInProgress(appointment.id)}
                      className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition duration-300 shadow-sm"
                    >
                      In Progress
                    </button>
                  )}
                  {appointment.status === "In Progress" && (
                    <button
                      onClick={() => handleComplete(appointment.id)}
                      className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 shadow-sm"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;