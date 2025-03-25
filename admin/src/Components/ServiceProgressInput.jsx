import React, { useState } from "react";

const ServiceProgressInput = ({ appointmentId, initialProgress, onProgressUpdate }) => {
  const [progressPercentage, setProgressPercentage] = useState(initialProgress?.percentage || "");
  const [progressNote, setProgressNote] = useState(initialProgress?.note || "");

  const handleSubmit = () => {
    if (!progressPercentage) {
      alert("Please enter a progress percentage.");
      return;
    }
    const percentage = parseInt(progressPercentage);
    if (isNaN(percentage) || percentage < initialProgress.percentage || percentage > 100) {
      alert(`Please enter a valid percentage between ${initialProgress.percentage} and 100.`);
      return;
    }
    const progressUpdate = {
      percentage: percentage,
      note: progressNote || "In progress",
    };
    onProgressUpdate(appointmentId, progressUpdate);
  };

  return (
    <div className="mt-4 w-full">
      <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
        Service Progress
      </h4>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="number"
            value={progressPercentage}
            onChange={(e) => setProgressPercentage(e.target.value)}
            placeholder={`Enter % (${initialProgress.percentage}-100)`}
            min={initialProgress.percentage}
            max="100"
            className="w-full sm:w-32 p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
          <span className="text-sm sm:text-base text-gray-600">%</span>
        </div>
        <textarea
          value={progressNote}
          onChange={(e) => setProgressNote(e.target.value)}
          placeholder="Add a note (e.g., 'Waiting for parts')"
          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y min-h-[80px]"
        />
        <button
          onClick={handleSubmit}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 shadow-sm"
        >
          Update Progress
        </button>
      </div>
    </div>
  );
};

export default ServiceProgressInput;