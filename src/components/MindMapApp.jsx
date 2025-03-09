import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';
import { db, auth } from "../firebaseConfig";
import { decode } from 'html-entities';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const MindMapApp = ({ mindMapData }) => {
  const [file, setFile] = useState(null);
  const [mermaidCode, setMermaidCode] = useState(mindMapData || '');
  const [error, setError] = useState(null);
  const [isUploaded, setIsUploaded] = useState(!!mindMapData);
  const [showModal, setShowModal] = useState(false);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);
  const isDragging = useRef(false);
  const [loading, setLoading] = useState(false);

  const saveActivityToFirestore = async (activityType, details) => {
    // const user = auth.currentUser;
    // if (user) {
    //   try {
    //     const activityRef = collection(db, "users", user.uid, "userActivities");
    //     await addDoc(activityRef, {
    //       userId: user.uid,
    //       activityType,
    //       details,
    //       timestamp: serverTimestamp(),
    //     });
    //     console.log("Activity saved successfully");
    //   } catch (error) {
    //     console.error("Error saving activity: ", error);
    //   }
    // }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    setError(null);
    setIsUploaded(false);

    if (!file) {
      setError('Please select a file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const response = await axios.post('https://imapmystudy.com/process_pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMermaidCode(response.data.mermaid_code);

      await saveActivityToFirestore("MindMap", {
        fileName: file.name,
        studyPlan: response.data.mermaid_code,
      });

      if (response.data && response.data.mermaid_code) {
        const rawMermaidCode = response.data.mermaid_code;
        console.log(rawMermaidCode)
        const formattedMermaidCode = cleanMermaidCode(rawMermaidCode).replace(/^mermaid/, '');
        console.log(formattedMermaidCode)
        if (formattedMermaidCode) {
          setMermaidCode(formattedMermaidCode);
          setIsUploaded(true);
        } else {
          throw new Error('No valid mindmap found in Mermaid code.');
        }
      } else {
        throw new Error('No Mermaid code returned from API.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mermaidCode && (isUploaded || mindMapData)) {
      try {
        mermaid.initialize({ startOnLoad: true });
        if (containerRef.current) {
          // containerRef.current.innerHTML = mermaidCode;
          // console.log(mermaidCode);
          const decodedMermaidCode = decode(mermaidCode);
        containerRef.current.innerHTML = decodedMermaidCode;
        console.log(decodedMermaidCode);
          mermaid.contentLoaded(undefined, containerRef.current);
        }
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
      }
    }
  }, [mermaidCode, isUploaded, mindMapData]);

  const cleanMermaidCode = (mermaidCode) => {
    let cleanedCode = mermaidCode.replace(/^mermaid/, '');
    cleanedCode = cleanedCode
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/\+/g, '')
      // .replace(/&#39;/g, "'")
      // .replace(/&quot;/g, '"')
      .replace(/\`\`\`/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    return cleanedCode.trim();
  };

  const handleDownloadPNG = () => {
    if (containerRef.current) {
      html2canvas(containerRef.current).then(canvas => {
        const img = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = img;
        link.download = 'diagram.png';
        link.click();
      });
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX - mapRef.current.offsetLeft;
    startY.current = e.clientY - mapRef.current.offsetTop;
    scrollLeft.current = mapRef.current.scrollLeft;
    scrollTop.current = mapRef.current.scrollTop;
    mapRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      const x = e.clientX - mapRef.current.offsetLeft;
      const y = e.clientY - mapRef.current.offsetTop;
      const walkX = x - startX.current;
      const walkY = y - startY.current;
      mapRef.current.scrollLeft = scrollLeft.current - walkX;
      mapRef.current.scrollTop = scrollTop.current - walkY;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    mapRef.current.style.cursor = 'grab';
  };

  useEffect(() => {
    const mapElement = mapRef.current;
    if (mapElement) {
      mapElement.addEventListener('mousedown', handleMouseDown);
      mapElement.addEventListener('mousemove', handleMouseMove);
      mapElement.addEventListener('mouseup', handleMouseUp);
      mapElement.addEventListener('mouseleave', handleMouseUp);

      return () => {
        mapElement.removeEventListener('mousedown', handleMouseDown);
        mapElement.removeEventListener('mousemove', handleMouseMove);
        mapElement.removeEventListener('mouseup', handleMouseUp);
        mapElement.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, []);

  // useEffect(() => {
  //   if (showModal && containerRef.current) {
  //     try {
  //       mermaid.initialize({ startOnLoad: true });
  //       containerRef.current.innerHTML = mermaidCode;
  //       mermaid.contentLoaded(undefined, containerRef.current);
  //     } catch (error) {
  //       console.error('Error rendering Mermaid diagram in modal:', error);
  //     }
  //   }
  // }, [showModal, mermaidCode]);

  const openFullscreen = () => {
    if (mapRef.current) {
      const fullscreenElement = mapRef.current;
      if (fullscreenElement.requestFullscreen) {
        fullscreenElement.requestFullscreen();
      } else if (fullscreenElement.mozRequestFullScreen) {
        fullscreenElement.mozRequestFullScreen();
      } else if (fullscreenElement.webkitRequestFullscreen) {
        fullscreenElement.webkitRequestFullscreen();
      } else if (fullscreenElement.msRequestFullscreen) {
        fullscreenElement.msRequestFullscreen();
      }
    }
  };

  const closeFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 relative">
      {!mindMapData && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-8 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-purple-500/30">
          <h1 className="text-4xl max-md:text-3xl font-extrabold text-center text-white mb-8 tracking-tight">
            iMindMap Generator
          </h1>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept="application/pdf"
              className="block w-full mb-4 text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <button
              onClick={handleUpload}
              className="w-full py-3 px-6 font-semibold rounded-full shadow-md bg-indigo-500 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 transition-all duration-300 transform hover:translate-y-[-2px]"
            >
              Upload PDF
            </button>
          </div>
        </div>
      )}
      {loading && (
        <div className="loader">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-6 text-red-100 bg-red-600 rounded-xl border border-red-400 shadow-lg animate-pulse">
          <strong className="font-semibold">Error:</strong> Cant Read the Text
        </div>
      )}

      {(isUploaded || mindMapData) && (
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-2xl mb-8 overflow-hidden">
          <h2 className="text-3xl font-bold mb-6 text-white">Mind Map Diagram</h2>
          <div
            ref={mapRef}
            className="relative w-full h-[60vh] md:h-[80vh] overflow-auto border max-md:pt-[200px] flex justify-center border-gray-600 rounded-lg bg-gray-800"
            style={{ position: 'relative', touchAction: 'none', cursor: 'grab' }}
          >
            <div
              ref={containerRef}
              className="mermaid"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', paddingTop: '100px'}}
            ></div>
          </div>
          <button
            onClick={handleDownloadPNG}
            className="relative top-4 m-4 py-2 px-4 font-semibold rounded-full shadow-md bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 transition-all duration-300"
          >
            Download PNG
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              openFullscreen();
            }}
            className="relative top-4 m-4 py-2 px-4 font-semibold rounded-full shadow-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition-all duration-300"
          >
            View Fullscreen
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full h-full max-w-screen-lg max-h-screen">
            <button
              onClick={() => {
                setShowModal(false);
                closeFullscreen();
              }}
              className="z-50 absolute top-4 right-4 py-2 px-4 font-semibold rounded-full shadow-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 transition-all duration-300"
            >
              Close
            </button>
            <div className="relative w-full h-full">
              <div
                ref={mapRef}
                className="w-full h-full overflow-auto bg-gray-800"
                style={{ position: 'relative', touchAction: 'none', }}
              >
                <div
                  ref={containerRef}
                  className="mermaid"
                  style={{ position: 'absolute', top: 200, left: 0, width: '200%', height: '100%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapApp;
