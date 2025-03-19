import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const subjects = [
  "Mathematics",
  "Science",
  "Social Science",
  "English",
  "Hindi",
  "Sanskrit",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Civics",
  "Economics",
  "Business Studies",
  "Accountancy",
  "Computer Science",
  "Information Technology",
  "Physical Education",
  "Environmental Studies",
  "General Knowledge",
  "Art and Craft",
  "Music",
  "Dance",
  "Home Science",
  "Psychology",
  "Sociology",
  "Political Science",
  "Biotechnology",
  "Engineering Graphics",
  "Entrepreneurship",
];

const classes = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

const AddTeacher = ({ fetchData = () => {} }) => {
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherSchoolId, setTeacherSchoolId] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectClasses, setSubjectClasses] = useState({}); // { subject: [classes] }
  const [schools, setSchools] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null); // Track expanded subject

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "schools"));
        const schoolList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          uniqueId: doc.data().uniqueId,
          schoolName: doc.data().schoolName,
        }));
        setSchools(schoolList);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };
    fetchSchools();
  }, []);

  const handleSubjectSelection = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
      const updatedSubjectClasses = { ...subjectClasses };
      delete updatedSubjectClasses[subject];
      setSubjectClasses(updatedSubjectClasses);
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
      setSubjectClasses({ ...subjectClasses, [subject]: [] });
    }
  };

  const handleClassSelection = (subject, selectedClass) => {
    const updatedClasses = subjectClasses[subject] || [];
    if (updatedClasses.includes(selectedClass)) {
      setSubjectClasses({
        ...subjectClasses,
        [subject]: updatedClasses.filter((c) => c !== selectedClass),
      });
    } else {
      setSubjectClasses({
        ...subjectClasses,
        [subject]: [...updatedClasses, selectedClass],
      });
    }
  };

  const toggleSubjectAccordion = (subject) => {
    if (expandedSubject === subject) {
      setExpandedSubject(null); // Collapse if already expanded
    } else {
      setExpandedSubject(subject); // Expand the selected subject
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!teacherSchoolId || selectedSubjects.length === 0) {
      alert("Please select a school and at least one subject.");
      return;
    }

    try {
      // Step 1: Add the teacher to the "teachers" collection
      const teacherRef = await addDoc(collection(db, "teachers"), {
        name: teacherName,
        email: teacherEmail,
        schoolId: teacherSchoolId,
        subjects: selectedSubjects, // Save the array of subjects
      });

      // Step 2: Add subjects and classes to the teacher's document
      for (const subject of selectedSubjects) {
        const subjectRef = collection(db, `teachers/${teacherRef.id}/subjects`);
        await addDoc(subjectRef, {
          subject,
          classes: subjectClasses[subject] || [], // Save the array of classes for the subject
        });
      }

      // Step 3: Update the school document to include the new teacher's ID
      const schoolsQuery = query(collection(db, "schools"), where("uniqueId", "==", teacherSchoolId));
      const schoolSnapshot = await getDocs(schoolsQuery);

      if (schoolSnapshot.empty) {
        throw new Error("School not found with the provided uniqueId.");
      }

      const schoolDoc = schoolSnapshot.docs[0];
      const schoolRef = doc(db, "schools", schoolDoc.id);

      const currentTeachers = schoolDoc.data().teachers || [];
      await updateDoc(schoolRef, {
        teachers: [...currentTeachers, teacherRef.id],
      });

      console.log("Teacher added with ID:", teacherRef.id);
      setTeacherName("");
      setTeacherEmail("");
      setTeacherSchoolId("");
      setSelectedSubjects([]);
      setSubjectClasses({});

      // Call fetchData only if it's a function
      if (typeof fetchData === "function") {
        fetchData();
      }

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

        {/* Subject Selection */}
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-slate-100 mb-2">Select Subjects</h4>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div key={subject} className="bg-gray-600 p-3 rounded-lg">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSubjectAccordion(subject)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={subject}
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => handleSubjectSelection(subject)}
                      className="mr-2"
                    />
                    <label htmlFor={subject} className="text-slate-100">
                      {subject}
                    </label>
                  </div>
                  <span className="text-slate-100">
                    {expandedSubject === subject ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </div>
                {expandedSubject === subject && (
                  <div className="mt-2 pl-6">
                    <h4 className="text-md font-semibold text-slate-100 mb-2">
                      Select Classes for {subject}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {classes.map((cls) => (
                        <div key={cls} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${subject}-${cls}`}
                            checked={subjectClasses[subject]?.includes(cls)}
                            onChange={() => handleClassSelection(subject, cls)}
                            className="mr-2"
                          />
                          <label htmlFor={`${subject}-${cls}`} className="text-slate-100">
                            {cls}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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