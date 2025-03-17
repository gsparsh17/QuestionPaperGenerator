import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserActivities(currentUser);
      } else {
        setUser(null);
        setActivities([]);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserActivities = async (currentUser) => {
    if (currentUser) {
      try {
        const activitiesRef = collection(db, "users", currentUser.uid, "userActivities");
        const activitiesSnapshot = await getDocs(activitiesRef);
        const activitiesList = activitiesSnapshot.docs.map((doc) => ({
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
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return "Just now";
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? "day" : "days"} ago`;
      } else {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    return "";
  };

  const filteredActivities = activities.filter((activity) =>
    activity.activityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Recent Activities</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Activities List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center text-indigo-200 cursor-pointer hover:bg-gray-100 rounded-lg p-3 mb-3 transition-all duration-300 border border-gray-200 hover:border-indigo-500 hover:shadow-md"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 mr-3 animate-pulse"></div>
              <div className="flex-grow">
                <p className="text-gray-800 text-sm font-medium">{activity.activityType}</p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No activities found</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;