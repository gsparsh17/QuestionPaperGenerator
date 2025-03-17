import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt } from "react-icons/fa";

// Mock data for leave applications (replace with actual data from your backend)
const mockLeaveApplications = [
  {
    id: 1,
    teacherName: "John Doe",
    leaveType: "Sick Leave",
    startDate: "2023-10-15",
    endDate: "2023-10-17",
    status: "Pending",
  },
  {
    id: 2,
    teacherName: "Jane Smith",
    leaveType: "Vacation Leave",
    startDate: "2023-10-20",
    endDate: "2023-10-25",
    status: "Pending",
  },
  {
    id: 3,
    teacherName: "Alice Johnson",
    leaveType: "Personal Leave",
    startDate: "2023-10-18",
    endDate: "2023-10-19",
    status: "Pending",
  },
];

const Applications = ({ onBack }) => {
  const [leaveApplications, setLeaveApplications] = useState(mockLeaveApplications);

  // Function to handle accepting a leave application
  const handleAccept = (id) => {
    setLeaveApplications((prevApplications) =>
      prevApplications.map((app) =>
        app.id === id ? { ...app, status: "Approved" } : app
      )
    );
    // Add logic to update the backend here
  };

  // Function to handle rejecting a leave application
  const handleReject = (id) => {
    setLeaveApplications((prevApplications) =>
      prevApplications.map((app) =>
        app.id === id ? { ...app, status: "Rejected" } : app
      )
    );
    // Add logic to update the backend here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Leave Applications
      </h1>

      {/* Back Button */}
      {/* <button
        onClick={onBack}
        className="relative text-indigo-500 rounded-full shadow-lg hover:text-white transition-colors duration-200 mb-8"
      >
        &larr; Back
      </button> */}

      {/* Leave Applications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaveApplications.map((application) => (
          <motion.div
            key={application.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col space-y-4">
              {/* Teacher Name */}
              <div className="flex items-center space-x-2">
                <FaUser className="text-indigo-400" />
                <h3 className="text-xl font-semibold text-white">
                  {application.teacherName}
                </h3>
              </div>

              {/* Leave Type */}
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-green-400" />
                <p className="text-gray-400">{application.leaveType}</p>
              </div>

              {/* Leave Dates */}
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-blue-400" />
                <p className="text-gray-400">
                  {application.startDate} to {application.endDate}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <p
                  className={`text-sm font-semibold ${
                    application.status === "Pending"
                      ? "text-yellow-400"
                      : application.status === "Approved"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  Status: {application.status}
                </p>
              </div>

              {/* Action Buttons */}
              {application.status === "Pending" && (
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => handleAccept(application.id)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <FaCheckCircle />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleReject(application.id)}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <FaTimesCircle />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Applications;