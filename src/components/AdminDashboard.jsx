import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const AdminDashboard = () => {
  const [schoolName, setSchoolName] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [error, setError] = useState("");
  const [schools, setSchools] = useState([]); // State for schools list
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchools(); // Fetch schools when component mounts
  }, []);

  const generateUniqueId = () => {
    return "school-" + Math.random().toString(36).substr(2, 9);
  };

  const handleRegisterSchool = async (e) => {
    e.preventDefault();
    if (!schoolName) {
      setError("Please enter a school name.");
      return;
    }

    const newUniqueId = generateUniqueId();
    setUniqueId(newUniqueId);

    try {
      await addDoc(collection(db, "schools"), {
        schoolName,
        uniqueId: newUniqueId,
        createdAt: new Date(),
      });

      setError("");
      alert("School registered successfully!");
      fetchSchools(); // Refresh the list after adding a new school
    } catch (err) {
      setError("Failed to register school. Please try again.");
      console.error("Error registering school:", err);
    }
  };

  const fetchSchools = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "schools"));
      const schoolList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSchools(schoolList);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  return (
    <div className="flex-1 min-h-screen relative bg-gradient-to-br from-gray-900 to-black pb-9">
      <div className="flex justify-between w-full text-xl p-5 text-slate-300 sticky top-0 z-40 bg-gray-900/70">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent text-white ml-4 md:ml-16">
          Admin Dashboard
        </h1>
      </div>

      <div className="max-w-[900px] mx-auto max-md:mt-20 px-5">
        <div className="text-[56px] text-slate-300 font-semibold max-md:text-[25px]">
          <p>
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Register a School
            </span>
          </p>
        </div>

        <form onSubmit={handleRegisterSchool} className="mt-5">
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="schoolName">
              School Name
            </label>
            <input
              type="text"
              id="schoolName"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter school name"
            />
          </div>

          {error && <p className="text-red-500 text-xs italic">{error}</p>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Register School
            </button>
          </div>
        </form>

        {uniqueId && (
          <div className="mt-5">
            <p className="text-slate-300">
              School registered successfully! Unique ID:{" "}
              <span className="font-bold">{uniqueId}</span>
            </p>
            <p className="text-slate-300">
              Share this ID with the school to access the main content page.
            </p>
          </div>
        )}
      </div>

      {/* Display registered schools */}
      <div className="max-w-[900px] mx-auto px-5 mt-10">
        <h2 className="text-2xl font-semibold text-slate-300 mb-4">Registered Schools</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 text-slate-300 border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-2 px-4 border border-gray-600">School Name</th>
                <th className="py-2 px-4 border border-gray-600">Unique ID</th>
                <th className="py-2 px-4 border border-gray-600">URL</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-900">
                  <td className="py-2 px-4 border border-gray-600">{school.schoolName}</td>
                  <td className="py-2 px-4 border border-gray-600">{school.uniqueId}</td>
                  <td className="py-2 px-4 border border-gray-600">
                    <a
                      href={`/main?schoolId=${school.uniqueId}`}
                      className="text-blue-400 hover:underline"
                    >
                      Visit School
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
