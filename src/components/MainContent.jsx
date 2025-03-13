import React, { useContext, useState, useEffect } from "react";
import { GiNotebook } from "react-icons/gi";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { LiaSitemapSolid } from "react-icons/lia";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCode,
  FaCompass,
  FaLightbulb,
  FaMicrophone,
  FaUserCircle,
  FaHistory,
} from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { MdAddPhotoAlternate } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { Context } from "../context/Context";
import DocumentQA from "./DocumentQA";
import QuizGenerator from "./QuizGenerator";
import StudyPlanGenerator from "./StudyPlanGenerator";
import YouTubeSummarizer from './YouTubeSummarizer1';
import MindMapApp from "./MindMapApp";
import WebSummarizer from "./WebSummarizer"; // Corrected import

// Firebase imports
import { auth, db } from "../firebaseConfig";
import { doc, collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const MainContent = () => {
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

  const [showDocumentQA, setShowDocumentQA] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showStudyPlanGenerator, setShowStudyPlanGenerator] = useState(false);
  const [showYouTubeSummarizer, setShowYouTubeSummarizer] = useState(false);
  const [showMindMapApp, setShowMindMapApp] = useState(false);
  const [showWebSummarizer, setShowWebSummarizer] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("schoolId");
    if (!id) {
      navigate("/admin"); // Redirect to admin dashboard if no school ID is provided
    } else {
      setSchoolId(id);
    }
  }, [location, navigate]);

  const [user, setUser] = useState(null); // State to track the logged-in user

  // Check if user is logged in and persist the session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the logged-in user
        localStorage.setItem('user', JSON.stringify(currentUser)); // Store user info in localStorage
      } else {
        setUser(null); // Clear user if logged out
        localStorage.removeItem('user'); // Remove user info from localStorage
      }
    });

    // Check if there's a stored user in localStorage on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    return () => unsubscribe();
  }, []);

  // Check if the user has been prompted to log in after a reload
  useEffect(() => {
    const hasBeenPrompted = localStorage.getItem('hasBeenPrompted');
    if (!hasBeenPrompted) {
      signOut(auth).then(() => {
        localStorage.setItem('hasBeenPrompted', 'true');
        navigate('/login');
      });
    }
  }, [navigate]);

  const logActivity = async (activity) => {
    if (!user) return; // Only log if user is authenticated

    try {
      await addDoc(collection(db, "userActivities"), {
        userId: user.uid,
        activity,
        timestamp: Timestamp.now(),
      });
      console.log("Activity logged:", activity);
    } catch (error) {
      console.error("Error logging activity:", error);
      // Optional: Provide user feedback here
    }
  };

  const handleShowDocumentQA = () => {
    setShowDocumentQA(true);
    logActivity("Opened Document Q/A");
  };

  const handleShowQuizGenerator = () => {
    setShowQuizGenerator(true);
    logActivity("Opened Quiz Generator");
  };

  const handleShowStudyPlanGenerator = () => {
    setShowStudyPlanGenerator(true);
    logActivity("Opened Study Plan Generator");
  };

  const handleShowYouTubeSummarizer = () => {
    // setShowYouTubeSummarizer(true);
    // logActivity("Opened YouTube Summarizer");
    navigate(`/question-paper-generator?schoolId=${schoolId}`);
  };

  const handleShowMindMapApp = () => {
    setShowMindMapApp(true);
    logActivity("Opened Mind Map Generator");
  };

  const handleShowWebSummarizer = () => {
    setShowWebSummarizer(true);
    logActivity("Opened Web Summarizer");
  };

  const handleCloseAll = () => {
    setShowDocumentQA(false);
    setShowQuizGenerator(false);
    setShowStudyPlanGenerator(false);
    setShowYouTubeSummarizer(false);
    setShowMindMapApp(false);
    setShowWebSummarizer(false);
    logActivity("Returned to Main Screen");
  };

  const handleUserIconClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex-1 min-h-screen relative bg-gradient-to-br from-gray-900 to-black pb-9">
      <div className="flex justify-between w-full text-xl p-5 text-slate-300 sticky top-0 z-40 bg-gray-900/70">
        <div className="w-full md:w-1/2 flex flex-col md:flex-row justify-between items-center">
         
            <h1 className="text-2xl font-bold bg-clip-text text-transparent text-white ml-4 md:ml-16">
              iMapMyStudy
            </h1>

          {(showDocumentQA || showQuizGenerator || showStudyPlanGenerator || showYouTubeSummarizer || showMindMapApp || showWebSummarizer) && (
            <button
              onClick={handleCloseAll}
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
        {!showDocumentQA &&
        !showQuizGenerator &&
        !showStudyPlanGenerator &&
        !showYouTubeSummarizer &&
        !showMindMapApp &&
        !showWebSummarizer ? (
          !showResult ? (
            <>
              <div className="text-[56px] text-slate-300 font-semibold max-md:text-[25px]">
                <p>
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Welcome, Aspiring Scholar
                  </span>
                </p>
                <p className="text-white">How may I assist you today?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-5">
                <div
                  className="h-[200px] max-md:h-auto p-6 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg relative cursor-default hover:from-indigo-500 hover:to-blue-400 transition-all duration-300 shadow-lg hover:scale-105 flex flex-col justify-between animate-glow-indigo"
                >
                  <h1 className="text-white text-xl max-md:text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 hover:from-blue-200 hover:to-white transition-all duration-300 cursor-pointer">
                    iChat QA
                  </h1>
                  <p className="text-white text-sm mt-2 flex-grow">Get AI-powered answers to enhance your textbook understanding.</p>
                  <button className="mt-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg shadow-md transition-all duration-300 text-white font-medium flex items-center justify-between space-x-2 w-full hover:bg-white hover:bg-opacity-40 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                      onClick={handleShowDocumentQA}>
                     <span>Ask Questions</span>
                     <FaFileCircleQuestion className="text-2xl" />
                    </button>
                </div>

                <div
                  className="h-[200px] max-md:h-auto p-6 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg relative cursor-default hover:from-purple-500 hover:to-pink-400 transition-all duration-300 shadow-lg hover:scale-105 flex flex-col justify-between animate-glow-purple"
                >
                  <h1 className="text-white text-xl max-md:text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200 hover:from-pink-200 hover:to-white transition-all duration-300 cursor-pointer">
                    iQuiz Generator
                  </h1>
                  <p className="text-white text-sm mt-2 flex-grow">Generate customized quizzes to test and reinforce your learning.</p>
                  <button className="mt-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg shadow-md transition-all duration-300 text-white font-medium flex items-center justify-between space-x-2 w-full hover:bg-white hover:bg-opacity-40 hover:text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                      onClick={handleShowQuizGenerator}>
                     <span>Generate Quiz</span>
                     <FaLightbulb className="text-2xl" />
                    </button>
                </div>

                <div
                  className="h-[200px] max-md:h-auto p-6 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-lg relative cursor-default hover:from-emerald-500 hover:to-teal-400 transition-all duration-300 shadow-lg hover:scale-105 flex flex-col justify-between animate-glow-emerald"
                >
                     <h1 className="text-white text-xl max-md:text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-teal-200 hover:from-teal-200 hover:to-white transition-all duration-300 cursor-pointer">
                      iStudy Planner
                     </h1>
                     <p className="text-white text-sm mt-2 flex-grow">Create a tailored study schedule to optimize your learning journey.</p>
                     <button className="mt-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg shadow-md transition-all duration-300 text-white font-medium flex items-center justify-between space-x-2 w-full hover:bg-white hover:bg-opacity-40 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                     onClick={handleShowStudyPlanGenerator}>
                     <span>Plan Study</span>
                     <GiNotebook className="text-2xl" />
                    </button>
                </div>

                

                <div
                  className="h-[200px] max-md:h-auto p-6 bg-gradient-to-br from-yellow-600 to-amber-500 rounded-lg relative cursor-default hover:from-yellow-500 hover:to-amber-400 transition-all duration-300 shadow-lg hover:scale-105 flex flex-col justify-between animate-glow-yellow"
                >
                  <h1 className="text-white text-xl max-md:text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200 hover:from-amber-200 hover:to-white transition-all duration-300 cursor-pointer">
                    iMindMap
                  </h1>
                  <p className="text-white text-sm mt-2 flex-grow">Create mind maps to visualize and remember complex concepts easily.</p>
                  <button className="mt-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg shadow-md transition-all duration-300 text-white font-medium flex items-center justify-between space-x-2 w-full hover:bg-white hover:bg-opacity-40 hover:text-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                     onClick={handleShowMindMapApp}>
                     <span>Create Mind Map</span>
                     <LiaSitemapSolid className="text-2xl" />
                    </button>
                </div>
                <div
                  className="h-[200px] max-md:h-auto p-6 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg relative cursor-default hover:from-red-500 hover:to-orange-400 transition-all duration-300 shadow-lg hover:scale-105 flex flex-col justify-between animate-glow-red"
                >
                  <h1 className="text-white text-xl max-md:text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-200 hover:from-orange-200 hover:to-white transition-all duration-300 cursor-pointer">
                    Q-Paper Generator
                  </h1>
                  <p className="text-white text-sm mt-2 flex-grow">Extract key points from educational videos to enhance learning.</p>
                  <button className="mt-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg shadow-md transition-all duration-300 text-white font-medium flex items-center justify-between space-x-2 w-full hover:bg-white hover:bg-opacity-40 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                     onClick={handleShowYouTubeSummarizer}>
                     <span>Generate Paper</span>
                     <FaCode className="text-2xl" />
                    </button>
                </div>

                <div
                  className="h-[200px] mb-5 max-md:h-auto p-6 bg-gradient-to-br from-green-600 to-teal-500 rounded-lg relative cursor-default hover:from-green-500 hover:to-teal-400 transition-all duration-300 shadow-lg hover:scale-105 flex flex-col justify-between animate-glow-green"
                >
                  <h1 className="text-white text-xl max-md:text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-teal-200 hover:from-teal-200 hover:to-white transition-all duration-300 cursor-pointer">
                    iWeb Summarizer
                  </h1>
                  <p className="text-white text-sm mt-2 flex-grow">Summarize web content to quickly grasp the main points.</p>
                  <button className="mt-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg shadow-md transition-all duration-300 text-white font-medium flex items-center justify-between space-x-2 w-full hover:bg-white hover:bg-opacity-40 hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                     onClick={handleShowWebSummarizer}>
                     <span>Summarize Web</span>
                     <FaCompass className="text-2xl" />
                    </button>
                </div>
                
              </div>
              <div className="absolute bottom-2 max-md:bottom-1 w-[60%] max-md:w-[90%]">
                <p className="text-sm max-md:text-[9px] text-center font-medium text-slate-400 bottom-0">
                  iMapMyStudy is designed for educational purposes. Please use responsibly and exercise discretion when applying its features.
                </p>
              </div>
            </>
          ) : (
            <div className="py-0 px-[5%] max-h-[70vh] overflow-y-scroll scrollbar-hidden">
              <div className="my-10 mx-0 flex items-center gap-5">
                <FaUserCircle className="text-3xl text-indigo-400" />
                <p className="text-lg font-[400] leading-[1.8] text-slate-300">{recentPrompt}</p>
              </div>

              <div className="flex items-start gap-5">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">iMapMyStudy</h1>
                {loading ? (
                  <div className="w-full flex flex-col gap-2">
                    <hr className="rounded-md border-none bg-gray-700 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 animate-pulse" />
                    <hr className="rounded-md border-none bg-gray-700 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 animate-pulse" />
                    <hr className="rounded-md border-none bg-gray-700 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 animate-pulse" />
                  </div>
                ) : (
                  <p
                    dangerouslySetInnerHTML={{ __html: resultData }}
                    className="text-lg font-[400] leading-[1.8] text-slate-300"
                  ></p>
                )}
              </div>
            </div>
          )
        ) : showDocumentQA ? (
          <DocumentQA onBack={handleCloseAll} />
        ) : showQuizGenerator ? (
          <QuizGenerator onBack={handleCloseAll} />
        ) : showStudyPlanGenerator ? (
          <StudyPlanGenerator onBack={handleCloseAll} />
        ) : showYouTubeSummarizer ? (
          <YouTubeSummarizer onBack={handleCloseAll} />
        ) : showWebSummarizer ? (
          <WebSummarizer onBack={handleCloseAll} />
        ) : (
          <MindMapApp onBack={handleCloseAll} />
        )}
      </div>
    </div>
  );
};

export default MainContent;
