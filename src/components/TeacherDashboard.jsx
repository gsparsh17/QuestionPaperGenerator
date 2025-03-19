import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoMenu, IoClose } from "react-icons/io5";
import {
  FaQuestion,
  FaUser,
  FaHistory,
  FaBook,
  FaFileAlt,
  FaSchool,
  FaChalkboardTeacher,
  FaCode,
  FaCompass,
  FaLightbulb,
  FaUserCircle,
} from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebaseConfig"; // Import Firebase auth for logout
import { FaFileCircleQuestion } from "react-icons/fa6";
import { GiNotebook } from "react-icons/gi";
import { LiaSitemapSolid } from "react-icons/lia";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Import Firestore database
import DocumentQA from "./DocumentQA";
import QuizGenerator from "./QuizGenerator";
import StudyPlanGenerator from "./StudyPlanGenerator";
import YouTubeSummarizer from "./YouTubeSummarizer1";
import MindMapApp from "./MindMapApp";
import WebSummarizer from "./WebSummarizer";
import LibraryPage from "./LibraryPage";
import QuestionPaperBank from "./QuestionPaperBank";
import Applications from "./Applications";
import QuestionPaperGenerator from "./QuestionPeperGenerator";
import ExamConfirmation from "./ExamConfirmation";

const TeacherDashboard = () => {
  const [activeFeature, setActiveFeature] = useState(null);
  const [extended, setExtended] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [schoolDetails, setSchoolDetails] = useState(null);
  const [hasPendingApplications, setHasPendingApplications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract teacherId and schoolId from the URL
  const queryParams = new URLSearchParams(location.search);
  const teacherId = queryParams.get("teacherId");
  const schoolId = queryParams.get("schoolId");

  // Fetch teacher and school details
  useEffect(() => {
    const fetchTeacherAndSchoolDetails = async () => {
      if (!teacherId || !schoolId) {
        console.error("Teacher ID or School ID is missing.");
        return;
      }

      try {
        // Fetch teacher details
        const teacherDocRef = doc(db, "teachers", teacherId);
        const teacherDocSnap = await getDoc(teacherDocRef);

        if (teacherDocSnap.exists()) {
          setTeacherDetails(teacherDocSnap.data());

          // Check for pending applications
          const applicationsRef = collection(teacherDocRef, "Exams");
          const pendingApplicationsQuery = query(
            applicationsRef,
            where("status", "==", "Pending")
          );
          const pendingApplicationsSnapshot = await getDocs(pendingApplicationsQuery);
          setHasPendingApplications(!pendingApplicationsSnapshot.empty);
        } else {
          console.error("Teacher not found");
        }

        // Fetch school details
        const schoolsRef = collection(db, "schools");
        const schoolsQuery = query(schoolsRef, where("uniqueId", "==", schoolId));
        const schoolSnapshot = await getDocs(schoolsQuery);

        if (!schoolSnapshot.empty) {
          const schoolData = schoolSnapshot.docs[0].data();
          setSchoolDetails(schoolData);
        } else {
          console.error("School not found");
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };

    fetchTeacherAndSchoolDetails();
  }, [teacherId, schoolId]);

  const handleFeatureClick = (feature) => {
    setActiveFeature(feature); // Update the active feature
    setExtended(false); // Collapse the sidebar after selecting a feature
  };

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out the user
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const renderFeature = () => {
    switch (activeFeature) {
        case "documentQA":
            return <DocumentQA onBack={() => onFeatureChange(null)} />;
          case "quizGenerator":
            return <QuizGenerator onBack={() => onFeatureChange(null)} />;
          case "studyPlanGenerator":
            return <StudyPlanGenerator onBack={() => onFeatureChange(null)} />;
          case "youtubeSummarizer":
            return <YouTubeSummarizer onBack={() => onFeatureChange(null)} />;
          case "mindMapApp":
            return <MindMapApp onBack={() => onFeatureChange(null)} />;
          case "webSummarizer":
            return <WebSummarizer onBack={() => onFeatureChange(null)} />;
          case "library":
            return <LibraryPage onBack={() => onFeatureChange(null)} />;
          case "questionPaperBank":
            return <QuestionPaperBank onBack={() => onFeatureChange(null)} />;
          case "generatePaper":
            return <QuestionPaperGenerator onBack={() => onFeatureChange(null)} />;
          case "applications":
            return <Applications teacherId={teacherId} onBack={() => onFeatureChange(null)} />;
          case "examConfirmation":
              return <ExamConfirmation onBack={() => setActiveFeature(null)} />;
          case "recentActivities":
            return <RecentActivities onBack={() => onFeatureChange(null)} />; // Replace with actual component
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
            {/* Display Teacher and School Details */}
            {teacherDetails && schoolDetails && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Teacher and School Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-400">Teacher Information</h3>
                    <p className="text-white"><strong>Name:</strong> {teacherDetails.name}</p>
                    <p className="text-white"><strong>Email:</strong> {teacherDetails.email}</p>
                    <p className="text-white"><strong>Subject:</strong> {teacherDetails.subject}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-400">School Information</h3>
                    <p className="text-white"><strong>School Name:</strong> {schoolDetails.schoolName}</p>
                    <p className="text-white"><strong>School ID:</strong> {schoolDetails.uniqueId}</p>
                    <p className="text-white"><strong>Address:</strong> {schoolDetails.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
  onClick={() => navigate(`/main/curriculum?teacherId=${teacherId}&schoolId=${schoolId}`)} // Pass teacherId and schoolId
>
  <div className="flex flex-col items-center">
    <FaBook className="text-4xl text-purple-400 mb-4" />
    <h3 className="text-xl font-semibold text-white">Manage Curriculum</h3>
  </div>
</motion.button>
<motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
                onClick={() => handleFeatureClick("examConfirmation")}
              >
                {hasPendingApplications && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                )}
                <div className="flex flex-col items-center">
                  <FaFileAlt className="text-4xl text-orange-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Exam Confirmation</h3>
                </div>
              </motion.button>

              {/* Document QA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleFeatureClick("documentQA")}
              >
                <div className="flex flex-col items-center">
                  <FaFileCircleQuestion className="text-4xl text-indigo-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Document QA</h3>
                </div>
              </motion.button>

              {/* Quiz Generator */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleFeatureClick("quizGenerator")}
              >
                <div className="flex flex-col items-center">
                  <FaLightbulb className="text-4xl text-green-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Quiz Generator</h3>
                </div>
              </motion.button>

              {/* Study Plan Generator */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleFeatureClick("studyPlanGenerator")}
              >
                <div className="flex flex-col items-center">
                  <GiNotebook className="text-4xl text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Study Plan Generator</h3>
                </div>
              </motion.button>

              {/* YouTube Summarizer */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleFeatureClick("youtubeSummarizer")}
              >
                <div className="flex flex-col items-center">
                  <FaFileAlt className="text-4xl text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">YouTube Summarizer</h3>
                </div>
              </motion.button>

              {/* Web Summarizer */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleFeatureClick("webSummarizer")}
              >
                <div className="flex flex-col items-center">
                  <FaCompass className="text-4xl text-yellow-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Web Summarizer</h3>
                </div>
              </motion.button>

              {/* Mind Map App */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleFeatureClick("mindMapApp")}
              >
                <div className="flex flex-col items-center">
                  <LiaSitemapSolid className="text-4xl text-red-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Mind Map App</h3>
                </div>
              </motion.button>

              {/* Library */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleFeatureClick("library")}
              >
                <div className="flex flex-col items-center">
                  <FaBook className="text-4xl text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Library</h3>
                </div>
              </motion.button>

              {/* Generate Exam Paper */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleFeatureClick("generatePaper")}
              >
                <div className="flex flex-col items-center">
                  <FaFileAlt className="text-4xl text-red-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Generate Class Test</h3>
                </div>
              </motion.button>

              {/* Applications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleFeatureClick("applications")}
              >
                <div className="flex flex-col items-center">
                  <FaCode className="text-4xl text-pink-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Applications</h3>
                </div>
              </motion.button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex animate-fadeIn duration-1000">
      {/* Sidebar */}
      <div className="relative">
        <button
          onClick={() => setExtended(!extended)}
          className="fixed left-2 sm:left-4 top-5 sm:top-4 text-2xl sm:text-3xl text-indigo-400 hover:text-indigo-300 transition-all duration-300 bg-gray-900 p-1 sm:p-2 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 z-50"
        >
          {extended ? <IoClose /> : <IoMenu />}
        </button>
        {extended && (
          <div className="fixed top-0 left-0 h-full py-4 sm:py-6 px-2 sm:px-4 z-40 w-45% sm:w-64 md:w-72 lg:w-80 xl:w-96 shadow-2xl shadow-indigo-900/50 bg-gradient-to-b from-gray-900 via-indigo-900 to-black overflow-hidden border-r border-indigo-500">
            <div className="flex flex-col h-full">
              <div className="flex-grow overflow-y-auto sidebar-scroll mt-10 sm:mt-12 pr-1 sm:pr-2">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-indigo-300 mb-2 sm:mb-4">
                    Navigation
                  </h3>
                  {/* Recent Activities */}
                  <motion.button
                    onClick={() => handleFeatureClick("recentActivities")}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                    whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaHistory className="mr-1 text-xs sm:text-sm" /> Recent Activities
                  </motion.button>

                  {/* Library */}
                  <motion.button
                    onClick={() => handleFeatureClick("library")}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                    whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaBook className="mr-1 text-xs sm:text-sm" /> Library
                  </motion.button>

                  {/* Document QA */}
                  <motion.button
                    onClick={() => handleFeatureClick("documentQA")}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                    whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaFileCircleQuestion className="mr-1 text-xs sm:text-sm" /> Document QA
                  </motion.button>

                  {/* Quiz Generator */}
                  <motion.button
                    onClick={() => handleFeatureClick("quizGenerator")}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                    whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaLightbulb className="mr-1 text-xs sm:text-sm" /> Quiz Generator
                  </motion.button>

                  {/* Study Plan Generator */}
                  <motion.button
                    onClick={() => handleFeatureClick("studyPlanGenerator")}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                    whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GiNotebook className="mr-1 text-xs sm:text-sm" /> Study Plan Generator
                  </motion.button>

                  {/* YouTube Summarizer */}
                  <motion.button
                    onClick={() => handleFeatureClick("youtubeSummarizer")}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                    whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaFileAlt className="mr-1 text-xs sm:text-sm" /> YouTube Summarizer
                  </motion.button>

                  {/* Web Summarizer */}
                  <motion.button
                    onClick={() => handleFeatureClick("webSummarizer")}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                    whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaCompass className="mr-1 text-xs sm:text-sm" /> Web Summarizer
                  </motion.button>

                  {/* Mind Map App */}
                  <motion.button
                    onClick={() => handleFeatureClick("mindMapApp")}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                    whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LiaSitemapSolid className="mr-1 text-xs sm:text-sm" /> Mind Map App
                  </motion.button>

                  {/* Generate Exam Paper */}
                  <motion.button
                    onClick={() => handleFeatureClick("generatePaper")}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                    whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaFileAlt className="mr-1 text-xs sm:text-sm" /> Generate Class Test
                  </motion.button>

                  {/* Applications */}
                  <motion.button
                    onClick={() => handleFeatureClick("applications")}
                    className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center mb-2"
                    whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaCode className="mr-1 text-xs sm:text-sm" /> Applications
                  </motion.button>
                </div>
              </div>

              {/* Help, Settings, and Sign Out Buttons */}
              <div className="mt-auto space-y-2 sm:space-y-4 pb-2 sm:pb-4 border-t border-gray-700 pt-2 sm:pt-4">
                <motion.button
                  onClick={() => navigate("/help")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #60A5FA, #6366F1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaQuestion className="mr-1 text-xs sm:text-sm" /> Help
                </motion.button>
                <motion.button
                  onClick={() => navigate("/settings")}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #C084FC, #EC4899)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoSettings className="mr-1 text-xs sm:text-sm" /> Settings
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-red-400 to-orange-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05, backgroundImage: "linear-gradient(to right, #F87171, #F97316)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  Sign Out
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen relative bg-gradient-to-br from-gray-900 to-black pb-9">
        <div className="flex justify-between w-full text-xl p-5 text-slate-300 sticky top-0 z-40 bg-gray-900/70">
          <div className="w-full md:w-1/2 flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent text-white ml-4 md:ml-16">
              iMapMyStudy
            </h1>
            {activeFeature && (
              <button
                onClick={() => setActiveFeature(null)}
                className="relative max-md:mt-2 text-indigo-500 max-md:ml-10 rounded-full shadow-lg hover:text-white transition-colors duration-200"
              >
                &larr; Back
              </button>
            )}
          </div>
          <div className="flex items-center max-md:-left-10">
            <FaUserCircle
              className="text-indigo-400 hover:cursor-pointer text-2xl"
              onClick={() => navigate("/profile")}
            />
          </div>
        </div>
        <div className="max-w-[900px] mx-auto max-md:mt-20 px-5">
          {renderFeature()}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;