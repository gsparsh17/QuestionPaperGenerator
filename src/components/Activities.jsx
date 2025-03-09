import React, { useEffect, useState } from 'react'; 
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);  // Add loading state
  const [error, setError] = useState(null);      // Add error state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          // Query to fetch user activities based on user ID
          const q = query(collection(db, 'activities'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          
          const userActivities = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          setActivities(userActivities);
        } catch (err) {
          console.error("Error fetching activities:", err);
          setError("Failed to fetch activities. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        // Redirect to login if user is not authenticated
        navigate('/login');
      }
    };

    fetchActivities();
  }, [navigate]);

  if (loading) {
    return <p className="text-gray-500">Loading your activities...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col animate-fadeIn duration-1000">
      <p className="mt-7 mb-5 text-gray-400">Your Activities</p>
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div key={activity.id} className="mb-5">
            <p className="text-indigo-300">
              {activity.action} - {new Date(activity.timestamp?.toDate()).toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No activities yet.</p>
      )}
    </div>
  );
};

export default Activities;
