import React, { useState } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import { MdFileUpload, MdDescription } from "react-icons/md";
import ReactHtmlParser from 'react-html-parser';
import { db, auth } from "../firebaseConfig"; // Import Firebase Firestore and Auth
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const StudyPlanGenerator = () => {
  const [file, setFile] = useState(null);
  const [studyPlan, setStudyPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatingMessage, setGeneratingMessage] = useState(false);

  const saveActivityToFirestore = async (activityType, details) => {
    const user = auth.currentUser;
    if (user) {
      try {
        // Create a reference to the user's activities subcollection
        const activityRef = collection(db, "users", user.uid, "userActivities");
        await addDoc(activityRef, {
          userId: user.uid,
          activityType,
          details,
          timestamp: serverTimestamp(),
        });
        console.log("Activity saved successfully");
      } catch (error) {
        console.error("Error saving activity: ", error);
      }
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const formatResponse = (text) => {
    // Format text for display
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 1.5rem; color: #38bdf8;">$1</strong>');
    formattedText = formattedText
      .replace(/^\s*\*\s+/gm, '<li style="color: #fef08a;">')
      .replace(/^\s*\+\s+/gm, '<li style="color: #D6A2C4; list-style-type: circle;">')
      .replace(/<\/li>\s*<li>/g, '</li><li style="color: #fef08a;">')
      .replace(/(\n|^)\*\s+/g, '$1<li style="color: #D6A2C4;">')
      .concat('</li>');
    formattedText = formattedText.replace(/\n/g, '<br><br>');
    formattedText = formattedText.replace(/^\*\*Topic/gm, '<h2 style="color: #4ade80;">$&')
      .replace(/^\*\*\s*([^\n]+)\s*\(([\d]+ minutes)\)\n+/gm, '<h3 style="color: #f59e0b;">$1 ($2)</h3>')
      .replace(/^\* (Subtopic [\d.]+):/gm, '<h4 style="color: #60a5fa;">$1</h4>')
      .replace(/^\s*\+ ([^\n]+):/gm, '<h5>$1</h5>');
    formattedText = formattedText.replace(/(\d+)\s*minutes/g, '<span style="color: #ff00ff; font-weight: bold;">$1 Minutes</span>');
    formattedText = formattedText.replace(/(\d+)\s*hours/g, '<span style="color: #ff00ff; font-weight: bold;">$1 Hours</span>');
    formattedText = `<ul>${formattedText}</ul>`;
    return formattedText;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStudyPlan("");
    setGeneratingMessage(false);

    if (!file) {
      setError("Please upload a file");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("uploaded_file", file);

    try {
      const response = await axios.post(
        "https://imapmystudy.com/generate_study_plan/",
        formData
      );
      setLoading(false);
      setGeneratingMessage(true);
      setTimeout(() => {
        setStudyPlan(response.data.study_plan);
        setGeneratingMessage(false);

        // Log activity to Firestore
        saveActivityToFirestore("Study Plan Generation", {
          fileName: file.name,
          studyPlan: response.data.study_plan,
        });
      }, 2000);
    } catch (err) {
      setError("An error occurred while generating the study plan.");
      setLoading(false);
    }
  };

  return (
    <div className="text-white mt-10">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 sm:p-8 lg:p-10 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-purple-500/30">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-white mb-6 sm:mb-8 lg:mb-10">
          iStudy Planner
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="space-y-2">
            <Form.Label htmlFor="fileUpload" className="text-lg sm:text-xl font-medium text-gray-200">
              Upload PDF:
            </Form.Label>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Form.Control
                type="file"
                id="fileUpload"
                onChange={handleFileChange}
                className="flex-1 text-sm sm:text-base text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading || !file}
            className={`w-full py-2 sm:py-3 lg:py-4 px-4 sm:px-6 lg:px-8 text-base sm:text-lg lg:text-xl font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 ${
              loading || !file
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600 text-white transform hover:scale-105"
            }`}
          >
            {loading ? "Uploading your file..." : "Generate Study Plan"}
          </Button>
        </form>
      </div>
      {loading && (
        <div className="loader">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {generatingMessage && (
        <div className="flex justify-center items-center mt-4">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-3 px-6 rounded-full animate-pulse transition-all duration-300 transform hover:scale-105 shadow-lg">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg">Generating your Study Plan...</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 sm:mt-6 lg:mt-8 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-xl text-red-400 text-center font-semibold">
          {error}
        </div>
      )}

      {studyPlan && (
        <div className="mt-6 sm:mt-8 lg:mt-10 bg-opacity-50 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl">
          <h3 className="text-xl sm:text-3xl lg:text-4xl font-semibold text-purple-300 mb-4 sm:mb-6 lg:mb-8 flex items-center">
            <MdDescription className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mr-2 sm:mr-4 lg:mr-6" />
            Generated Study Plan:
          </h3>
          <div className="rounded-xl overflow-auto">
            <pre className="whitespace-pre-wrap break-words text-gray-300 bg-opacity-50 rounded-xl">
              {ReactHtmlParser(formatResponse(studyPlan))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanGenerator;
