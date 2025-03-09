import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaSave } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust the import path as needed

const QuestionPaperDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paper } = location.state || { paper: null };
  const [editedPaper, setEditedPaper] = useState(paper);
  const [editIndex, setEditIndex] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [examType, setExamType] = useState("Final Exam");
  const [subject, setSubject] = useState("Mathematics");
  const [totalDuration, setTotalDuration] = useState("2 Hours");
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch schoolId from URL
  const queryParams = new URLSearchParams(location.search);
  const schoolId = location.state?.schoolId || queryParams.get("schoolId");
  console.log("schoolId:", schoolId);

  // Fetch school name from Firebase
//   useEffect(() => {
//     const fetchSchoolName = async () => {
//       if (schoolId) {
//         const schoolDocRef = doc(db, "schools", schoolId);
//         const schoolDoc = await getDoc(schoolDocRef);
//         if (schoolDoc.exists()) {
//           setSchoolName(schoolDoc.data().name);
//         } else {
//           console.error("School not found");
//         }
//       }
//     };

//     fetchSchoolName();
//   }, [schoolId]);
const searchSchools = async () => {
    setLoading(true);

    try {
      // Create a query to search for documents in the "schools" collection
      const schoolsRef = collection(db, "schools");
      const q = query(
        schoolsRef,
        where("uniqueId", "==", schoolId)
      );

      // Execute the query
      const querySnapshot = await getDocs(q);

      // Extract the documents
      const schoolsData = [];
      querySnapshot.forEach((doc) => {
        schoolsData.push({ id: doc.id, ...doc.data() });
      });

      // Update state with the results
      setSchools(schoolsData);
      setSchoolName(schools[0].schoolName);
      console.log(schoolName)
      console.log("Schools found:", schoolsData);
    } catch (error) {
      console.error("Error searching schools:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchSchools(); // Trigger the search when the component mounts
  }, []);


  if (!editedPaper) {
    return <div className="text-center mt-10 text-gray-700">No question paper found.</div>;
  }

  // Calculate total marks dynamically
  const calculateTotalMarks = () => {
    return editedPaper.questions.reduce((total, question) => total + question.marks, 0);
  };

  const handleConfirm = () => {
    const totalMarks = calculateTotalMarks();
    if (totalMarks !== editedPaper.totalMarks) {
      setShowWarning(true); // Show warning if total marks don't match
    } else {
      navigate("/final-question-paper", {
        state: {
          paper: editedPaper,
          totalMarks,
          schoolName,
          examType,
          subject,
          totalDuration,
        },
      });
    }
  };

  const handleEditChange = (index, field, value, subpartIndex = null) => {
    const updatedQuestions = [...editedPaper.questions];
    if (subpartIndex !== null) {
      updatedQuestions[index].subparts[subpartIndex][field] = value;
    } else {
      updatedQuestions[index][field] = value;
    }
    setEditedPaper({ ...editedPaper, questions: updatedQuestions });
  };

  const handleMarksChange = (index, value) => {
    const updatedQuestions = [...editedPaper.questions];
    updatedQuestions[index].marks = parseInt(value, 10) || 0; // Ensure marks is a number
    setEditedPaper({ ...editedPaper, questions: updatedQuestions });
  };

  const handleOptionChange = (index, optionIndex, value) => {
    const updatedQuestions = [...editedPaper.questions];
    updatedQuestions[index].options[optionIndex] = value;
    setEditedPaper({ ...editedPaper, questions: updatedQuestions });
  };

  const handlePairChange = (index, pairIndex, field, value) => {
    const updatedQuestions = [...editedPaper.questions];
    updatedQuestions[index].pairs[pairIndex][field] = value;
    setEditedPaper({ ...editedPaper, questions: updatedQuestions });
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
  };

  const handleSave = () => {
    setEditIndex(null); // Exit edit mode
  };

  const handleDelete = (index) => {
    const updatedQuestions = editedPaper.questions.filter((_, i) => i !== index);
    setEditedPaper({ ...editedPaper, questions: updatedQuestions });
    setEditIndex(null); // Reset edit mode if the deleted question was being edited
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      question_number: editedPaper.questions.length + 1,
      question_type: "MCQ",
      question: "New question",
      options: ["Option A", "Option B", "Option C", "Option D"],
      marks: 5,
      chapter: "New Chapter",
    };
    setEditedPaper({ ...editedPaper, questions: [...editedPaper.questions, newQuestion] });
  };

  const handleHeaderEdit = () => {
    setIsEditingHeader(true);
  };

  const handleHeaderSave = () => {
    setIsEditingHeader(false);
  };

  const renderQuestion = (question, index) => {
    switch (question.question_type) {
      case "MCQ":
        return (
          <div className="border p-5 rounded-lg shadow-md bg-white mt-4">
            <h3 className="font-semibold text-lg">
              {question.question_number}. {question.question_type}
            </h3>
            {editIndex === index ? (
              <>
                <textarea
                  className="w-full mt-2 p-2 border rounded text-gray-900"
                  value={question.question}
                  onChange={(e) => handleEditChange(index, "question", e.target.value)}
                />
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800">Subparts:</h4>
                  {question.subparts.map((subpart, subIndex) => (
                    <div key={subIndex} className="mt-2">
                      <textarea
                        className="w-full p-2 border rounded text-gray-900"
                        value={subpart.question}
                        onChange={(e) =>
                          handleEditChange(index, "question", e.target.value, subIndex)
                        }
                      />
                      <div className="mt-2">
                        <h5 className="font-semibold text-gray-800">Options:</h5>
                        {subpart.options.map((option, optIndex) => (
                          <div key={optIndex} className="mt-2">
                            <input
                              type="text"
                              className="w-full p-2 border rounded text-gray-900"
                              value={option}
                              onChange={(e) =>
                                handleEditChange(
                                  index,
                                  "options",
                                  e.target.value,
                                  subIndex,
                                  optIndex
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="font-semibold text-gray-800">Marks:</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded text-gray-900"
                    value={question.marks}
                    onChange={(e) => handleMarksChange(index, e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-800 mt-2">{question.question}</p>
                <ul className="mt-2">
                  {question.subparts.map((subpart, subIndex) => (
                    <li key={subIndex} className="text-gray-800">
                      <p>{subpart.subpart_number}) {subpart.question}</p>
                      <ul className="ml-4">
                        {subpart.options.map((option, optIndex) => (
                          <li key={optIndex} className="text-gray-800">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-gray-600">Marks: {question.marks}</p>
              </>
            )}
            <p className="text-gray-600">Chapter: {question.chapter}</p>
          </div>
        );

      case "Fill in the Blanks"||"FillintheBlanks"||"fillintheblanks"||"FillInTheBlanks"||"FillinTheBlanks":
        return (
          <div className="border p-5 rounded-lg shadow-md bg-white mt-4">
            <h3 className="font-semibold text-lg">
              {question.question_number}. {question.question_type}
            </h3>
            {editIndex === index ? (
              <>
                <textarea
                  className="w-full mt-2 p-2 border rounded text-gray-900"
                  value={question.question}
                  onChange={(e) => handleEditChange(index, "question", e.target.value)}
                />
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800">Subparts:</h4>
                  {question.subparts.map((subpart, subIndex) => (
                    <div key={subIndex} className="mt-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded text-gray-900"
                        value={subpart.question}
                        onChange={(e) =>
                          handleEditChange(index, "question", e.target.value, subIndex)
                        }
                      />
                      {/* <input
                        type="text"
                        className="w-full p-2 border rounded text-gray-900 mt-2"
                        value={subpart.correct_answer}
                        onChange={(e) =>
                          handleEditChange(index, "correct_answer", e.target.value, subIndex)
                        }
                      /> */}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-800 mt-2">{question.question}</p>
                <ul className="mt-2">
                  {question.subparts.map((subpart, subIndex) => (
                    <li key={subIndex} className="text-gray-800">
                      {subpart.subpart_number}) {subpart.question} 
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-2 text-gray-600">Marks: {question.marks}</p>
            <p className="text-gray-600">Chapter: {question.chapter}</p>
          </div>
        );

      case "Match the Following"||"MatchTheFollowing"||"matchthefollowing":
        return (
          <div className="border p-5 rounded-lg shadow-md bg-white mt-4">
            <h3 className="font-semibold text-lg">
              {question.question_number}. {question.question_type}
            </h3>
            {editIndex === index ? (
              <>
                <textarea
                  className="w-full mt-2 p-2 border rounded text-gray-900"
                  value={question.question}
                  onChange={(e) => handleEditChange(index, "question", e.target.value)}
                />
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800">Pairs:</h4>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2 text-left">Term</th>
                        <th className="border p-2 text-left">Definition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {question.pairs.map((pair, pairIndex) => (
                        <tr key={pairIndex} className="border">
                          <td className="border p-2">
                            <input
                              type="text"
                              className="w-full p-2 border rounded text-gray-900"
                              value={pair.term}
                              onChange={(e) =>
                                handlePairChange(index, pairIndex, "term", e.target.value)
                              }
                            />
                          </td>
                          <td className="border p-2">
                            <input
                              type="text"
                              className="w-full p-2 border rounded text-gray-900"
                              value={pair.definition}
                              onChange={(e) =>
                                handlePairChange(index, pairIndex, "definition", e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-800 mt-2">{question.question}</p>
                <table className="w-full border-collapse mt-4">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2 text-left">Term</th>
                      <th className="border p-2 text-left">Definition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {question.pairs.map((pair, pairIndex) => (
                      <tr key={pairIndex} className="border">
                        <td className="border p-2 text-gray-800">{pair.term}</td>
                        <td className="border p-2 text-gray-800">{pair.definition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            <p className="mt-2 text-gray-600">Marks: {question.marks}</p>
            <p className="text-gray-600">Chapter: {question.chapter}</p>
          </div>
        );

        default:
        return (
          <div className="border p-5 rounded-lg shadow-md bg-white mt-4">
            <h3 className="font-semibold text-lg">
              {question.question_number}. {question.question_type}
            </h3>
            {editIndex === index ? (
              <>
                <textarea
                  className="w-full mt-2 p-2 border rounded text-gray-900"
                  value={question.question}
                  onChange={(e) => handleEditChange(index, "question", e.target.value)}
                />
                <div className="mt-4">
                  <label className="font-semibold text-gray-800">Marks:</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded text-gray-900"
                    value={question.marks}
                    onChange={(e) => handleMarksChange(index, e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-800 mt-2">{question.question}</p>
                <p className="mt-2 text-gray-600">Marks: {question.marks}</p>
              </>
            )}
            <p className="text-gray-600">Chapter: {question.chapter}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-5 md:px-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Question Paper</h1>

      {/* Header Section */}
      <div className="border p-5 rounded-lg shadow-lg bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">School: {schoolName}</h2>
          {isEditingHeader ? (
            <button
              onClick={handleHeaderSave}
              className="bg-green-600 text-white py-1 px-3 rounded flex items-center"
            >
              <FaSave className="mr-2" /> Save
            </button>
          ) : (
            <button
              onClick={handleHeaderEdit}
              className="bg-yellow-500 text-white py-1 px-3 rounded flex items-center"
            >
              <FaEdit className="mr-2" /> Edit
            </button>
          )}
        </div>
        {isEditingHeader ? (
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-gray-800">School Name:</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-gray-900"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-gray-800">Exam Type:</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-gray-900"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-gray-800">Total Duration:</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-gray-900"
                value={totalDuration}
                onChange={(e) => setTotalDuration(e.target.value)}
              />
            </div>
            <div>
                <label className="font-semibold text-gray-800">Subject:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-gray-900"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
            </div>
            </div>
        ) : (
          <div>
            <p className="text-gray-700">Exam Type: {examType}</p>
            <p className="text-gray-700">Subject: {subject}</p>
            <p className="text-gray-700">Total Duration: {totalDuration}</p>
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div className="mt-6">
        {editedPaper.questions.map((question, index) => (
          <div key={index}>
            {renderQuestion(question, index)}
            <div className="flex space-x-3 mt-3">
              {editIndex === index ? (
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white py-1 px-3 rounded flex items-center"
                >
                  <FaSave className="mr-2" /> Save
                </button>
              ) : (
                <button
                  onClick={() => handleEditClick(index)}
                  className="bg-yellow-500 text-white py-1 px-3 rounded flex items-center"
                >
                  <FaEdit className="mr-2" /> Edit
                </button>
              )}
              <button
                onClick={() => handleDelete(index)}
                className="bg-red-600 text-white py-1 px-3 rounded flex items-center"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <button
        onClick={handleAddQuestion}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg mt-6 flex items-center"
      >
        <FaPlus className="mr-2" /> Add Question
      </button>

      {/* Warning Message */}
      {showWarning && (
        <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-semibold">Warning:</p>
          <p>
            The total marks ({calculateTotalMarks()}) do not match the desired total marks ({editedPaper.totalMarks}).
          </p>
          <p>Please adjust the marks of the questions, add new questions, or delete existing questions to match the desired total marks.</p>
        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        className="bg-green-600 text-white py-2 px-4 rounded-lg mt-6 flex items-center"
      >
        Confirm & Preview
      </button>
    </div>
  );
};

export default QuestionPaperDisplay;