import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { motion } from "framer-motion";

const SetExams = ({ schoolId, onBack }) => {
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examRequests, setExamRequests] = useState([]); // State to store exam requests

  // Fetch teachers and their associated classes based on selected classes
  useEffect(() => {
    const fetchTeachers = async () => {
      if (selectedClasses.length === 0) return;

      setLoading(true);
      try {
        // Fetch all teachers for the school
        const teachersQuery = query(
          collection(db, "teachers"),
          where("schoolId", "==", schoolId)
        );
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersData = [];

        // Iterate through each teacher
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherId = teacherDoc.id;
          const teacherData = teacherDoc.data();

          // Fetch the teacher's subjects collection
          const subjectsRef = collection(db, `teachers/${teacherId}/subjects`);
          const subjectsSnapshot = await getDocs(subjectsRef);

          // Iterate through each subject
          for (const subjectDoc of subjectsSnapshot.docs) {
            const subjectData = subjectDoc.data();
            const classes = subjectData.classes || [];

            // Check if any of the selected classes are in this subject's classes array
            const hasSelectedClass = selectedClasses.some((cls) =>
              classes.includes(cls)
            );

            if (hasSelectedClass) {
              teachersData.push({
                id: teacherId,
                name: teacherData.name,
                subject: subjectData.subject, // Assuming subjectName is the field for subject name
                classes: classes,
              });
            }
          }
        }

        setTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [selectedClasses, schoolId]);

  // Fetch exam requests for the school
  useEffect(() => {
    const fetchExamRequests = async () => {
      try {
        const examRequestsQuery = query(
          collection(db, "schools", schoolId, "examRequests")
        );
        const examRequestsSnapshot = await getDocs(examRequestsQuery);
        const requests = examRequestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExamRequests(requests);
      } catch (error) {
        console.error("Error fetching exam requests:", error);
      }
    };

    fetchExamRequests();
  }, [schoolId]);

  // Handle class selection
  const handleClassSelection = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedClasses([...selectedClasses, value]);
    } else {
      setSelectedClasses(selectedClasses.filter((cls) => cls !== value));
    }
  };

  // Handle sending exam notifications
  const handleSendNotifications = async () => {
    try {
      for (const teacher of teachers) {
        // Iterate through each selected class
        for (const selectedClass of selectedClasses) {
          // Check if the teacher teaches this class for the subject
          if (teacher.classes.includes(selectedClass)) {
            const examRequest = {
              schoolId,
              class: selectedClass, // Single class per request
              subject: teacher.subject, // Single subject per request
              status: "Pending",
              timestamp: new Date().toISOString(),
            };

            // Add exam request to the teacher's Exams collection
            await addDoc(collection(db, `teachers/${teacher.id}/Exams`), examRequest);

            // Also add the exam request to the school's examRequests collection
            await addDoc(collection(db, "schools", schoolId, "examRequests"), {
              teacherId: teacher.id,
              teacherName: teacher.name,
              ...examRequest,
            });
          }
        }
      }
      alert("Exam notifications sent successfully!");

      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error("Error sending notifications:", error);
      alert("Failed to send notifications.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Set Exams</h1>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="relative text-indigo-500 rounded-full shadow-lg hover:text-white transition-colors duration-200 mb-8"
      >
        &larr; Back
      </button>

      {/* Class Selection */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Select Classes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
            "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
            "Class 11", "Class 12"
          ].map((cls) => (
            <label key={cls} className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                value={cls}
                onChange={handleClassSelection}
                className="form-checkbox h-5 w-5 text-indigo-600 rounded"
              />
              <span>{cls}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Teachers Table */}
      {loading ? (
        <div className="text-white text-center py-8">Loading teachers...</div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">Associated Teachers</h2>
          <table className="w-full text-white">
            <thead>
              <tr>
                <th className="py-2">Teacher Name</th>
                <th className="py-2">Subject</th>
                <th className="py-2">Classes</th>
              </tr>
            </thead>
            <tbody>
            {teachers.map((teacher) => {
  // Filter selectedClasses to only include classes that match the teacher's classes
  const matchingClasses = selectedClasses.filter((cls) =>
    teacher.classes.includes(cls)
  );

  return (
    <tr key={teacher.id} className="border-b border-gray-700">
      <td className="py-2 text-center">{teacher.name}</td>
      <td className="py-2 text-center">{teacher.subject}</td>
      <td className="py-2 text-center">
        {matchingClasses.length > 0 ? matchingClasses.join(", ") : "No matching classes"}
      </td>
    </tr>
  );
})}
            </tbody>
          </table>
        </div>
      )}

      {/* Send Notifications Button */}
      {teachers.length > 0 && (
        <div className="flex justify-end mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendNotifications}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Send Notifications
          </motion.button>
        </div>
      )}

      {/* On Progress Notifications Section */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-2xl font-semibold text-white mb-4">On Progress Notifications</h2>
        <table className="w-full text-white">
          <thead>
            <tr>
              <th className="py-2">Teacher Name</th>
              <th className="py-2">Subject</th>
              <th className="py-2">Class</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {examRequests.map((request) => (
              <tr key={request.id} className="border-b border-gray-700">
                <td className="py-2 text-center">{request.teacherName}</td>
                <td className="py-2 text-center">{request.subject}</td>
                <td className="py-2 text-center">{request.class}</td>
                <td className="py-2 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      request.status === "Pending"
                        ? "bg-yellow-500"
                        : request.status === "Accepted"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SetExams;