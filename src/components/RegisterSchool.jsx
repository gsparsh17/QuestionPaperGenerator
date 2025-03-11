import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaSchool, FaSave } from "react-icons/fa";

const RegisterSchool = ({ fetchSchools }) => {
  const [schoolName, setSchoolName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegisterSchool = async (e) => {
    e.preventDefault();
    if (!schoolName) {
      setError("Please enter a school name.");
      return;
    }

    setLoading(true);

    try {
      // Your logic to register school
      toast.success("School registered successfully!");
      fetchSchools();
    } catch (err) {
      setError("Failed to register school. Please try again.");
      console.error("Error registering school:", err);
      toast.error("Failed to register school.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-2 py-8 sm:py-2 lg:py-2">
      {/* Header Section */}
      <div className="text-4xl sm:text-5xl md:text-6xl text-slate-300 font-semibold mb-12">
        <p>
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <FaSchool className="mr-4" /> Register a School
          </span>
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleRegisterSchool} className="mt-10">
        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="schoolName">
            School Name
          </label>
          <input
            type="text"
            id="schoolName"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 sm:py-3 sm:px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-slate-300 placeholder-gray-400"
            placeholder="Enter school name"
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg focus:outline-none focus:shadow-outline flex items-center transition duration-200"
            disabled={loading}
          >
            <FaSave className="mr-2" /> {loading ? "Registering..." : "Register School"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterSchool;