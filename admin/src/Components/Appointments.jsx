import { useState } from "react";
import ServiceProgressInput from "./ServiceProgressInput"; // Adjust the import path as needed

const AdminPortal = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      name: "John Doe",
      service: "Haircut",
      date: "2025-03-25",
      accepted: false,
      changeRequested: false,
      changeReason: null,
      progress: null,
    },
    {
      id: 2,
      name: "Jane Smith",
      service: "Massage",
      date: "2025-03-26",
      accepted: false,
      changeRequested: false,
      changeReason: null,
      progress: null,
    },
    {
      id: 3,
      name: "Alex Brown",
      service: "Manicure",
      date: "2025-03-27",
      accepted: false,
      changeRequested: false,
      changeReason: null,
      progress: null,
    },
  ]);

  const reasons = [
    "Employee Shortage",
    "Workshop Holiday",
    "Equipment Maintenance",
    "Unexpected Closure",
  ];

  const handleAccept = (id) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              accepted: true,
              progress: appointment.progress || { percentage: 0, note: "Service started" }, // Initialize to 0% if no prior progress
            }
          : appointment
      )
    );
  };

  const handleRequestDateChange = (id, reason) => {
    if (!reason || reason === "") {
      alert("Please select a reason before requesting a date change.");
      return;
    }
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === id
          ? { ...appointment, changeRequested: true, changeReason: reason }
          : appointment
      )
    );
    alert(
      `Requested ${appointments.find((a) => a.id === id).name} to change their appointment date. Reason: ${reason}`
    );
  };

  const handleProgressUpdate = (id, progressUpdate) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === id
          ? { ...appointment, progress: progressUpdate }
          : appointment
      )
    );
    alert(
      `Progress update sent to ${appointments.find((a) => a.id === id).name}: ${progressUpdate.percentage}% - ${progressUpdate.note}`
    );
  };

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
                    {appointment.name}
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
                    {appointment.changeRequested && !appointment.accepted && (
                      <p className="text-orange-600 text-sm sm:text-base mt-2 flex items-center">
                        <span className="font-medium">Status:</span>{" "}
                        <span className="ml-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                          Change Requested
                          {appointment.changeReason && (
                            <span>
                              {" - "}
                              <span className="italic">
                                {appointment.changeReason}
                              </span>
                            </span>
                          )}
                        </span>
                      </p>
                    )}
                    {appointment.accepted && appointment.progress && (
                      <div className="mt-2">
                        <p className="text-blue-600 text-sm sm:text-base flex items-center">
                          <span className="font-medium">Progress:</span>{" "}
                          <span className="ml-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                            {appointment.progress.percentage}%
                          </span>
                        </p>
                        <p className="text-gray-600 text-sm sm:text-base mt-1">
                          <span className="font-medium">Note:</span>{" "}
                          {appointment.progress.note}
                        </p>
                      </div>
                    )}
                  </div>
                  <ServiceProgressInput
                    appointmentId={appointment.id}
                    onProgressUpdate={handleProgressUpdate}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {!appointment.accepted && !appointment.changeRequested && (
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
                            document.getElementById(`reason-${appointment.id}`)
                              .value
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
                    disabled={appointment.accepted}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition duration-300 shadow-sm ${
                      appointment.accepted
                        ? "bg-green-600 text-white cursor-not-allowed opacity-60 hover:bg-green-600"
                        : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }`}
                  >
                    {appointment.accepted ? "Accepted" : "Accept"}
                  </button>
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