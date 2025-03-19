import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FaSave, FaChalkboardTeacher, FaTrash, FaPlus } from "react-icons/fa";

const TeacherDetails = () => {
  const [teacher, setTeacher] = useState(null);
  const [subjectsWithClasses, setSubjectsWithClasses] = useState([]);
  const [curriculumLogs, setCurriculumLogs] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [updatedTeacher, setUpdatedTeacher] = useState({ name: "", email: "", schoolId: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // Extract teacherId from URL
  const queryParams = new URLSearchParams(location.search);
  const teacherId = queryParams.get("teacherId");

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      if (!teacherId) return;

      // Fetch teacher details
      const teacherRef = doc(db, "teachers", teacherId);
      const teacherSnap = await getDoc(teacherRef);

      if (teacherSnap.exists()) {
        const teacherData = teacherSnap.data();
        setTeacher(teacherData);
        setUpdatedTeacher(teacherData);

        // Fetch subjects and classes
        const subjectsRef = collection(db, `teachers/${teacherId}/subjects`);
        const subjectsSnapshot = await getDocs(subjectsRef);
        const subjectsData = subjectsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSubjectsWithClasses(subjectsData);

        // Fetch curriculum logs
        const curriculumRef = collection(db, `teachers/${teacherId}/curriculum`);
        const curriculumSnapshot = await getDocs(curriculumRef);
        const curriculumData = curriculumSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCurriculumLogs(curriculumData);

        // Fetch daily logs
        const logsRef = collection(db, `teachers/${teacherId}/logs`);
        const logsSnapshot = await getDocs(logsRef);
        const logsData = logsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDailyLogs(logsData);
      } else {
        console.error("Teacher not found");
      }
    };

    fetchTeacherDetails();
  }, [teacherId]);

  // Handle input changes for teacher details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTeacher({ ...updatedTeacher, [name]: value });
  };

  // Handle subject changes
  const handleSubjectChange = (index, value) => {
    const updatedSubjects = [...subjectsWithClasses];
    updatedSubjects[index].subject = value;
    setSubjectsWithClasses(updatedSubjects);
  };

  // Handle class change
  const handleClassChange = (subjectIndex, classIndex, value) => {
    const updatedSubjects = [...subjectsWithClasses];
    updatedSubjects[subjectIndex].classes[classIndex] = value;
    setSubjectsWithClasses(updatedSubjects);
  };

  // Add new subject
  const addSubject = () => {
    setSubjectsWithClasses([...subjectsWithClasses, { subject: "", classes: [""] }]);
  };

  // Remove a subject
  const removeSubject = (index) => {
    const updatedSubjects = subjectsWithClasses.filter((_, i) => i !== index);
    setSubjectsWithClasses(updatedSubjects);
  };

  // Add new class to subject
  const addClassToSubject = (index) => {
    const updatedSubjects = [...subjectsWithClasses];
    updatedSubjects[index].classes.push("");
    setSubjectsWithClasses(updatedSubjects);
  };

  // Remove a class
  const removeClass = (subjectIndex, classIndex) => {
    const updatedSubjects = [...subjectsWithClasses];
    updatedSubjects[subjectIndex].classes.splice(classIndex, 1);
    setSubjectsWithClasses(updatedSubjects);
  };

  // Save updated details
  const handleSave = async () => {
    try {
      const teacherRef = doc(db, "teachers", teacherId);
      await updateDoc(teacherRef, updatedTeacher);

      // Update subjects in Firestore
      for (let subject of subjectsWithClasses) {
        const subjectRef = doc(db, `teachers/${teacherId}/subjects`, subject.id);
        await updateDoc(subjectRef, { subject: subject.subject, classes: subject.classes });
      }

      setTeacher(updatedTeacher);
      setEditMode(false);
      alert("Teacher details updated successfully!");
    } catch (error) {
      console.error("Error updating teacher details:", error);
      alert("Failed to update teacher details.");
    }
  };

  if (!teacher) {
    return <div className="text-white text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Teacher Details</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        {/* Name */}
        <div className="mb-4">
          <label className="text-white font-medium">Name</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={updatedTeacher.name}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded-lg mt-1 focus:outline-none"
            />
          ) : (
            <p className="text-white">{teacher.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-white font-medium">Email</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={updatedTeacher.email}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded-lg mt-1 focus:outline-none"
            />
          ) : (
            <p className="text-white">{teacher.email}</p>
          )}
        </div>

        {/* School ID */}
        <div className="mb-4">
          <label className="text-white font-medium">School ID</label>
          {editMode ? (
            <input
              type="text"
              name="schoolId"
              value={updatedTeacher.schoolId}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded-lg mt-1 focus:outline-none"
            />
          ) : (
            <p className="text-white">{teacher.schoolId}</p>
          )}
        </div>

        {/* Subjects and Classes */}
        <div className="mb-4">
          <label className="text-white font-medium">Subjects and Classes</label>
          {editMode ? (
            <div>
              {subjectsWithClasses.map((subjectData, subjectIndex) => (
                <div key={subjectIndex} className="mt-2">
                  <input
                    type="text"
                    value={subjectData.subject}
                    onChange={(e) => handleSubjectChange(subjectIndex, e.target.value)}
                    className="bg-gray-700 text-white p-2 rounded-lg w-full mb-2"
                  />
                  <button onClick={() => removeSubject(subjectIndex)} className="text-red-500 ml-2">
                    <FaTrash />
                  </button>
                  <ul className="mt-2">
                    {subjectData.classes.map((cls, classIndex) => (
                      <li key={classIndex} className="flex items-center">
                        <input
                          type="text"
                          value={cls}
                          onChange={(e) => handleClassChange(subjectIndex, classIndex, e.target.value)}
                          className="bg-gray-700 text-white p-2 rounded-lg w-full"
                        />
                        <button onClick={() => removeClass(subjectIndex, classIndex)} className="text-red-500 ml-2">
                          <FaTrash />
                        </button>
                      </li>
                    ))}
                    <button onClick={() => addClassToSubject(subjectIndex)} className="text-green-500 mt-2">
                      <FaPlus /> Add Class
                    </button>
                  </ul>
                </div>
              ))}
              <button onClick={addSubject} className="text-green-500 mt-4">
                <FaPlus /> Add Subject
              </button>
            </div>
          ) : (
            <div>
              {subjectsWithClasses.map((subject) => (
                <div key={subject.subject} className="mb-4">
                  <p className="text-white font-medium">{subject.subject}</p>
                  <ul className="text-gray-400">
                    {subject.classes.map((cls, index) => (
                      <li key={index}>{cls}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Curriculum Logs */}
        <div className="mb-4">
          <label className="text-white font-medium">Curriculum Logs</label>
          <div className="mt-2">
            {curriculumLogs.map((log) => (
              <div key={log.id} className="bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-white"><strong>Subject:</strong> {log.subject}</p>
                <p className="text-white"><strong>Class:</strong> {log.class}</p>
                <p className="text-white"><strong>Book ID:</strong> {log.bookId}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Logs */}
        <div className="mb-4">
          <label className="text-white font-medium">Daily Logs</label>
          <div className="mt-2">
            {dailyLogs.map((log) => (
              <div key={log.id} className="bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-white"><strong>Subject:</strong> {log.subject}</p>
                <p className="text-white"><strong>Class:</strong> {log.class}</p>
                <p className="text-white"><strong>Day:</strong> {log.day}</p>
                <p className="text-white"><strong>Log:</strong> {log.log}</p>
                <p className="text-white"><strong>Timestamp:</strong> {log.timestamp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Save/Edit Button */}
        <div className="flex justify-end mt-6">
          {editMode ? (
            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-lg">
              <FaSave className="mr-2" />
              Save
            </button>
          ) : (
            <button onClick={() => setEditMode(true)} className="bg-indigo-500 text-white px-4 py-2 rounded-lg">
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;