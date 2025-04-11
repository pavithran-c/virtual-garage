import React from "react";

const ServiceProgressInput = ({ appointmentId, onProgressUpdate }) => {
  const handleProgress = (status) => {
    const progressUpdate = {
      status: status, // "In Progress" or "Completed"
    };
    onProgressUpdate(appointmentId, progressUpdate);
  };

  return (
    <div className="mt-4 w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => handleProgress("In Progress")}
          className="w-full sm:w-auto px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition duration-300 shadow-sm"
        >
          Mark as In Progress
        </button>
        <button
          onClick={() => handleProgress("Completed")}
          className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 shadow-sm"
        >
          Mark as Completed
        </button>
      </div>
    </div>
  );
};

export default ServiceProgressInput;