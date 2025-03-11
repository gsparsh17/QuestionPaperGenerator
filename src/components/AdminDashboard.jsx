// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { db } from "../firebaseConfig";
// import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const AdminDashboard = () => {
//   const [schoolName, setSchoolName] = useState("");
//   const [uniqueId, setUniqueId] = useState("");
//   const [error, setError] = useState("");
//   const [schools, setSchools] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [schoolsPerPage] = useState(5); // Number of schools per page
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchSchools();
//   }, []);

//   const generateUniqueId = () => {
//     return "school-" + Math.random().toString(36).substr(2, 9);
//   };

//   const handleRegisterSchool = async (e) => {
//     e.preventDefault();
//     if (!schoolName) {
//       setError("Please enter a school name.");
//       return;
//     }

//     setLoading(true);
//     const newUniqueId = generateUniqueId();
//     setUniqueId(newUniqueId);

//     try {
//       await addDoc(collection(db, "schools"), {
//         schoolName,
//         uniqueId: newUniqueId,
//         createdAt: new Date(),
//       });

//       setError("");
//       setSchoolName("");
//       toast.success("School registered successfully!");
//       fetchSchools();
//     } catch (err) {
//       setError("Failed to register school. Please try again.");
//       console.error("Error registering school:", err);
//       toast.error("Failed to register school.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSchools = async () => {
//     setLoading(true);
//     try {
//       const querySnapshot = await getDocs(collection(db, "schools"));
//       const schoolList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setSchools(schoolList);
//     } catch (error) {
//       console.error("Error fetching schools:", error);
//       toast.error("Failed to fetch schools.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteSchool = async (id) => {
//     if (window.confirm("Are you sure you want to delete this school?")) {
//       try {
//         await deleteDoc(doc(db, "schools", id));
//         toast.success("School deleted successfully!");
//         fetchSchools();
//       } catch (error) {
//         console.error("Error deleting school:", error);
//         toast.error("Failed to delete school.");
//       }
//     }
//   };

//   const handleEditSchool = async (id, updatedName) => {
//     try {
//       await updateDoc(doc(db, "schools", id), {
//         schoolName: updatedName,
//       });
//       toast.success("School updated successfully!");
//       fetchSchools();
//     } catch (error) {
//       console.error("Error updating school:", error);
//       toast.error("Failed to update school.");
//     }
//   };

//   // Search and filter schools
//   const filteredSchools = schools.filter(
//     (school) =>
//       school.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       school.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Pagination logic
//   const indexOfLastSchool = currentPage * schoolsPerPage;
//   const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
//   const currentSchools = filteredSchools.slice(indexOfFirstSchool, indexOfLastSchool);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="flex-1 min-h-screen relative bg-gradient-to-br from-gray-900 to-black pb-9">
//       <ToastContainer />
//       <div className="flex justify-between w-full text-xl p-5 text-slate-300 sticky top-0 z-40 bg-gray-900/70">
//         <h1 className="text-2xl font-bold bg-clip-text text-transparent text-white ml-4 md:ml-16">
//           Admin Dashboard
//         </h1>
//       </div>

//       <div className="max-w-[900px] mx-auto max-md:mt-20 px-5">
//         <div className="text-[56px] text-slate-300 font-semibold max-md:text-[25px]">
//           <p>
//             <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
//               Register a School
//             </span>
//           </p>
//         </div>

//         <form onSubmit={handleRegisterSchool} className="mt-5">
//           <div className="mb-4">
//             <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="schoolName">
//               School Name
//             </label>
//             <input
//               type="text"
//               id="schoolName"
//               value={schoolName}
//               onChange={(e) => setSchoolName(e.target.value)}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               placeholder="Enter school name"
//             />
//           </div>

//           {error && <p className="text-red-500 text-xs italic">{error}</p>}

//           <div className="flex items-center justify-between">
//             <button
//               type="submit"
//               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//               disabled={loading}
//             >
//               {loading ? "Registering..." : "Register School"}
//             </button>
//           </div>
//         </form>

//         {uniqueId && (
//           <div className="mt-5">
//             <p className="text-slate-300">
//               School registered successfully! Unique ID:{" "}
//               <span className="font-bold">{uniqueId}</span>
//             </p>
//             <p className="text-slate-300">
//               Share this ID with the school to access the main content page.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Display registered schools */}
//       <div className="max-w-[900px] mx-auto px-5 mt-10">
//         <h2 className="text-2xl font-semibold text-slate-300 mb-4">Registered Schools</h2>

//         {/* Search Bar */}
//         <div className="mb-4">
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search by school name or ID"
//             className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-slate-300"
//           />
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-gray-800 text-slate-300 border border-gray-700">
//             <thead>
//               <tr className="bg-gray-700">
//                 <th className="py-2 px-4 border border-gray-600">School Name</th>
//                 <th className="py-2 px-4 border border-gray-600">Unique ID</th>
//                 <th className="py-2 px-4 border border-gray-600">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentSchools.map((school) => (
//                 <tr key={school.id} className="hover:bg-gray-900">
//                   <td className="py-2 px-4 border border-gray-600">{school.schoolName}</td>
//                   <td className="py-2 px-4 border border-gray-600">{school.uniqueId}</td>
//                   <td className="py-2 px-4 border border-gray-600">
//                     <button
//                       onClick={() => handleEditSchool(school.id, prompt("Enter new school name:"))}
//                       className="text-blue-400 hover:underline mr-2"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDeleteSchool(school.id)}
//                       className="text-red-400 hover:underline"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="flex justify-center mt-4">
//           {Array.from({ length: Math.ceil(filteredSchools.length / schoolsPerPage) }, (_, i) => (
//             <button
//               key={i + 1}
//               onClick={() => paginate(i + 1)}
//               className={`mx-1 px-3 py-1 rounded ${
//                 currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-700 text-slate-300"
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Sidebar1 from "./Sidebar1";
import RegisterSchool from "./RegisterSchool";
import SearchSchools from "./SearchSchools";
import NotificationsBar from "./NotificationsBar";
import { FaBars } from "react-icons/fa";

const AdminDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [activeSection, setActiveSection] = useState("register");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-slate-300 p-2 lg:pt-2 pt-10 transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        <Sidebar1 setActiveSection={setActiveSection} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 lg:ml-32">
        {/* Hamburger Menu Button (Visible on Mobile) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gray-700 rounded-lg text-slate-300 hover:bg-gray-600 transition duration-200"
        >
          <FaBars className="text-xl" />
        </button>

        {/* Render Active Section */}
        {activeSection === "register" && <RegisterSchool fetchSchools={fetchSchools} />}
        {activeSection === "search" && <SearchSchools schools={schools} />}
      </div>

      {/* Notifications Bar */}
      <NotificationsBar />
    </div>
  );
};

export default AdminDashboard;