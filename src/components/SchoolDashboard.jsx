import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const SchoolDashboard = () => {
  const { uniqueId } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        // Fetch school details
        const schoolsRef = collection(db, "schools");
        const q = query(schoolsRef, where("uniqueId", "==", uniqueId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setSchool(querySnapshot.docs[0].data()); // Take the first matching document
        } else {
          console.log("School not found");
        }

        // Fetch generated papers for the school
        const papersQuery = query(collection(db, "papers"), where("schoolId", "==", uniqueId));
        const papersSnapshot = await getDocs(papersQuery);
        const papersList = papersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPapers(papersList);
      } catch (error) {
        console.error("Error fetching school details or papers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolDetails();
  }, [uniqueId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <p className="text-slate-300 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <p className="text-red-400 text-lg">School not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10 sm:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">{school.schoolName} Dashboard</h1>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">School Details</h2>
          <p className="text-gray-300"><strong>Unique ID:</strong> {school.uniqueId}</p>
          <p className="text-gray-300">
            <strong>Created At:</strong> {school.createdAt?.toDate().toLocaleString()}
          </p>
          <button
            onClick={() => navigate(`/main?schoolId=${school.uniqueId}`)}
            className="mt-4 px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white font-semibold transition"
          >
            Open School Page
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Generated Papers</h2>
          {papers.length > 0 ? (
            <ul className="space-y-4">
              {papers.map((paper) => (
                <li key={paper.id} className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300"><strong>Paper Name:</strong> {paper.paperName}</p>
                  <p className="text-gray-300">
                    <strong>Created At:</strong> {paper.createdAt?.toDate().toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No papers found for this school.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
