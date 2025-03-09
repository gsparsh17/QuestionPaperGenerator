import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import ReactHtmlParser from 'react-html-parser';
import { FaArrowLeft, FaDownload, FaSearch, FaClock } from "react-icons/fa";
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import Sidebar from "../components/Sidebar";

// Improved formatResponse for StudyPlan

const formatResponse = (text) => {
  if (typeof text !== 'string') {
    console.error('formatResponse received non-string input:', text);
    return '';
  }
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-base sm:text-lg md:text-2xl lg:text-3xl text-blue-400">$1</strong>');
  formattedText = formattedText
    .replace(/^\s*\*\s+/gm, '<li class="text-yellow-200 mb-1">')
    .replace(/^\s*\+\s+/gm, '<li class="text-pink-300 list-disc ml-4 mb-1">')
    .replace(/<\/li>\s*<li>/g, '</li><li class="text-yellow-200 mb-1">')
    .replace(/(\n|^)\*\s+/g, '$1<li class="text-pink-300 mb-1">')
    .concat('</li>');
  formattedText = formattedText.replace(/\n/g, '<br><br>');
  formattedText = formattedText.replace(/^\*\*Topic/gm, '<h2 class="text-lg sm:text-xl md:text-3xl lg:text-4xl text-green-400 mt-2 sm:mt-3 md:mt-4 lg:mt-5 mb-1 sm:mb-2 md:mb-3">$&')
    .replace(/^\*\*\s*([^\n]+)\s*\(([\d]+ minutes)\)\n+/gm, '<h3 class="text-base sm:text-lg md:text-2xl lg:text-3xl text-yellow-500 mt-1 sm:mt-2 md:mt-3 lg:mt-4 mb-1 sm:mb-2">$1 <span class="text-pink-400">($2)</span></h3>')
    .replace(/^\* (Subtopic [\d.]+):/gm, '<h4 class="text-sm sm:text-base md:text-xl lg:text-2xl text-blue-400 mt-1 sm:mt-2 md:mt-3 lg:mt-4 mb-1 sm:mb-2">$1</h4>')
    .replace(/^\s*\+ ([^\n]+):/gm, '<h5 class="text-xs sm:text-sm md:text-lg lg:text-xl text-purple-300 mt-1 sm:mt-2 mb-1">$1</h5>');
  formattedText = formattedText.replace(/(\d+(\.\d+)?)\s*minutes/g, '<span class="text-pink-400 font-bold">$1 Minutes</span>');
  formattedText = formattedText.replace(/(\d+(\.\d+)?)\s*hours/g, '<span class="text-pink-400 font-bold">$1 Hours</span>');
  formattedText = formattedText.replace(/Estimated time:\s*(\d+(\.\d+)?)\s*hour/g, 'Estimated time: <span class="text-pink-400 font-bold">$1 Hour</span>');
  formattedText = formattedText.replace(/Estimated time:\s*(\d+(\.\d+)?)\s*minute/g, 'Estimated time: <span class="text-pink-400 font-bold">$1 Minute</span>');
  return `<ul class="list-none pl-0">${formattedText}</ul>`;
};

// Improved format function for DocumentQA formatting
const formatDocumentQAResponse = (data) => {
  if (!data || !data.answer) return ''; // Handle undefined data
  const { fileName, answer, prompt } = data;

  // Function to format bold text
  const formatBoldText = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-400">$1</strong>');
  };

  // Format the answer
  const formattedAnswer = formatBoldText(answer).replace(/\n/g, '<br>');

  return `
    <div class="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 mb-2 sm:mb-3 md:mb-4 lg:mb-5 shadow-lg">
      <h3 class="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-blue-400 mb-1 sm:mb-2 md:mb-3">File: ${fileName}</h3>
      <div class="bg-gray-700 rounded p-2 sm:p-3 md:p-4 mb-1 sm:mb-2 md:mb-3">
        <h4 class="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-yellow-300 mb-1 sm:mb-2">Question:</h4>
        <p class="text-white text-xs sm:text-sm md:text-base lg:text-lg">${prompt}</p>
      </div>
      <div class="bg-gray-700 rounded p-2 sm:p-3 md:p-4">
        <h4 class="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-green-300 mb-1 sm:mb-2">Answer:</h4>
        <p class="text-white text-xs sm:text-sm md:text-base lg:text-lg whitespace-pre-wrap">${formattedAnswer}</p>
      </div>
    </div>
  `;
};

// Improved format function for Document Summarization
const formatDocumentSummaryResponse = (data) => {
  if (!data || !data.summary) return ""; 
  const { fileName, summary } = data;

  // Function to format bold text and questions
  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-400">$1</strong>')
      .replace(/^(.*?\?)/gm, '<span class="text-yellow-300 font-semibold">$1</span>');
  };

  // Split the summary into paragraphs
  const paragraphs = summary.split('\n\n');

  // Format each paragraph
  const formattedParagraphs = paragraphs.map(paragraph => 
    `<p class="text-white text-xs sm:text-sm md:text-base lg:text-lg mb-1 sm:mb-2 md:mb-3">${formatText(paragraph)}</p>`
  ).join('');

  return `
    <div class="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 mb-2 sm:mb-3 md:mb-4 lg:mb-5 shadow-lg">
      <h3 class="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-blue-400 mb-1 sm:mb-2 md:mb-3">File: ${fileName}</h3>
      <div class="bg-gray-700 rounded p-2 sm:p-3 md:p-4">
        <h4 class="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-green-300 mb-1 sm:mb-2">Summary:</h4>
        ${formattedParagraphs}
      </div>
    </div>
  `;
};

// Improved format function for Mermaid diagrams
const formatMermaidResponse = (details) => {
  if (!details || !details.diagram) return "";
  const { fileName, diagram } = details;
  console.log(details)
  console.log(diagram)
  console.log(fileName)
  return `
    <div class="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 mb-2 sm:mb-3 md:mb-4 lg:mb-5 shadow-lg">
      <h3 class="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-blue-400 mb-1 sm:mb-2 md:mb-3">File Name: ${fileName}</h3>
      <p class="text-sm sm:text-base md:text-xl lg:text-2xl text-yellow-300 mb-1 sm:mb-2">Mind Map:</p>
      <div class="mermaid bg-white p-2 sm:p-3 md:p-4 rounded-lg overflow-auto">${cleanMermaidCode(diagram)}</div>
    </div>
  `;
};

const cleanMermaidCode = (mermaidCode) => {
  let cleanedCode = mermaidCode.replace(/^mermaid/, '');
  cleanedCode = cleanedCode
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/\+/g, '')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\`\`\`/g, '');
  return cleanedCode.trim();
};

// Improved function to determine which formatting function to use
const formatActivityResponse = (activity) => {
  if (!activity) return ''; // Handle undefined activity
  if (activity.activityType === 'DocumentSummarization') {
    return formatDocumentSummaryResponse(activity.details);
  } else if (activity.activityType === 'DocumentQA') {
    return formatDocumentQAResponse(activity.details);
  } else if (activity.activityType === 'StudyPlanGeneration') {
    const studyPlanContent = formatStudyPlanResponse(activity.details);
    const mermaidDiagram = activity.details.mindMap ? formatMermaidResponse({
      fileName: activity.details.fileName,
      diagram: activity.details.mindMap
    }) : '';
    return `
      <div class="study-plan-container">
        ${studyPlanContent}
        ${mermaidDiagram}
      </div>
    `;
  } else if (activity.activityType === 'MindMap') {
    return formatMermaidResponse(activity.details);
  } else if (activity.activityType === 'WebSummarizer') {
    return formatWebSummarizerResponse(activity.details);
  } else if (typeof activity.details === 'object' && activity.details.fileName && activity.details.answer) {
    return formatDocumentQAResponse(activity.details);
  } else if (typeof activity.details === 'object' && activity.details.fileName && activity.details.summary) {
    return formatDocumentSummaryResponse(activity.details);
  } else if (typeof activity.details === 'object' && activity.details.fileName && activity.details.studyPlan) {
    const studyPlanContent = formatStudyPlanResponse(activity.details);
    const mermaidDiagram = activity.details.mindMap ? formatMermaidResponse({
      fileName: activity.details.fileName,
      diagram: activity.details.studyPlan
    }) : '';
    return `
      <div class="study-plan-container">
        ${studyPlanContent}
        ${mermaidDiagram}
      </div>
    `;
  } else if (typeof activity.details === 'object' && activity.details.fileName && activity.details.diagram) {
    return formatMermaidResponse(activity.details);
  } else if (typeof activity.details === 'object' && activity.details.summary && activity.details.inputText) {
    return formatWebSummarizerResponse(activity.details);
  } else {
    console.error('Unexpected activity details format:', activity.details);
    return '';
  }
};

// New function to format Study Plan response
const formatStudyPlanResponse = (details) => {
  if (!details || !details.studyPlan) return '';
  const { fileName, studyPlan } = details;
  return `
    <div class="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 mb-2 sm:mb-3 md:mb-4 lg:mb-5 shadow-lg">
      <h3 class="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-blue-400 mb-1 sm:mb-2 md:mb-3">File: ${fileName}</h3>
      <div class="bg-gray-700 rounded p-2 sm:p-3 md:p-4">
        <h4 class="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-green-300 mb-1 sm:mb-2">Study Plan:</h4>
        <div class="text-white text-xs sm:text-sm md:text-base lg:text-lg whitespace-pre-wrap">${formatResponse(studyPlan)}</div>
      </div>
    </div>
  `;
};

// New function to format Web Summarizer response
const formatWebSummarizerResponse = (details) => {
  if (!details || !details.summary) return '';
  const { summary, inputText } = details;
  return `
    <div class="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 mb-2 sm:mb-3 md:mb-4 lg:mb-5 shadow-lg">
      <h3 class="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-blue-400 mb-1 sm:mb-2 md:mb-3">Web Summary</h3>
      <div class="bg-gray-700 rounded p-2 sm:p-3 md:p-4 mb-1 sm:mb-2 md:mb-3">
        <h4 class="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-yellow-300 mb-1 sm:mb-2">Entered URL:</h4>
        <p class="text-white text-xs sm:text-sm md:text-base lg:text-lg">${inputText}</p>
      </div>
      <div class="bg-gray-700 rounded p-2 sm:p-3 md:p-4">
        <h4 class="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-green-300 mb-1 sm:mb-2">Summary:</h4>
        <div class="text-white text-xs sm:text-sm md:text-base lg:text-lg whitespace-pre-wrap">${formatWebResponse(summary)}</div>
      </div>
    </div>
  `;
};

const formatWebResponse = (text) => {
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-base sm:text-lg md:text-xl lg:text-2xl" style="color: #60a5fa;">$1</strong>');
  formattedText = formattedText
    .replace(/^\s*\*\s+/gm, '<li style="color: #fde68a;">')
    .replace(/<\/li>\s*<li>/g, '</li><li style="color: #fde68a;">')
    .replace(/(\n|^)\*\s+/g, '$1<li style="color: #fde68a;">')
    .concat('</li>');
  formattedText = formattedText.replace(/\n/g, '<br>');
  return `<ul>${formattedText}</ul>`;
};

const ActivityDetails = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showTimestamp, setShowTimestamp] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          setLoadingProgress(25);
          const docRef = doc(db, "users", user.uid, "userActivities", activityId);
          setLoadingProgress(50);
          const docSnap = await getDoc(docRef);
          setLoadingProgress(75);
          
          if (docSnap.exists()) {
            const activityData = docSnap.data();
            console.log("Fetched activity details:", activityData); // Debugging log
            setActivity(activityData);
          } else {
            setError("No such activity found!");
          }
        } catch (err) {
          console.error("Error fetching activity:", err);
          setError("Error fetching activity details.");
        } finally {
          setLoadingProgress(100);
          setTimeout(() => setLoading(false), 500); // Delay to show 100% progress
        }
      } else {
        console.log("User not authenticated, redirecting to main page");
        navigate('/'); // Redirect to the main page
      }
    };

    fetchActivity();
  }, [activityId, navigate]);

  useEffect(() => {
    if (activity && (activity.activityType === 'MindMap')) {
      try {
        mermaid.initialize({ startOnLoad: true });
        if (containerRef.current) {
          mermaid.contentLoaded();
        }
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
      }
    }
  }, [activity]);

  const handleDownloadPDF = () => {
    if (containerRef.current) {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Create a clone of the container without background colors
      const clone = containerRef.current.cloneNode(true);
      const elements = clone.getElementsByTagName("*");
      for (let i = 0; i < elements.length; i++) {
        elements[i].style.backgroundColor = "transparent";
        elements[i].style.color = "black";
      }
      document.body.appendChild(clone);

      html2canvas(clone, { 
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        backgroundColor: null
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const aspectRatio = canvas.height / canvas.width;
        const imgWidth = pdfWidth;
        const imgHeight = pdfWidth * aspectRatio;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save('study_plan.pdf');
        document.body.removeChild(clone);
      });
    }
  };

  const handleZoomIn = () => {
    if (activity && (activity.activityType === 'MindMap')) {
      setZoomLevel(prevZoom => Math.min(prevZoom * 1.2, 3));
    }
  };

  const handleZoomOut = () => {
    if (activity && (activity.activityType === 'MindMap')) {
      setZoomLevel(prevZoom => Math.max(prevZoom * 0.8, 0.5));
    }
  };

  const toggleTimestamp = () => {
    setShowTimestamp(prev => !prev);
  };

  if (loading) return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center">
      <div className="w-64 h-6 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${loadingProgress}%` }}
        ></div>
      </div>
      <p className="text-indigo-300 mt-4">Loading activity details... {loadingProgress}%</p>
    </div>
  );
  if (error) return <div className="text-red-500 text-center text-base sm:text-lg md:text-xl lg:text-2xl">{error}</div>;
  if (!activity) return <div className="text-red-500 text-center text-base sm:text-lg md:text-xl lg:text-2xl">No activity data available</div>;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen">
      <Sidebar />
      <div className="flex flex-col items-center p-2 sm:p-3 md:p-4 lg:p-5">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-indigo-400 mb-2 sm:mb-3 md:mb-4 hover:text-white transition duration-200"
        >
          <FaArrowLeft className="mr-1 sm:mr-2" /> Back
        </button>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 lg:p-10 max-w-full md:max-w-4xl w-full relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-indigo-400 mb-2 md:mb-0">{activity.activityType || 'Unknown Activity'}</h1>
            
            {activity.timestamp && (
              <div className="flex items-center">
                <button
                  onClick={toggleTimestamp}
                  className="flex items-center text-indigo-400 hover:text-white transition duration-200 text-xs sm:text-sm md:text-base mr-1 sm:mr-2"
                >
                  <FaClock className={`mr-1 md:mr-2 transition-transform duration-300 ${showTimestamp ? 'rotate-180' : ''}`} />
                  {showTimestamp ? 'Hide Time' : 'Show Time'}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showTimestamp ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-xs sm:text-sm md:text-base text-gray-400">
                    {new Date(activity.timestamp.toDate()).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div 
            className="text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg overflow-auto mt-3 sm:mt-4 md:mt-6 lg:mt-8" 
            ref={containerRef}
            style={{transform: `scale(${zoomLevel})`, transformOrigin: 'top left'}}
          >
            {ReactHtmlParser(formatActivityResponse(activity))}
          </div>
          
          <div className="flex flex-wrap justify-between mt-2 sm:mt-3 md:mt-4">
            {(activity.activityType === 'MindMap') && (
              <div className="mb-2 md:mb-0">
                <button 
                  onClick={handleZoomIn}
                  className="mr-2 bg-indigo-500 text-white px-2 sm:px-3 md:px-4 py-1 md:py-2 rounded text-xs sm:text-sm md:text-base hover:bg-indigo-600 transition duration-200"
                >
                  <FaSearch className="mr-1" /> +
                </button>
                <button 
                  onClick={handleZoomOut}
                  className="bg-indigo-500 text-white px-2 sm:px-3 md:px-4 py-1 md:py-2 rounded text-xs sm:text-sm md:text-base hover:bg-indigo-600 transition duration-200"
                >
                  <FaSearch className="mr-1" /> -
                </button>
              </div>
            )}
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center bg-indigo-500 text-white px-2 sm:px-3 md:px-4 py-1 md:py-2 rounded text-xs sm:text-sm md:text-base hover:bg-indigo-600 transition duration-200"
            >
              <FaDownload className="mr-1 md:mr-2" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
