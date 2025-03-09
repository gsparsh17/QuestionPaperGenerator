import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaCalendar, FaCamera, FaBriefcase, FaBirthdayCake, FaEdit, FaSave, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [profession, setProfession] = useState('');
  const [className, setClassName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.displayName || '');
          setSelectedImage(userData.photoURL || null);
          setAge(userData.age || '');
          setProfession(userData.profession || '');
          setClassName(userData.className || '');
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUrl = reader.result;
        setSelectedImage(imageDataUrl);
        if (user) {
          try {
            await setDoc(doc(db, 'users', user.uid), {
              photoURL: imageDataUrl
            }, { merge: true });
            toast.success('Image uploaded and saved successfully!');
          } catch (error) {
            console.error("Error saving image:", error);
            toast.error('Failed to save image. Please try again.');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (user) {
      setIsSaving(true);
      try {
        await setDoc(doc(db, 'users', user.uid), {
          displayName,
          photoURL: selectedImage,
          email: user.email,
          age,
          profession,
        });
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving profile:", error);
        toast.error('Failed to update profile. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully!');
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              borderRadius: ["50% 50% 50% 50%", "50% 50% 50% 70%", "50% 50% 70% 50%", "50% 70% 50% 50%", "70% 50% 50% 50%"],
            }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity,
            }}
            className="w-16 h-16 bg-indigo-500 mx-auto mb-4"
          />
          <div className="text-2xl font-bold mb-2">Loading your profile</div>
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-lg text-indigo-300"
          >
            Please wait a moment...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-2xl font-bold">Please log in to view your profile.</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 relative">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
              src={selectedImage || user.photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=random`}
              alt="Profile"
              className="w-full h-full rounded-full border-4 border-gray-800 object-cover"
            />
            <label htmlFor="imageUpload" className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-all duration-300">
              <FaCamera className="text-white" />
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 space-y-3"
            >
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your name"
              />
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your age"
              />
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select your profession</option>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Engineer">Engineer</option>
                <option value="Doctor">Doctor</option>
                <option value="Other">Other</option>
              </select>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex-1 py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg transition-all duration-300 flex items-center justify-center transform hover:brightness-110`}
                >
                  {isSaving ? (
                    <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </motion.svg>
                  ) : (
                    <><FaSave className="mr-2" /> Save</>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05,}}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg transition-all duration-300 flex items-center justify-center transform hover:brightness-110"
                >
                  <FaTimes className="mr-2" /> Cancel
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="viewing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <h2 className="text-2xl font-bold text-center mb-4 text-white">{displayName || user.displayName || user.email}</h2>
              <div className="space-y-3">
                <ProfileItem icon={<FaUser />} text={displayName || user.displayName || 'Not set'} label="Name" />
                <ProfileItem icon={<FaEnvelope />} text={user.email} label="Email" />
                <ProfileItem icon={<FaCalendar />} text={user.metadata.creationTime} label="Joined" />
                <ProfileItem icon={<FaBirthdayCake />} text={age || 'Not set'} label="Age" />
                <ProfileItem icon={<FaBriefcase />} text={profession || 'Not set'} label="Profession" />
              </div>
              <motion.button
                whileHover={{ scale: 1.05}}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="w-full py-2 px-4 mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg transition-all duration-300 flex items-center justify-center transform hover:brightness-110"
              >
                <FaEdit className="mr-2" /> Edit Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05}}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="w-full py-2 px-4 mt-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg transition-all duration-300 flex items-center justify-center transform hover:brightness-110"
              >
                <FaSignOutAlt className="mr-2" /> Sign Out
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const ProfileItem = ({ icon, text, label }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center space-x-3"
  >
    <div className="text-purple-500">{icon}</div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-gray-200">{text}</p>
    </div>
  </motion.div>
);

export default ProfilePage;