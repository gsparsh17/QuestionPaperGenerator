import React, { useState } from "react";
import { FaEdit, FaTrash, FaSearch, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SearchSchools = ({ schools }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredSchools = schools.filter(
    (school) =>
      (school.schoolName && school.schoolName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (school.uniqueId && school.uniqueId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEditSchool = (id, newName) => {
    console.log(`Edit school with ID ${id} to new name: ${newName}`);
  };

  const handleDeleteSchool = (id) => {
    console.log(`Delete school with ID ${id}`);
  };

  const handleViewDashboard = (uniqueId) => {
    window.open(`/school-dashboard/${uniqueId}`,"_blank");
  };

  return (
    <div className="max-w-[900px] mx-auto px-2 sm:px-6 lg:px-8 mt-10">
      <div className="text-4xl sm:text-5xl md:text-6xl text-slate-300 font-semibold mb-8">
        <p>
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <FaSearch className="mr-4" /> Search School
          </span>
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by school name or ID"
          className="w-full p-2 sm:p-3 rounded-lg border border-gray-600 bg-gray-700 text-slate-300 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg text-sm sm:text-lg">
        <table className="min-w-full bg-gray-800 text-slate-300">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-3 px-4 sm:py-4 sm:px-6 text-left">School Name</th>
              <th className="py-3 px-4 sm:py-4 sm:px-6 text-left">Unique ID</th>
              <th className="py-3 px-4 sm:py-4 sm:px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchools.map((school) => (
              <tr key={school.id} className="hover:bg-gray-900 transition duration-200">
                <td className="py-3 px-4 sm:py-4 sm:px-6 border-b border-gray-700">{school.schoolName}</td>
                <td className="py-3 px-4 sm:py-4 sm:px-6 border-b border-gray-700">{school.uniqueId}</td>
                <td className="py-3 px-4 sm:py-4 sm:px-6 border-b border-gray-700">
                  <button
                    onClick={() => handleEditSchool(school.id, prompt("Enter new school name:"))}
                    className="text-blue-400 hover:text-blue-500 mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteSchool(school.id)}
                    className="text-red-400 hover:text-red-500 mr-4"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => handleViewDashboard(school.uniqueId)}
                    className="text-green-400 hover:text-green-500"
                  >
                    <FaExternalLinkAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchSchools;