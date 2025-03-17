import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const GeneratedPapers = () => {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    const fetchPapers = async () => {
      const papersRef = collection(db, "questionPapers");
      const papersSnapshot = await getDocs(papersRef);
      const papersList = papersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(papersList);
    };
    fetchPapers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Generated Papers</h1>

      {/* Papers List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {papers.length > 0 ? (
          papers.map((paper) => (
            <div key={paper.id} className="p-3 mb-3 border-b border-gray-200 hover:bg-gray-50 transition-all duration-300">
              <p className="text-gray-800 font-medium">{paper.title}</p>
              <p className="text-sm text-gray-500">{paper.subject} - {paper.class}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No papers found</p>
        )}
      </div>
    </div>
  );
};

export default GeneratedPapers;