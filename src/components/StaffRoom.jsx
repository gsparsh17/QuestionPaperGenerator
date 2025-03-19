import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FaUser, FaEnvelope, FaBook, FaSearch, FaPlus } from "react-icons/fa";

const StaffRoom = ({ onBack }) => {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", subject: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // Extract schoolId from the current URL
  const queryParams = new URLSearchParams(location.search);
  const schoolId = queryParams.get("schoolId");

  useEffect(() => {
    const fetchTeachers = async () => {
      const teachersRef = collection(db, "teachers");
      const teachersSnapshot = await getDocs(teachersRef);
      const teachersList = teachersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeachers(teachersList);
    };
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "teachers"), newTeacher);
      alert("Teacher added successfully!");
      setNewTeacher({ name: "", email: "", subject: "" });
      // Refresh the teachers list
      const teachersRef = collection(db, "teachers");
      const teachersSnapshot = await getDocs(teachersRef);
      const teachersList = teachersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeachers(teachersList);
    } catch (error) {
      console.error("Error adding teacher:", error);
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenTeacherDashboard = (teacherId) => {
    // Construct the URL for the teacher's dashboard
    const url = `/main/teacher-dashboard?schoolId=${schoolId}&teacherId=${teacherId}`;
    window.open(url, "_blank"); // Navigate to the teacher's dashboard
  };

  const handleOpenTeacherDetails = (teacherId) => {
    // Navigate to the Teacher Details Page
    const url = `/main/teacher-details?schoolId=${schoolId}&teacherId=${teacherId}`;
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Staff Room</h1>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center bg-gray-800 p-3 rounded-lg shadow-lg">
          <FaSearch className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-white focus:outline-none"
          />
        </div>
      </motion.div>

      {/* Teachers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
      >
        <h2 className="text-2xl font-semibold text-white mb-6">Teachers</h2>
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-4 mb-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <FaUser className="text-indigo-400 text-xl" />
                <div>
                  <p className="text-white font-medium">{teacher.name}</p>
                  <p className="text-sm text-gray-400">{teacher.email}</p>
                  <p className="text-sm text-gray-400">{teacher.subject}</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenTeacherDashboard(teacher.id)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all duration-300"
              >
                Open Dashboard
              </button>
              <button
            onClick={() => handleOpenTeacherDetails(teacher.id)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 ml-2"
                >
             View Details
            </button>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">No teachers found</p>
        )}
      </motion.div>

      {/* Add Teacher Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-white mb-6">Add Teacher</h2>
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div className="flex items-center bg-gray-700 p-3 rounded-lg">
            <FaUser className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Name"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
              className="w-full bg-transparent text-white focus:outline-none"
              required
            />
          </div>
          <div className="flex items-center bg-gray-700 p-3 rounded-lg">
            <FaEnvelope className="text-gray-400 mr-3" />
            <input
              type="email"
              placeholder="Email"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              className="w-full bg-transparent text-white focus:outline-none"
              required
            />
          </div>
          <div className="flex items-center bg-gray-700 p-3 rounded-lg">
            <FaBook className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Subject"
              value={newTeacher.subject}
              onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
              className="w-full bg-transparent text-white focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center"
          >
            <FaPlus className="mr-2" />
            Add Teacher
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default StaffRoom;