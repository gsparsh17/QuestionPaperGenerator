import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaSchool, FaSave } from "react-icons/fa";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import bcrypt from "bcryptjs";

const RegisterSchool = ({ fetchSchools }) => {
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSchoolId = () => `school-${Math.random().toString(36).substr(2, 9)}`;
  const generatePassword = () => Math.random().toString(36).slice(-8); // Generates a random 8-character password

  const handleRegisterSchool = async (e) => {
    e.preventDefault();
    if (!schoolName || !contactEmail || !contactPhone) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const uniqueId = generateSchoolId();
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await addDoc(collection(db, "schools"), {
        uniqueId,
        schoolName,
        address: schoolAddress,
        contactEmail,
        contactPhone,
        password: hashedPassword,
        createdAt: new Date(), // Save the hashed password for security
      });

      toast.success(`School registered successfully! Login ID: ${schoolId}`);
      console.log(`Generated password for ${schoolName}:`, password);
      fetchSchools();
      setSchoolName("");
      setSchoolAddress("");
      setContactEmail("");
      setContactPhone("");
      setError("");
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
      <div className="text-4xl sm:text-5xl md:text-6xl text-slate-300 font-semibold mb-12">
        <p>
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <FaSchool className="mr-4" /> Register a School
          </span>
        </p>
      </div>

      <form onSubmit={handleRegisterSchool} className="mt-10">
        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-bold mb-2">School Name</label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="input-field"
            placeholder="Enter school name"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-bold mb-2">Address</label>
          <input
            type="text"
            value={schoolAddress}
            onChange={(e) => setSchoolAddress(e.target.value)}
            className="input-field"
            placeholder="Enter school address"
          />
        </div>

        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-bold mb-2">Contact Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="input-field"
            placeholder="Enter contact email"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-bold mb-2">Contact Phone</label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="input-field"
            placeholder="Enter contact phone"
            required
          />
        </div>

        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

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
