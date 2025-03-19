import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AddAdminUser from "./AddAdminUser";
import AddTeacher from "./AddTeacher";
import UploadBook from "./UploadBook";
import { FaChalkboardTeacher, FaSchool, FaFileAlt, FaBook, FaUserPlus, FaUpload } from "react-icons/fa";

const DefaultDashboard = () => {
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalSchools, setTotalSchools] = useState(0);
  const [totalPapers, setTotalPapers] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const teachersSnapshot = await getDocs(collection(db, "teachers"));
      setTotalTeachers(teachersSnapshot.size);

      const schoolsSnapshot = await getDocs(collection(db, "schools"));
      setTotalSchools(schoolsSnapshot.size);

      const papersSnapshot = await getDocs(collection(db, "questionPapers"));
      setTotalPapers(papersSnapshot.size);

      const booksSnapshot = await getDocs(collection(db, "books"));
      setTotalBooks(booksSnapshot.size);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-8 text-slate-100">Central Admin Itawa</h2>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setActiveSection("dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveSection("addAdmin")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
        >
          Add Admin
        </button>
        <button
          onClick={() => setActiveSection("addTeacher")}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
        >
          Add Teacher
        </button>
        <button
          onClick={() => setActiveSection("uploadBook")}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition duration-200"
        >
          Upload Book
        </button>
      </div>

      {/* Render Active Section */}
      {activeSection === "dashboard" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-6 rounded-lg text-white hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <FaChalkboardTeacher className="text-4xl mr-4" />
              <h3 className="text-xl font-semibold">Total Teachers</h3>
            </div>
            <p className="text-4xl font-bold">{totalTeachers}</p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-500 p-6 rounded-lg text-white hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <FaSchool className="text-4xl mr-4" />
              <h3 className="text-xl font-semibold">Total Schools</h3>
            </div>
            <p className="text-4xl font-bold">{totalSchools}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-500 p-6 rounded-lg text-white hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <FaFileAlt className="text-4xl mr-4" />
              <h3 className="text-xl font-semibold">Total Papers</h3>
            </div>
            <p className="text-4xl font-bold">{totalPapers}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-orange-500 p-6 rounded-lg text-white hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <FaBook className="text-4xl mr-4" />
              <h3 className="text-xl font-semibold">Total Books</h3>
            </div>
            <p className="text-4xl font-bold">{totalBooks}</p>
          </div>                              
        </div>
      )}

      {activeSection === "addAdmin" && <AddAdminUser />}
      {activeSection === "addTeacher" && <AddTeacher fetchData={fetchData} />}
      {activeSection === "uploadBook" && <UploadBook fetchData={fetchData} />}
    </div>
  );
};

export default DefaultDashboard;