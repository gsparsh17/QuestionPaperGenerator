import React, { useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import {
  FaQuestion,
  FaUser,
  FaHistory,
  FaUsers,
  FaBook,
  FaFileAlt,
  FaSchool,
  FaChalkboardTeacher,
  FaCode,
  FaCompass,
  FaLightbulb,
  FaUserCircle,
} from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../firebaseConfig"; // Import Firebase auth for logout
import { FaFileCircleQuestion } from "react-icons/fa6";
import { GiNotebook } from "react-icons/gi";
import { LiaSitemapSolid } from "react-icons/lia";

const Sidebar = ({ onFeatureChange }) => {
  const [extended, setExtended] = useState(false);
  const navigate = useNavigate();

  const handleFeatureClick = (feature) => {
    onFeatureChange(feature); // Update the active feature in the parent component
    setExtended(false); // Collapse the sidebar after selecting a feature
  };

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out the user
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setExtended(!extended)}
        className="fixed left-2 sm:left-4 top-5 sm:top-4 text-2xl sm:text-3xl text-indigo-400 hover:text-indigo-300 transition-all duration-300 bg-gray-900 p-1 sm:p-2 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 z-50"
      >
        {extended ? <IoClose /> : <IoMenu />}
      </button>
      {extended && (
        <div className="fixed top-0 left-0 h-full py-4 sm:py-6 px-2 sm:px-4 z-40 w-45% sm:w-64 md:w-72 lg:w-80 xl:w-96 shadow-2xl shadow-indigo-900/50 bg-gradient-to-b from-gray-900 via-indigo-900 to-black overflow-hidden border-r border-indigo-500">
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto sidebar-scroll mt-10 sm:mt-12 pr-1 sm:pr-2">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-indigo-300 mb-2 sm:mb-4">
                  Navigation
                </h3>
                {/* Recent Activities */}
                <motion.button
                  onClick={() => handleFeatureClick("recentActivities")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaHistory className="mr-1 text-xs sm:text-sm" /> Recent Activities
                </motion.button>

                {/* Staff Room */}
                <motion.button
                  onClick={() => handleFeatureClick("staffRoom")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaUsers className="mr-1 text-xs sm:text-sm" /> Staff Room
                </motion.button>

                {/* Library */}
                <motion.button
                  onClick={() => handleFeatureClick("library")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaBook className="mr-1 text-xs sm:text-sm" /> Library
                </motion.button>

                {/* Generated Papers */}
                <motion.button
                  onClick={() => handleFeatureClick("generatedPaper")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFileAlt className="mr-1 text-xs sm:text-sm" /> Generated Papers
                </motion.button>

                {/* School Dashboard */}
                <motion.button
                  onClick={() => handleFeatureClick("schoolDashboard")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSchool className="mr-1 text-xs sm:text-sm" /> School Dashboard
                </motion.button>

                {/* Document QA */}
                <motion.button
                  onClick={() => handleFeatureClick("documentQA")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFileCircleQuestion className="mr-1 text-xs sm:text-sm" /> Document QA
                </motion.button>

                {/* Quiz Generator */}
                <motion.button
                  onClick={() => handleFeatureClick("quizGenerator")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaLightbulb className="mr-1 text-xs sm:text-sm" /> Quiz Generator
                </motion.button>

                {/* Study Plan Generator */}
                <motion.button
                  onClick={() => handleFeatureClick("studyPlanGenerator")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <GiNotebook className="mr-1 text-xs sm:text-sm" /> Study Plan Generator
                </motion.button>

                {/* YouTube Summarizer */}
                <motion.button
                  onClick={() => handleFeatureClick("youtubeSummarizer")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFileAlt className="mr-1 text-xs sm:text-sm" /> YouTube Summarizer
                </motion.button>

                {/* Web Summarizer */}
                <motion.button
                  onClick={() => handleFeatureClick("webSummarizer")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCompass className="mr-1 text-xs sm:text-sm" /> Web Summarizer
                </motion.button>

                {/* Mind Map App */}
                <motion.button
                  onClick={() => handleFeatureClick("mindMapApp")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LiaSitemapSolid className="mr-1 text-xs sm:text-sm" /> Mind Map App
                </motion.button>

                {/* Add Teacher */}
                <motion.button
                  onClick={() => handleFeatureClick("addTeacher")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaChalkboardTeacher className="mr-1 text-xs sm:text-sm" /> Add Teacher
                </motion.button>

                {/* Upload Book */}
                <motion.button
                  onClick={() => handleFeatureClick("uploadBook")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaBook className="mr-1 text-xs sm:text-sm" /> Upload Book
                </motion.button>

                {/* Question Paper Bank */}
                <motion.button
                  onClick={() => handleFeatureClick("questionPaperBank")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFileAlt className="mr-1 text-xs sm:text-sm" /> Question Paper Bank
                </motion.button>

                {/* Generate Exam Paper */}
                <motion.button
                  onClick={() => handleFeatureClick("generatePaper")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaFileAlt className="mr-1 text-xs sm:text-sm" /> Generate Exam Paper
                </motion.button>

                {/* Applications */}
                <motion.button
                  onClick={() => handleFeatureClick("applications")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCode className="mr-1 text-xs sm:text-sm" /> Applications
                </motion.button>
              </div>
            </div>

            {/* Help, Settings, and Sign Out Buttons */}
            <div className="mt-auto space-y-2 sm:space-y-4 pb-2 sm:pb-4 border-t border-gray-700 pt-2 sm:pt-4">
              <motion.button
                onClick={() => navigate("/help")}
                className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                whileTap={{ scale: 0.95 }}
              >
                <FaQuestion className="mr-1 text-xs sm:text-sm" /> Help
              </motion.button>
              <motion.button
                onClick={() => navigate("/settings")}
                className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #C084FC, #EC4899)" }}
                whileTap={{ scale: 0.95 }}
              >
                <IoSettings className="mr-1 text-xs sm:text-sm" /> Settings
              </motion.button>
              <motion.button
                onClick={handleLogout}
                className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-red-400 to-orange-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #F87171, #F97316)" }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                Sign Out
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;