import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form } from "react-bootstrap";
import { MdDescription, MdError } from "react-icons/md";
import ReactHtmlParser from 'react-html-parser';
import '../index.css';
import { db, auth } from "../firebaseConfig"; // Import Firebase Firestore and Auth
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DocumentQA = () => {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState(null); // Track which button is active
  const [generatingMessage, setGeneratingMessage] = useState(false);


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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const formatResponse = (text) => {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 1.5rem; color: #60a5fa;">$1</strong>');
    formattedText = formattedText
      .replace(/^\s*\*\s+/gm, '<li style="color: #fde68a;">')
      .replace(/<\/li>\s*<li>/g, '</li><li style="color: #fde68a;">')
      .replace(/(\n|^)\*\s+/g, '$1<li style="color: #fde68a;">')
      .concat('</li>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    return `<ul>${formattedText}</ul>`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActiveButton('ask'); // Mark "Ask From Document" as active

    if (!file || !prompt) {
      setError('Please upload a file and provide a prompt');
      return;
    }

    const formData = new FormData();
    formData.append('uploaded_file', file);
    formData.append('prompt1', prompt);

    setLoading(true);
    setError(null);

    try {
      const result = await axios.post('https://imapmystudy.com/document_qa/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(null); // Clear previous response
      toast.success('File uploaded successfully!');
      setGeneratingMessage(true); // Show generating message
      setTimeout(() => {
        setResponse(result.data);
        // Save the activity to Firebase
        saveActivityToFirestore("Document Q&A", {
          fileName: file.name,
          prompt,
          answer: result.data.answer,
        });
        setLoading(false); // Turn off loading after displaying the response
        setGeneratingMessage(false); // Hide generating message
      }, 2000); // 2-second delay
    } catch (err) {
      setError('Your File is Too Large or Check your internet connection and Try Again...');
    } finally {
      setLoading(false);
      setActiveButton(null); // Reset the button state when done
    }
  };

  const handleSummarize = async () => {
    setActiveButton('summarize'); // Mark "Summarize" as active

    if (!file) {
      setError('Please upload a file to summarize.');
      return;
    }

    const formData = new FormData();
    formData.append('uploaded_file', file);
    formData.append('prompt1', 'summarize this document'); // Default prompt for summarization

    setLoading(true);
    setError(null);

    try {
      const result = await axios.post('https://imapmystudy.com/document_qa/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(null); // Clear previous response
      toast.success('File uploaded successfully!');
      setGeneratingMessage(true); // Show generating message
      setTimeout(() => {
        setResponse(result.data);
        // Save the summarize activity to Firebase
        saveActivityToFirestore("Document Summarization", {
          fileName: file.name,
          summary: result.data.answer,
        });
        setLoading(false); // Turn off loading after displaying the response
        setGeneratingMessage(false); // Hide generating message
      }, 3000); // 3-second delay
    } catch (err) {
      setError('Your File is Too Large or Check your internet connection and Try Again... ');
    } finally {
      setLoading(false);
      setActiveButton(null); // Reset the button state when done
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 mb-5 p-8 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-purple-500/30">
          <h1 className="text-4xl max-md:text-2xl font-extrabold text-center text-white mb-6">iDocument QA</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Form.Label htmlFor="fileUpload" className="block text-lg font-medium text-white mb-2">
                Upload PDF:
              </Form.Label>
              <div className="flex items-center space-x-4">
                <div><Form.Control
                  type="file"
                  id="fileUpload"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 focus:outline-none"
                  accept=".pdf"
                /></div>
              </div>
              
            </div>

            <div>
              <Form.Label htmlFor="prompt" className="block text-lg font-medium text-white mb-2">
                Enter Prompt:
              </Form.Label>
              <Form.Control
                type="text"
                id="prompt"
                value={prompt}
                onChange={handlePromptChange}
                className="mt-1 block w-full text-base text-gray-900 bg-purple-100 border border-purple-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 transition-all duration-200"
                placeholder="Ask a question about the document..."
                disabled={activeButton === 'summarize'} // Disable when summarizing
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading || !file || activeButton === 'summarize'} // Disable when summarizing
              className={`w-full py-3 px-6 text-lg max-md:text-sm text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 transition-all duration-300 ${loading || !file || activeButton === 'summarize' ? "bg-gray-800 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white transform hover:scale-105"}`}
            >
              {loading && activeButton === 'ask' ? "Uploading File..." : "Ask From Document"}
            </Button>
          </form>

          <Button
            onClick={handleSummarize}
            disabled={loading || !file || activeButton === 'ask'} // Disable when asking
            className={`mt-4 w-full py-3 px-6 text-lg max-md:text-sm text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 transition-all duration-300 ${loading || !file || activeButton === 'ask' ? "bg-gray-800 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white transform hover:scale-105"}`}
          >
            {loading && activeButton === 'summarize' ? "Uploading File..." : "Summarize Document"}
          </Button>
        </div>

        {loading && (
          <div className="loader">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        
        {/* Highlighted generating message code */}
        {generatingMessage && (
          <div className="flex justify-center items-center mt-4">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-3 px-6 rounded-full animate-pulse transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg">Generating your response...</span>
              </div>
            </div>
          </div>
        )}
        {/* End of highlighted generating message code */}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <MdError className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        )}

        {response && (
          <div className="p-6 border border-indigo-500 rounded-xl bg-indigo-900 bg-opacity-20">
            <h3 className="text-xl font-semibold text-indigo-300 mb-2 flex items-center">
              <MdDescription className="w-6 h-6 mr-2" />
              Answer:
            </h3>
            <div
              className="mb-4 text-indigo-100"
              dangerouslySetInnerHTML={{ __html: formatResponse(response.answer) }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentQA;
