import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { getFirestore, doc, updateDoc, collection, addDoc } from "firebase/firestore"; // Firebase Firestore

const ManualPaperEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const schoolId = queryParams.get("schoolId");
  const teacherId = queryParams.get("teacherId");
  const selectedClass = queryParams.get("class");
  const selectedSubject = queryParams.get("subject");
  const requestId = queryParams.get("requestId");

  const [sections, setSections] = useState([
    {
      id: uuidv4(),
      name: "Section A",
      totalMarks: 20,
      questions: [
        {
          id: uuidv4(),
          type: "MCQ",
          marks: 2,
          subparts: [],
        },
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Add a new section
  const addSection = () => {
    const newSection = {
      id: uuidv4(),
      name: `Section ${String.fromCharCode(65 + sections.length)}`, // A, B, C, etc.
      totalMarks: 0,
      questions: [
        {
          id: uuidv4(),
          type: "MCQ",
          marks: 2,
          subparts: [],
        },
      ],
    };
    setSections([...sections, newSection]);
  };

  // Update section details
  const updateSection = (sectionId, field, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  // Add a new question to a section
  const addQuestion = (sectionId) => {
    const newQuestion = {
      id: uuidv4(),
      type: "MCQ",
      marks: 2,
      subparts: [],
    };
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    );
  };

  // Update question details
  const updateQuestion = (sectionId, questionId, field, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? { ...question, [field]: value }
                  : question
              ),
            }
          : section
      )
    );
  };

  // Add a subpart to a question
  const addSubpart = (sectionId, questionId) => {
    const newSubpart = {
      id: uuidv4(),
      marks: 1,
    };
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      subparts: [...question.subparts, newSubpart],
                    }
                  : question
              ),
            }
          : section
      )
    );
  };

  // Update subpart details
  const updateSubpart = (sectionId, questionId, subpartId, field, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      subparts: question.subparts.map((subpart) =>
                        subpart.id === subpartId
                          ? { ...subpart, [field]: value }
                          : subpart
                      ),
                    }
                  : question
              ),
            }
          : section
      )
    );
  };

  // Delete a section
  const deleteSection = (sectionId) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  };

  // Delete a question
  const deleteQuestion = (sectionId, questionId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter(
                (question) => question.id !== questionId
              ),
            }
          : section
      )
    );
  };

  // Delete a subpart
  const deleteSubpart = (sectionId, questionId, subpartId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      subparts: question.subparts.filter(
                        (subpart) => subpart.id !== subpartId
                      ),
                    }
                  : question
              ),
            }
          : section
      )
    );
  };

  // Save the paper pattern
  const savePaperPattern = async () => {
    setIsLoading(true);
  
    try {
      const db = getFirestore();
  
      // Create the paper pattern object
      const paperPattern = {
        schoolId,
        teacherId,
        class: selectedClass,
        subject: selectedSubject,
        sections,
        status: "set", // Update status to "set"
        createdAt: new Date(),
      };
  
      // Save to the "paperPatterns" collection
      const paperPatternsCollection = collection(db, "paperPatterns");
      await addDoc(paperPatternsCollection, paperPattern);
  
      // Save to the teacher's Exams collection
      const teacherExamsCollection = collection(db, `teachers/${teacherId}/Exams`);
      await addDoc(teacherExamsCollection, {
        ...paperPattern,
        requestId, // Include the requestId for reference
      });
  
      // Save to the school's examRequests collection
      const schoolExamRequestsCollection = collection(db, `schools/${schoolId}/examRequests`);
      await addDoc(schoolExamRequestsCollection, {
        ...paperPattern,
        teacherId,
        teacherName: "Teacher Name", // Replace with actual teacher name if available
        requestId, // Include the requestId for reference
      });
  
      // Update the request status in the teacher's Exams collection
      const teacherExamRequestRef = doc(db, `teachers/${teacherId}/Exams`, requestId);
      await updateDoc(teacherExamRequestRef, { status: "set" });
  
      // Update the request status in the school's examRequests collection
      const schoolExamRequestRef = doc(db, `schools/${schoolId}/examRequests`, requestId);
      await updateDoc(schoolExamRequestRef, { status: "set" });
  
      toast.success("Paper pattern saved successfully!");
      navigate("/dashboard"); // Redirect to the dashboard or another page
    } catch (error) {
      console.error("Error saving paper pattern:", error);
      toast.error("Failed to save paper pattern.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Manual Paper Editor
      </h1>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {section.name} (Total Marks: {section.totalMarks})
              </h2>
              <button
                onClick={() => deleteSection(section.id)}
                className="text-red-500 hover:text-red-600"
              >
                <FaTrash className="text-lg" />
              </button>
            </div>

            {/* Section Total Marks Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Total Marks
              </label>
              <input
                type="number"
                value={section.totalMarks}
                onChange={(e) =>
                  updateSection(section.id, "totalMarks", parseInt(e.target.value))
                }
                className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {section.questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Question {section.questions.indexOf(question) + 1} (Marks: {question.marks})
                    </h3>
                    <button
                      onClick={() => deleteQuestion(section.id, question.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>

                  {/* Question Marks */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks
                    </label>
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) =>
                        updateQuestion(section.id, question.id, "marks", parseInt(e.target.value))
                      }
                      className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Subparts */}
                  <div className="space-y-3">
                    {question.subparts.map((subpart) => (
                      <div
                        key={subpart.id}
                        className="bg-white p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">
                            Subpart {String.fromCharCode(97 + question.subparts.indexOf(subpart))} (Marks: {subpart.marks})
                          </h4>
                          <button
                            onClick={() =>
                              deleteSubpart(section.id, question.id, subpart.id)
                            }
                            className="text-red-500 hover:text-red-600"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>

                        {/* Subpart Marks */}
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Marks
                          </label>
                          <input
                            type="number"
                            value={subpart.marks}
                            onChange={(e) =>
                              updateSubpart(
                                section.id,
                                question.id,
                                subpart.id,
                                "marks",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Subpart Button */}
                  <button
                    onClick={() => addSubpart(section.id, question.id)}
                    className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    Add Subpart
                  </button>
                </div>
              ))}
            </div>

            {/* Add Question Button */}
            <button
              onClick={() => addQuestion(section.id)}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              Add Question
            </button>
          </div>
        ))}
      </div>

      {/* Add Section Button */}
      <button
        onClick={addSection}
        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
      >
        Add Section
      </button>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={savePaperPattern}
          disabled={isLoading}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200"
        >
          <FaSave className="mr-2" /> {isLoading ? "Saving..." : "Save Paper Pattern"}
        </button>
      </div>
    </div>
  );
};

export default ManualPaperEditor;