import React, { useContext, useState, useEffect } from "react";
import { GiNotebook } from "react-icons/gi";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { LiaSitemapSolid } from "react-icons/lia";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaQuestion,
  FaUser,
  FaHistory,
  FaUsers,
  FaBook,
  FaFileAlt,
  FaSchool,
  FaChalkboardTeacher,
  FaCode,
  FaCompass,
  FaLightbulb,
  FaUserCircle,
} from "react-icons/fa";
import { Context } from "../context/Context";
import DocumentQA from "./DocumentQA";
import QuizGenerator from "./QuizGenerator";
import StudyPlanGenerator from "./StudyPlanGenerator";
import YouTubeSummarizer from "./YouTubeSummarizer1";
import MindMapApp from "./MindMapApp";
import WebSummarizer from "./WebSummarizer";
import AddTeacher from "./AddTeacher";
import UploadBook from "./UploadBook";
import LibraryPage from "./LibraryPage";
import QuestionPaperBank from "./QuestionPaperBank";
import Applications from "./Applications";
import StaffRoom from "./StaffRoom";
import QuestionPaperGenerator from "./QuestionPeperGenerator";

// Firebase imports
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import RecentActivities from "./RecentActivities";

const MainContent = ({ activeFeature, onFeatureChange }) => {
  const {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    prevPrompt,
    setPrevPrompt,
    showResult,
    loading,
    resultData,
    onSent,
  } = useContext(Context);

  const location = useLocation();
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [numTeachers, setNumTeachers] = useState(0);
  const [numGeneratedPapers, setNumGeneratedPapers] = useState(0);
  const [loadingSchoolData, setLoadingSchoolData] = useState(true);

  // Fetch schoolId from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("schoolId");
    if (!id) {
      navigate("/admin"); // Redirect to admin dashboard if no school ID is provided
    } else {
      setSchoolId(id);
    }
  }, [location, navigate]);

  // Fetch school data (name, teachers, generated papers)
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!schoolId) return;

      setLoadingSchoolData(true);
      try {
        // Fetch school details
        const schoolsQuery = query(collection(db, "schools"), where("uniqueId", "==", schoolId));
        const schoolsSnapshot = await getDocs(schoolsQuery);

        if (!schoolsSnapshot.empty) {
          const schoolData = schoolsSnapshot.docs[0].data();
          setSchoolName(schoolData.schoolName);

          // Fetch number of teachers
          const teachersQuery = query(collection(db, "teachers"), where("schoolId", "==", schoolId));
          const teachersSnapshot = await getDocs(teachersQuery);
          setNumTeachers(teachersSnapshot.size);

          // Fetch number of generated papers
          const papersQuery = query(collection(db, "questionPapers"), where("schoolId", "==", schoolId));
          const papersSnapshot = await getDocs(papersQuery);
          setNumGeneratedPapers(papersSnapshot.size);
        }
      } catch (error) {
        console.error("Error fetching school data:", error);
      } finally {
        setLoadingSchoolData(false);
      }
    };

    fetchSchoolData();
  }, [schoolId]);

  const handleUserIconClick = () => {
    if (auth.currentUser) {
      navigate("/profile");
    } else {
      navigate("/login");
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
      case "uploadBook":
        return <UploadBook onBack={() => onFeatureChange(null)} />;
      case "questionPaperBank":
        return <QuestionPaperBank onBack={() => onFeatureChange(null)} />;
      case "addTeacher":
        return <AddTeacher onBack={() => onFeatureChange(null)} />;
      case "staffRoom":
        return <StaffRoom onBack={() => onFeatureChange(null)} />;
      case "generatePaper":
        return <QuestionPaperGenerator onBack={() => onFeatureChange(null)} />;
      case "applications":
        return <Applications onBack={() => onFeatureChange(null)} />;
      case "recentActivities":
        return <RecentActivities onBack={() => onFeatureChange(null)} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">School Dashboard</h1>

            {/* School Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8"
            >
              <h2 className="text-2xl font-semibold text-white mb-2">{schoolName}</h2>
              <p className="text-gray-400">School ID: {schoolId}</p>
            </motion.div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-indigo-600 to-blue-600 p-6 rounded-xl shadow-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Number of Teachers</h3>
                    <p className="text-3xl font-bold">{numTeachers}</p>
                  </div>
                  <FaChalkboardTeacher className="text-4xl" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-green-600 to-teal-600 p-6 rounded-xl shadow-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Generated Papers</h3>
                    <p className="text-3xl font-bold">{numGeneratedPapers}</p>
                  </div>
                  <FaFileAlt className="text-4xl" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-xl shadow-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Library Books</h3>
                    <p className="text-3xl font-bold">25</p> {/* Replace with actual data */}
                  </div>
                  <FaBook className="text-4xl" />
                </div>
              </motion.div>
            </div>

            {/* Quick Actions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Document QA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => onFeatureChange("documentQA")}
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
                onClick={() => onFeatureChange("quizGenerator")}
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
                onClick={() => onFeatureChange("studyPlanGenerator")}
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
                onClick={() => onFeatureChange("youtubeSummarizer")}
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
                onClick={() => onFeatureChange("webSummarizer")}
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
                onClick={() => onFeatureChange("mindMapApp")}
              >
                <div className="flex flex-col items-center">
                  <LiaSitemapSolid className="text-4xl text-red-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Mind Map App</h3>
                </div>
              </motion.button>

              {/* Add Teacher */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => onFeatureChange("addTeacher")}
              >
                <div className="flex flex-col items-center">
                  <FaChalkboardTeacher className="text-4xl text-indigo-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Add Teacher</h3>
                </div>
              </motion.button>

              {/* Staff Room */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => onFeatureChange("staffRoom")}
              >
                <div className="flex flex-col items-center">
                  <FaUsers className="text-4xl text-green-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Staff Room</h3>
                </div>
              </motion.button>

              {/* Upload Book */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => onFeatureChange("uploadBook")}
              >
                <div className="flex flex-col items-center">
                  <FaBook className="text-4xl text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Upload Book</h3>
                </div>
              </motion.button>

              {/* Library */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => onFeatureChange("library")}
              >
                <div className="flex flex-col items-center">
                  <FaBook className="text-4xl text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Library</h3>
                </div>
              </motion.button>

              {/* Generated Papers */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => onFeatureChange("questionPaperBank")}
              >
                <div className="flex flex-col items-center">
                  <FaFileAlt className="text-4xl text-yellow-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Generated Papers</h3>
                </div>
              </motion.button>

              {/* Generate Exam Paper */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => onFeatureChange("generatePaper")}
              >
                <div className="flex flex-col items-center">
                  <FaFileAlt className="text-4xl text-red-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white">Generate Exam Paper</h3>
                </div>
              </motion.button>

              {/* Applications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => onFeatureChange("applications")}
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
    <div className="flex-1 min-h-screen relative bg-gradient-to-br from-gray-900 to-black pb-9">
      <div className="flex justify-between w-full text-xl p-5 text-slate-300 sticky top-0 z-40 bg-gray-900/70">
        <div className="w-full md:w-1/2 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent text-white ml-4 md:ml-16">
            iMapMyStudy
          </h1>
          {activeFeature && (
            <button
              onClick={() => onFeatureChange(null)}
              className="relative max-md:mt-2 text-indigo-500 max-md:ml-10 rounded-full shadow-lg hover:text-white transition-colors duration-200"
            >
              &larr; Back
            </button>
          )}
        </div>
        <div className="flex items-center max-md:-left-10">
          <FaUserCircle
            className="text-indigo-400 hover:cursor-pointer text-2xl"
            onClick={handleUserIconClick}
          />
        </div>
      </div>
      <div className="max-w-[900px] mx-auto max-md:mt-20 px-5">
        {renderFeature()}
      </div>
    </div>
  );
};

export default MainContent;