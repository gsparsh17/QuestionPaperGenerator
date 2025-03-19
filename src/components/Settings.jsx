import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaBell, FaLanguage } from "react-icons/fa";

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("English");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Settings</h1>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8"
      >
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <FaUser className="mr-2 text-indigo-400" /> Account Settings
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">Change Password</h3>
            <p className="text-gray-400">
              Update your password to keep your account secure.
            </p>
            <button className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all duration-300">
              Change Password
            </button>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">Delete Account</h3>
            <p className="text-gray-400">
              Permanently delete your account and all associated data.
            </p>
            <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300">
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8"
      >
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <FaBell className="mr-2 text-indigo-400" /> Notification Settings
        </h2>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white">Enable Notifications</h3>
          <p className="text-gray-400">
            Receive notifications for important updates and reminders.
          </p>
          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="form-checkbox h-5 w-5 text-indigo-500 rounded"
            />
            <span className="ml-2 text-gray-400">Enable Notifications</span>
          </label>
        </div>
      </motion.div>

      {/* Language Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <FaLanguage className="mr-2 text-indigo-400" /> Language Settings
        </h2>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white">Select Language</h3>
          <p className="text-gray-400">
            Choose your preferred language for the application.
          </p>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-2 bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;