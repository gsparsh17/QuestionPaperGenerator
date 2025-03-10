import React from "react";
import { FaHome, FaSearch, FaSchool, FaBell } from "react-icons/fa";

const Sidebar1 = ({ setActiveSection }) => {
  return (
    <div className="w-64 bg-gray-800 text-slate-300 p-6 h-screen fixed">
      <h2 className="text-2xl font-bold mb-8 flex items-center text-center">
        <FaSchool className="mr-2" /> Admin Dashboard
      </h2>
      <ul>
        <li className="mb-4">
          <button
            onClick={() => setActiveSection("register")}
            className="w-full flex items-center p-3 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <FaHome className="mr-3" /> Register School
          </button>
        </li>
        <li className="mb-4">
          <button
            onClick={() => setActiveSection("search")}
            className="w-full flex items-center p-3 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <FaSearch className="mr-3" /> Search Schools
          </button>
        </li>
        <li className="mb-4">
          <button
            onClick={() => setActiveSection("notifications")}
            className="w-full flex items-center p-3 hover:bg-gray-700 rounded-lg transition duration-200"
          >
            <FaBell className="mr-3" /> Notifications
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar1;