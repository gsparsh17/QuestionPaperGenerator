import React, { useContext, useState, useEffect, useRef } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { FaQuestion, FaUser } from "react-icons/fa6";
import { IoSettings } from "react-icons/io5";
import { Context } from "../context/Context";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { CSSTransition } from 'react-transition-group';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { onSent, prevPrompt, setRecentPrompt } = useContext(Context);
  const navigate = useNavigate();
  const nodeRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserActivities(currentUser);
      } else {
        setUser(null);
        setActivities([]);
        navigate("/Maincontent");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserActivities = async (currentUser) => {
    if (currentUser) {
      try {
        const activitiesRef = collection(db, "users", currentUser.uid, "userActivities");
        const activitiesSnapshot = await getDocs(activitiesRef);
        const activitiesList = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        activitiesList.sort((a, b) => b.timestamp - a.timestamp);
        setActivities(activitiesList);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp) {
      const date = new Date(timestamp.seconds * 1000);
      //return date.toLocaleString();
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
    return "";
  };

  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
    await onSent(prompt);
  };

  const handleActivityClick = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.activityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setExtended(!extended)}
        className="fixed left-2 sm:left-4 top-5 sm:top-4 text-2xl sm:text-3xl text-indigo-400 hover:text-indigo-300 transition-all duration-300 bg-gray-900 p-1 sm:p-2 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 z-50"
      >
        {extended ? <IoClose /> : <IoMenu />}
      </button>
      <CSSTransition
        in={extended}
        timeout={300}
        classNames="sidebar"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className="fixed top-0 left-0 h-full py-4 sm:py-6 px-2 sm:px-4 z-40 w-45% sm:w-64 md:w-72 lg:w-80 xl:w-96 shadow-2xl shadow-indigo-900/50 bg-gradient-to-b from-gray-900 via-indigo-900 to-black overflow-hidden border-r border-indigo-500">
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto sidebar-scroll mt-10 sm:mt-12 pr-1 sm:pr-2">
              <div className="mb-3 sm:mb-5 px-1 py-1 relative">
                <div className="relative z-10 bg-gray-800 rounded-lg max-md:mt-8">
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-1 sm:py-2 px-2 sm:px-4 pl-8 sm:pl-10 bg-transparent text-white text-sm sm:text-base rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300 border border-gray-700 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute top-1/2 right-2 sm:right-3 transform -translate-y-1/2 text-gray-400 hover:text-white z-10"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-indigo-300 mb-2 sm:mb-4">Recent Activities</h3>
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => handleActivityClick(activity.id)}
                      className="flex items-center text-indigo-200 cursor-pointer hover:bg-gray-800 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 transition-all duration-300 border border-gray-700 hover:border-indigo-500 hover:shadow-xl relative overflow-hidden group"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500 mr-2 sm:mr-3 animate-pulse"></div>
                      <div className="flex-grow">
                        <p className="text-white text-xs sm:text-sm font-medium">{activity.activityType}</p>
                        <p className="text-xs text-indigo-300 mt-0.5 sm:mt-1 italic">{formatTimestamp(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-2 sm:py-4 text-sm sm:text-base">No activities found</p>
                )}
              </div>
            </div>
            <div className="mt-auto space-y-2 sm:space-y-4 pb-2 sm:pb-4 border-t border-gray-700 pt-2 sm:pt-4">
              <motion.button
                onClick={() => navigate('/help')}
                className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center "
                whileHover={{ scale: 1.05, backgroundImage: 'linear-gradient(to right, #60A5FA, #6366F1)' }}
                whileTap={{ scale: 0.95 }}
              >
                <FaQuestion className="mr-1 text-xs sm:text-sm" /> Help
              </motion.button>
              <motion.button
                onClick={() => navigate('/settings')}
                className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center "
                whileHover={{ scale: 1.05, backgroundImage: 'linear-gradient(to right, #C084FC, #EC4899)' }}
                whileTap={{ scale: 0.95 }}
              >
                <IoSettings className="mr-1 text-xs sm:text-sm" /> Settings
              </motion.button>
              <motion.button
                onClick={handleLogout}
                className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-gradient-to-r from-red-400 to-orange-500 text-white text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center "
                whileHover={{ scale: 1.05, backgroundImage: 'linear-gradient(to right, #F87171, #F97316)' }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Sign Out
              </motion.button>
            </div>
          </div>
        </div>
      </CSSTransition>
      <style>
        {`
          @media (max-width: 640px) {
            .sidebar-scroll {
              max-height: calc(100vh - 180px);
            }
          }
          .sidebar-scroll {
            overflow-x: hidden;
          }
          .sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: #1F2937;
            border-radius: 8px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background-color: #4F46E5;
            border-radius: 8px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background-color: #6366F1;
          }
          .sidebar-enter {
            transform: translateX(-100%);
            opacity: 0;
          }
          .sidebar-enter-active {
            transform: translateX(0);
            opacity: 1;
            transition: transform 300ms ease-out, opacity 300ms ease-out;
          }
          .sidebar-exit {
            transform: translateX(0);
            opacity: 1;
          }
          .sidebar-exit-active {
            transform: translateX(-100%);
            opacity: 0;
            transition: transform 300ms ease-in, opacity 300ms ease-in;
          }
        `}
      </style>
    </div>
  );
};

export default Sidebar;
