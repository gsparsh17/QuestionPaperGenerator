import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const AddTeacher = ({ fetchData }) => {
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherSubject, setTeacherSubject] = useState("");
  const [teacherSchoolId, setTeacherSchoolId] = useState(""); // Store the uniqueId of the school
  const [schools, setSchools] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "schools"));
        const schoolList = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Firestore document ID (not used for saving)
          uniqueId: doc.data().uniqueId, // Unique school ID
          schoolName: doc.data().schoolName,
        }));
        setSchools(schoolList);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };
    fetchSchools();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!teacherSchoolId) {
      alert("Please select a school.");
      return;
    }

    try {
      const teacherRef = await addDoc(collection(db, "teachers"), {
        name: teacherName,
        email: teacherEmail,
        subject: teacherSubject,
        schoolId: teacherSchoolId, // Save uniqueId instead of doc.id
      });

      const schoolRef = doc(db, "schools", teacherSchoolId);
      await updateDoc(schoolRef, {
        teachers: [...(schools.find((s) => s.id === teacherSchoolId)?.teachers || []), teacherRef.id],
      });

      console.log("Teacher added with ID:", teacherRef.id);
      setTeacherName("");
      setTeacherEmail("");
      setTeacherSubject("");
      setTeacherSchoolId("");
      fetchData();
      setShowPopup(true);
    } catch (error) {
      console.error("Error adding teacher:", error);
      alert("Error adding teacher: " + error.message);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold mb-4 text-slate-100 flex items-center">
        Add Teacher
      </h3>
      <form onSubmit={handleAddTeacher} className="bg-gray-700 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Teacher Name"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="p-2 bg-gray-600 text-slate-100 rounded-lg focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Teacher Email"
            value={teacherEmail}
            onChange={(e) => setTeacherEmail(e.target.value)}
            className="p-2 bg-gray-600 text-slate-100 rounded-lg focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={teacherSubject}
            onChange={(e) => setTeacherSubject(e.target.value)}
            className="p-2 bg-gray-600 text-slate-100 rounded-lg focus:outline-none"
            required
          />
          <select
            value={teacherSchoolId}
            onChange={(e) => setTeacherSchoolId(e.target.value)}
            className="p-2 bg-gray-600 text-slate-100 rounded-lg focus:outline-none"
            required
          >
            <option value="">Select School</option>
            {schools.map((school) => (
              <option key={school.uniqueId} value={school.uniqueId}>
                {school.schoolName} (ID: {school.uniqueId})
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200"
        >
          Add Teacher
        </button>
      </form>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold">Teacher Added Successfully!</h2>
            <p className="text-gray-600 mt-2">The teacher has been added to the database.</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTeacher;
