import React, { useState } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";

const SearchSchools = ({ schools }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSchools = schools.filter(
    (school) =>
      (school.schoolName && school.schoolName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (school.uniqueId && school.uniqueId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-[900px] mx-auto px-5 mt-10">
      <h2 className="text-2xl font-semibold text-slate-300 mb-6 flex items-center">
        <FaSearch className="mr-2" /> Registered Schools
      </h2>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by school name or ID"
          className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-slate-300 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-gray-800 text-slate-300">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-4 px-6 text-left">School Name</th>
              <th className="py-4 px-6 text-left">Unique ID</th>
              <th className="py-4 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchools.map((school) => (
              <tr key={school.id} className="hover:bg-gray-900 transition duration-200">
                <td className="py-4 px-6 border-b border-gray-700">{school.schoolName}</td>
                <td className="py-4 px-6 border-b border-gray-700">{school.uniqueId}</td>
                <td className="py-4 px-6 border-b border-gray-700">
                  <button
                    onClick={() => handleEditSchool(school.id, prompt("Enter new school name:"))}
                    className="text-blue-400 hover:text-blue-500 mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteSchool(school.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <FaTrash />
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