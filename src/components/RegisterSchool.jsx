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
    <div className="max-w-[900px] mx-auto max-md:mt-20 px-5">
      <div className="text-[56px] text-slate-300 font-semibold max-md:text-[25px] mb-8">
        <p>
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <FaSchool className="mr-4" /> Register a School
          </span>
        </p>
      </div>

      <form onSubmit={handleRegisterSchool} className="mt-5">
        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="schoolName">
            School Name
          </label>
          <input
            type="text"
            id="schoolName"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-slate-300"
            placeholder="Enter school name"
          />
        </div>

        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline flex items-center transition duration-200"
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