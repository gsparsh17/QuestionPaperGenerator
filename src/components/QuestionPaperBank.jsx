import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const classes = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12"
];

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
  "Entrepreneurship"
];

const QuestionPaperBank = () => {
  const [papers, setPapers] = useState([]);
  const [filters, setFilters] = useState({
    class: "",
    schoolName: "",
    schoolId: "",
    subject: "",
  });
  const navigate = useNavigate();

  // Fetch question papers from Firestore
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questionPapers"));
        const paperList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPapers(paperList);
      } catch (error) {
        console.error("Error fetching question papers:", error);
      }
    };

    fetchPapers();
  }, []);

  // Filter papers based on filters
  const filteredPapers = papers.filter((paper) => {
    // console.log(Number(filters.class))
    const matchesClass = filters.class ? paper.class == filters.class : true;
    const matchesSchoolName = filters.schoolName
      ? paper.schoolName?.toLowerCase().includes(filters.schoolName.toLowerCase())
      : true;
    const matchesSchoolId = filters.schoolId
      ? paper.schoolId?.toLowerCase().includes(filters.schoolId.toLowerCase())
      : true;
    const matchesSubject = filters.subject ? paper.subject === filters.subject : true;
    return matchesClass && matchesSchoolName && matchesSchoolId && matchesSubject;
  });

  // Handle preview button click
  const handlePreview = (paper) => {
    navigate(`/question-paper-display?paperid=${paper.id}`, { state: { paper, schoolId: paper.schoolId } });
  };

  // Handle edit button click
  const handleEdit = (paper) => {
    navigate(`/final-question-paper?paperid=${paper.id}`, {
      state: {
        paper,
        totalMarks: paper.totalMarks,
        schoolName: paper.schoolName,
        examType: paper.examType,
        subject: paper.subject,
        class: paper.class,
        totalDuration: paper.totalDuration,
      },
    });
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-100">Question Paper Bank</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <select
  value={filters.class}
  onChange={(e) => {
    const selectedClass = e.target.value.replace("Class ", ""); // Extracts only the number
    setFilters({ ...filters, class: selectedClass });
  }}
  className="p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
>
  <option value="">All Classes</option>
  {classes.map((cls) => (
    <option key={cls} value={cls}>
      {cls}
    </option>
  ))}
</select>

        <input
          type="text"
          placeholder="Search by School Name"
          value={filters.schoolName}
          onChange={(e) => setFilters({ ...filters, schoolName: e.target.value })}
          className="p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
        />
        <input
          type="text"
          placeholder="Search by School ID"
          value={filters.schoolId}
          onChange={(e) => setFilters({ ...filters, schoolId: e.target.value })}
          className="p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
        />
        <select
          value={filters.subject}
          onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
          className="p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
        >
          <option value="">All Subjects</option>
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {/* Paper List */}
      <div className="space-y-4">
        {filteredPapers.map((paper) => (
          <div key={paper.id} className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-100">
              {paper.schoolName} - {paper.subject} (Class {paper.class})
            </h3>
            <p className="text-slate-300">School ID: {paper.schoolId}</p>
            <p className="text-slate-300">Exam Type: {paper.examType}</p>
            <p className="text-slate-300">Total Marks: {paper.totalMarks}</p>
            <p className="text-slate-300">Total Duration: {paper.totalDuration}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEdit(paper)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Preview
              </button>
              <button
                onClick={() => handlePreview(paper)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionPaperBank;