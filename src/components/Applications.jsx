import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaPlus } from "react-icons/fa";
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Import Firestore

const Applications = ({ teacherId, schoolId, onBack }) => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leave applications based on schoolId or teacherId
  useEffect(() => {
    const fetchLeaveApplications = async () => {
      try {
        let applicationsRef;

        if (schoolId) {
          // Fetch the school document reference using the schoolId
          const schoolsRef = collection(db, "schools");
          const schoolsQuery = query(schoolsRef, where("uniqueId", "==", schoolId));
          const schoolsSnapshot = await getDocs(schoolsQuery);

          if (!schoolsSnapshot.empty) {
            const schoolDocRef = schoolsSnapshot.docs[0].ref;
            applicationsRef = collection(schoolDocRef, "applications");
          } else {
            setError("School not found");
            return;
          }
        } else if (teacherId) {
          // Fetch the teacher's schoolId first
          const teacherDocRef = doc(db, "teachers", teacherId);
          const teacherDocSnap = await getDoc(teacherDocRef);

          if (teacherDocSnap.exists()) {
            const teacherData = teacherDocSnap.data();
            const schoolId = teacherData.schoolId;

            // Fetch the school document reference using the schoolId
            const schoolsRef = collection(db, "schools");
            const schoolsQuery = query(schoolsRef, where("uniqueId", "==", schoolId));
            const schoolsSnapshot = await getDocs(schoolsQuery);

            if (!schoolsSnapshot.empty) {
              const schoolDocRef = schoolsSnapshot.docs[0].ref;
              applicationsRef = collection(schoolDocRef, "applications");

              // Fetch leave applications for the teacher's school
              const applicationsQuery = query(applicationsRef, where("teacherId", "==", teacherId));
              const applicationsSnapshot = await getDocs(applicationsQuery);
              const applications = applicationsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setLeaveApplications(applications);
            } else {
              setError("School not found");
              return;
            }
          } else {
            setError("Teacher not found");
            return;
          }
        }

        // Fetch all leave applications for the school
        const applicationsSnapshot = await getDocs(applicationsRef);
        const applications = applicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaveApplications(applications);
      } catch (error) {
        setError("Error fetching leave applications");
        console.error("Error fetching leave applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveApplications();
  }, [teacherId, schoolId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (teacherId) {
      try {
        // Fetch the teacher's schoolId and name
        const teacherDocRef = doc(db, "teachers", teacherId);
        const teacherDocSnap = await getDoc(teacherDocRef);
        if (teacherDocSnap.exists()) {
          const teacherData = teacherDocSnap.data();
          const schoolId = teacherData.schoolId;
          const teacherName = teacherData.name;

          // Fetch the school document reference using the schoolId
          const schoolsRef = collection(db, "schools");
          const schoolsQuery = query(schoolsRef, where("uniqueId", "==", schoolId));
          const schoolsSnapshot = await getDocs(schoolsQuery);

          if (!schoolsSnapshot.empty) {
            const schoolDocRef = schoolsSnapshot.docs[0].ref;

            // Add the leave application to the school's applications subcollection
            const applicationsRef = collection(schoolDocRef, "applications");
            await addDoc(applicationsRef, {
              teacherId,
              teacherName,
              ...formData,
              status: "Pending",
            });

            // Reset form and hide it
            setFormData({
              leaveType: "",
              startDate: "",
              endDate: "",
              reason: "",
            });
            setShowForm(false);

            // Refresh the leave applications list
            const applicationsQuery = query(applicationsRef, where("teacherId", "==", teacherId));
            const applicationsSnapshot = await getDocs(applicationsQuery);
            const applications = applicationsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setLeaveApplications(applications);
          } else {
            setError("School not found");
          }
        }
      } catch (error) {
        setError("Error submitting application");
        console.error("Error submitting application:", error);
      }
    }
  };

  // Handle accepting a leave application
  const handleAccept = async (id) => {
    if (schoolId) {
      try {
        const applicationRef = doc(db, "schools", schoolId, "applications", id);
        await updateDoc(applicationRef, { status: "Approved" });

        // Refresh the leave applications list
        const applicationsRef = collection(db, "schools", schoolId, "applications");
        const applicationsSnapshot = await getDocs(applicationsRef);
        const applications = applicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaveApplications(applications);
      } catch (error) {
        setError("Error accepting application");
        console.error("Error accepting application:", error);
      }
    }
  };

  // Handle rejecting a leave application
  const handleReject = async (id) => {
    if (schoolId) {
      try {
        const applicationRef = doc(db, "schools", schoolId, "applications", id);
        await updateDoc(applicationRef, { status: "Rejected" });

        // Refresh the leave applications list
        const applicationsRef = collection(db, "schools", schoolId, "applications");
        const applicationsSnapshot = await getDocs(applicationsRef);
        const applications = applicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaveApplications(applications);
      } catch (error) {
        setError("Error rejecting application");
        console.error("Error rejecting application:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-white text-center py-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Leave Applications
      </h1>

      {/* Back Button */}
      {/* <button
        onClick={onBack}
        className="relative text-indigo-500 rounded-full shadow-lg hover:text-white transition-colors duration-200 mb-8"
      >
        &larr; Back
      </button> */}

      {/* Show form for teachers to submit leave applications */}
      {teacherId && (
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <FaPlus />
            <span>Submit Leave Application</span>
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="mt-4 bg-gray-800 p-6 rounded-xl">
              <div className="space-y-4">
                <div>
                  <label className="text-white">Leave Type</label>
                  <input
                    type="text"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-white">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-white">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-white">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Leave Applications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaveApplications.map((application) => (
          <motion.div
            key={application.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col space-y-4">
              {/* Teacher Name */}
              <div className="flex items-center space-x-2">
                <FaUser className="text-indigo-400" />
                <h3 className="text-xl font-semibold text-white">
                  {application.teacherName}
                </h3>
              </div>

              {/* Leave Type */}
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-green-400" />
                <p className="text-gray-400">{application.leaveType}</p>
              </div>

              {/* Leave Dates */}
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-blue-400" />
                <p className="text-gray-400">
                  {application.startDate} to {application.endDate}
                </p>
              </div>

              {/* Reason */}
              <div className="flex items-center space-x-2">
                <p className="text-gray-400">{application.reason}</p>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <p
                  className={`text-sm font-semibold ${
                    application.status === "Pending"
                      ? "text-yellow-400"
                      : application.status === "Approved"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  Status: {application.status}
                </p>
              </div>

              {/* Action Buttons for School */}
              {schoolId && application.status === "Pending" && (
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => handleAccept(application.id)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <FaCheckCircle />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleReject(application.id)}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <FaTimesCircle />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Applications;