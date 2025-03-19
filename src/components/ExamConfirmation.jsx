import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react"; // For modal dialog

const ExamConfirmation = ({ onBack }) => {
  const [examRequests, setExamRequests] = useState([]);
  const [schoolId, setSchoolId] = useState(null); // State to store schoolId
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal
  const [selectedRequest, setSelectedRequest] = useState(null); // State to store the selected exam request
  const navigate = useNavigate();
  const location = useLocation();

  // Extract teacherId from URL
  const queryParams = new URLSearchParams(location.search);
  const teacherId = queryParams.get("teacherId");

  // Fetch schoolId using teacherId
  useEffect(() => {
    const fetchSchoolId = async () => {
      if (!teacherId) return;

      try {
        const teacherDocRef = doc(db, "teachers", teacherId);
        const teacherDocSnap = await getDoc(teacherDocRef);

        if (teacherDocSnap.exists()) {
          const teacherData = teacherDocSnap.data();
          setSchoolId(teacherData.schoolId); // Set schoolId from teacher data
        } else {
          console.error("Teacher not found");
        }
      } catch (error) {
        console.error("Error fetching schoolId:", error);
      }
    };

    fetchSchoolId();
  }, [teacherId]);

  // Fetch exam requests for the teacher
  useEffect(() => {
    const fetchExamRequests = async () => {
      if (!teacherId) return;

      setLoading(true);
      try {
        const examsRef = collection(db, `teachers/${teacherId}/Exams`);
        const examsQuery = query(examsRef, where("status", "==", "Pending"));
        const examsSnapshot = await getDocs(examsQuery);

        const requests = examsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExamRequests(requests);
      } catch (error) {
        console.error("Error fetching exam requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamRequests();
  }, [teacherId]);

  // Handle "Create Exam" button click
  const handleCreateExamClick = (request) => {
    setSelectedRequest(request); // Store the selected request
    setIsModalOpen(true); // Open the modal
  };

  // Handle modal choice (Manual or AI)
  const handleModalChoice = (choice) => {
    if (!schoolId || !selectedRequest) return;

    if (choice === "AI") {
      // Redirect to QuestionPaperGenerator (AI)
      navigate(
        `/question-paper-generator?schoolId=${schoolId}&teacherId=${teacherId}&class=${selectedRequest.class}&subject=${selectedRequest.subject}&requestId=${selectedRequest.id}`
      );
    } else if (choice === "Manual") {
      // Redirect to ManualPaperEditor
      navigate(
        `/manual-paper-editor?schoolId=${schoolId}&teacherId=${teacherId}&class=${selectedRequest.class}&subject=${selectedRequest.subject}&requestId=${selectedRequest.id}`
      );
    }

    setIsModalOpen(false); // Close the modal
  };

  if (loading) {
    return <div className="text-white text-center py-8">Loading exam requests...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Exam Confirmation</h1>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="relative text-indigo-500 rounded-full shadow-lg hover:text-white transition-colors duration-200 mb-8"
      >
        &larr; Back
      </button>

      {/* Exam Requests Table */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4">Pending Exam Requests</h2>
        {examRequests.length === 0 ? (
          <p className="text-white text-center">No pending exam requests.</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr>
                <th className="py-2">Subject</th>
                <th className="py-2">Class</th>
                <th className="py-2">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {examRequests.map((request) => (
                <tr key={request.id} className="border-b border-gray-700">
                  <td className="py-2 text-center">{request.subject}</td>
                  <td className="py-2 text-center">{request.class}</td>
                  <td className="py-2 text-center">
                    <span className="px-2 py-1 rounded-full bg-yellow-500 text-sm">
                      {request.status}
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCreateExamClick(request)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Create Exam
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for choosing Manual or AI */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      >
        <Dialog.Panel className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
          <Dialog.Title className="text-2xl font-semibold text-white mb-4">
            Choose an Option
          </Dialog.Title>
          <Dialog.Description className="text-gray-400 mb-6">
            Do you want to set the paper pattern manually or generate it using AI?
          </Dialog.Description>
          <div className="flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleModalChoice("Manual")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Manual
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleModalChoice("AI")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              AI
            </motion.button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default ExamConfirmation;