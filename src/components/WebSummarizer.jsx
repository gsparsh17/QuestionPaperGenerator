import React, { useState } from 'react';
import { FaCompass } from "react-icons/fa";
import { db, auth } from "../firebaseConfig"; // Import Firebase Firestore and Auth
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function WebSummarizer() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState(false);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const formatWebResponse = (text) => {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 1.5rem; color: #60a5fa;">$1</strong>');
    formattedText = formattedText
      .replace(/^\s*\*\s+/gm, '<li style="color: #fde68a;">')
      .replace(/<\/li>\s*<li>/g, '</li><li style="color: #fde68a;">')
      .replace(/(\n|^)\*\s+/g, '$1<li style="color: #fde68a;">')
      .concat('</li>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    return `<ul>${formattedText}</ul>`;
  };

  // Firebase: Save Activity Function
  const saveActivityToFirestore = async (activityType, details) => {
    const user = auth.currentUser;
    if (user) {
      try {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');
    setGeneratingMessage(true);

    try {
      const formData = new FormData();
      formData.append('input', inputText);

      const response = await fetch('https://imapmystudy.com/web_summarizer', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
        // Save the activity to Firebase
        saveActivityToFirestore("Web Summarizer", {
          inputText,
          summary: data.summary,
        });
      } else {
        setError(data.error || 'An error occurred while summarizing the content.');
      }
    } catch (error) {
      setError('Failed to connect to the API.');
    } finally {
      setLoading(false);
      setGeneratingMessage(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 mb-5 p-8 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-purple-500/30">
          <h1 className="text-4xl max-md:text-2xl font-extrabold text-center text-white mb-6">iWeb Summarizer</h1>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div>
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Enter a URL"
                required
                className="mt-1 block w-full text-base text-gray-900 bg-purple-100 border border-purple-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 transition-all duration-200"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 text-lg max-md:text-sm rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 transition duration-300 transform hover:scale-105">
              Summarize
            </button>
          </form>
        </div>

        {generatingMessage && (
          <div className="flex justify-center items-center mt-4">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-3 px-6 rounded-full animate-pulse transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg max-md:text-sm">Generating your summary...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <FaCompass className="w-5 h-5 mr-2" />
            <p className="text-sm max-md:text-xs">{error}</p>
          </div>
        )}

        {summary && (
          <div className="p-6 border border-indigo-500 rounded-xl bg-indigo-900 bg-opacity-20">
            <h3 className="text-xl font-semibold text-indigo-300 mb-2 flex items-center">
              <FaCompass className="w-6 h-6 mr-2" />
              Summary:
            </h3>
            <div
              className="mb-4 text-teal-100 text-lg max-md:text-sm"
              dangerouslySetInnerHTML={{ __html: formatWebResponse(summary) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default WebSummarizer;
