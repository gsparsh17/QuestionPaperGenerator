import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaSchool, FaSave, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaLinkedin, FaFacebook, FaTwitter, FaClipboardList } from "react-icons/fa";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import bcrypt from "bcryptjs";

const RegisterSchool = ({ fetchSchools }) => {
  const [schoolName, setSchoolName] = useState("");
  const [schoolBoard, setSchoolBoard] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone1, setContactPhone1] = useState("");
  const [contactPhone2, setContactPhone2] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSchoolId = () => `school-${Math.random().toString(36).substr(2, 9)}`;
  const generatePassword = () => Math.random().toString(36).slice(-8); // Generates a random 8-character password

  const handleRegisterSchool = async (e) => {
    e.preventDefault();
    if (!schoolName || !contactEmail || !contactPhone1) {
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
        schoolBoard,
        address: `${addressLine1}, ${addressLine2}`,
        contactEmail,
        contactPhone1,
        contactPhone2,
        website,
        socialMedia: { linkedin, facebook, twitter },
        password: hashedPassword,
        createdAt: new Date(),
      });

      toast.success(`School registered successfully! Login ID: ${uniqueId}`);
      console.log(`Generated password for ${schoolName}:`, password);
      fetchSchools();
      setSchoolName("");
      setSchoolBoard("");
      setAddressLine1("");
      setAddressLine2("");
      setContactEmail("");
      setContactPhone1("");
      setContactPhone2("");
      setWebsite("");
      setLinkedin("");
      setFacebook("");
      setTwitter("");
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
    <div className="flex items-center justify-center min-h-screen ">
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-lg rounded-2xl p-8 sm:p-12 m-8 border border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent flex items-center justify-center">
              <FaSchool className="mr-3" /> Register a School
            </span>
          </h2>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Fill in the details to register your school
          </p>
        </div>
  
        {/* Form */}
        <form onSubmit={handleRegisterSchool} className="space-y-6">
          {/* Input Fields */}
          {[
            { label: "School Name", value: schoolName, setter: setSchoolName, icon: FaSchool, placeholder: "Enter school name" },
            { label: "School Board", value: schoolBoard, setter: setSchoolBoard, icon: FaClipboardList, placeholder: "CBSE, ICSE, etc." },
            { label: "Address Line 1", value: addressLine1, setter: setAddressLine1, icon: FaMapMarkerAlt, placeholder: "Street, area" },
            { label: "Address Line 2", value: addressLine2, setter: setAddressLine2, icon: FaMapMarkerAlt, placeholder: "City, State" },
            { label: "Contact Email", value: contactEmail, setter: setContactEmail, icon: FaEnvelope, placeholder: "Email Address", type: "email" },
            { label: "Contact Phone 1", value: contactPhone1, setter: setContactPhone1, icon: FaPhone, placeholder: "Primary contact", type: "tel" },
            { label: "Contact Phone 2", value: contactPhone2, setter: setContactPhone2, icon: FaPhone, placeholder: "Secondary contact", type: "tel" },
            { label: "Website", value: website, setter: setWebsite, icon: FaGlobe, placeholder: "School website", type: "url" },
          ].map(({ label, value, setter, icon: Icon, placeholder, type = "text" }, idx) => (
            <div key={idx} className="relative">
              <label className="block text-gray-300 text-sm font-semibold mb-2">{label}</label>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg py-3 pl-12 pr-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder={placeholder}
                  required
                />
              </div>
            </div>
          ))}
  
          {/* Social Media */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Social Media Links</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: linkedin, setter: setLinkedin, icon: FaLinkedin, placeholder: "LinkedIn" },
                { value: facebook, setter: setFacebook, icon: FaFacebook, placeholder: "Facebook" },
                { value: twitter, setter: setTwitter, icon: FaTwitter, placeholder: "Twitter" },
              ].map(({ value, setter, icon: Icon, placeholder }, idx) => (
                <div key={idx} className="relative">
                  <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg py-3 pl-12 pr-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
  
          {/* Error Message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
  
          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition duration-200 disabled:bg-gray-600"
              disabled={loading}
            >
              <FaSave className="mr-2" /> {loading ? "Registering..." : "Register School"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}  

export default RegisterSchool;