import React from "react";
import { motion } from "framer-motion";
import { FaQuestionCircle, FaEnvelope, FaPhone } from "react-icons/fa";

const Help = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Help & Support</h1>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8"
      >
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <FaQuestionCircle className="mr-2 text-indigo-400" /> Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">How do I reset my password?</h3>
            <p className="text-gray-400">
              Go to the login page and click on "Forgot Password." Follow the instructions sent to your email.
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">How do I contact support?</h3>
            <p className="text-gray-400">
              You can reach out to us via email at support@imapmystudy.com or call us at +1 (123) 456-7890.
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">Where can I find my generated papers?</h3>
            <p className="text-gray-400">
              Navigate to the "Generated Papers" section in the sidebar to view and download your papers.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <FaEnvelope className="mr-2 text-indigo-400" /> Contact Us
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">Email Support</h3>
            <p className="text-gray-400">support@imapmystudy.com</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">Phone Support</h3>
            <p className="text-gray-400">+1 (123) 456-7890</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">Office Hours</h3>
            <p className="text-gray-400">Monday - Friday, 9:00 AM - 5:00 PM</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Help;