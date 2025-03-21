import React from "react";
import { FaHome, FaSearch, FaSchool, FaBell, FaPaperPlane, FaRegHandPaper, FaPager, FaChartLine, FaBook, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Sidebar1 = ({ setActiveSection, handleLogout }) => {
  const navigate = useNavigate();
  return (
    <div className="w-64 text-slate-300 p-6 h-screen fixed">
      <h2 className="text-2xl font-bold mb-8 flex items-center text-center">
        <FaSchool className="mr-2" /> Admin Dashboard
      </h2>
      <ul>
        {/* Default Dashboard */}
        <li className="mb-4">
          <button
            onClick={() => setActiveSection("dashboard")}
            className="w-full flex items-center p-3 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <FaChartLine className="mr-3" /> Dashboard
          </button>
        </li>

        {/* Register School */}
        <li className="mb-4">
          <button
            onClick={() => setActiveSection("register")}
            className="w-full flex items-center p-3 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <FaHome className="mr-3" /> Register School
          </button>
        </li>

        {/* Search Schools */}
        <li className="mb-4">
          <button
            onClick={() => setActiveSection("search")}
            className="w-full flex items-center p-3 hover:bg-gray-700 bg- rounded-lg transition duration-200"
          >
            <FaSearch className="mr-3" /> Search Schools
          </button>
        </li>

        {/* Notifications */}
        <li className="mb-4">
          <button
            onClick={() => setActiveSection("notifications")}
            className="w-full flex items-center p-3 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <FaBell className="mr-3" /> Notifications
          </button>
        </li>

        {/* Generate Paper */}
        <li className="mb-4">
          <button
            onClick={() => navigate(`/main?schoolId=adminid`)}
            className="w-full flex items-center p-3 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <FaPager className="mr-3" /> Generate Paper
          </button>
        </li>

        <li className="mb-4">
          <button
            onClick={() => setActiveSection("library")}
            className="w-full flex items-center p-3 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <FaBook className="mr-3" /> Library
          </button>
        </li>

        <li className="mb-4">
          <button
            onClick={() => setActiveSection("questionPaperBank")}
            className="w-full flex items-center p-3 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <FaFileAlt className="mr-3" /> Question Paper Bank
          </button>
        </li>

        {/* Logout */}
        <li className="mb-4">
          <button
            onClick={() => handleLogout()}
            className="w-full flex items-center p-3 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <FaRegHandPaper className="mr-3" /> Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar1;