import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSave, FaMagic } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { getFirestore, doc, updateDoc, collection, addDoc } from "firebase/firestore"; // Firebase Firestore
import { toast } from "react-toastify";

const AIPaperEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const schoolId = queryParams.get("schoolId");
  const teacherId = queryParams.get("teacherId");
  const selectedClass = queryParams.get("class");
  const selectedSubject = queryParams.get("subject");
  const requestId = queryParams.get("requestId");

  const [sections, setSections] = useState([]); // Initialize as an empty array
  const [isLoading, setIsLoading] = useState(false);

  // Generate paper pattern using Gemini API
  const generatePaperPattern = async () => {
    setIsLoading(true);

    try {
      // Define the prompt for Gemini API
      const prompt = `Generate a detailed paper pattern for ${selectedSubject} (Class ${selectedClass}) in JSON format with the following details:
- Include 3 sections (Section A, Section B, Section C).
- Each section should have a total marks value.
- Each section should have a list of questions with marks and optional subparts.
- Question types within a section can be random (e.g., MCQ, Short Answer, Long Answer, etc.).
- Ensure the paper pattern is balanced and appropriate for the class and subject.

### JSON Format:
{
  "sections": [
    {
      "name": "Section A",
      "totalMarks": 20,
      "questions": [
        {
          "type": "MCQ",
          "marks": 2,
          "question": "Sample MCQ question?",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "answer": "Option 1",
          "subparts": []
        },
        {
          "type": "Short Answer",
          "marks": 5,
          "question": "Sample short answer question?",
          "subparts": []
        }
      ]
    },
    {
      "name": "Section B",
      "totalMarks": 30,
      "questions": [
        {
          "type": "Long Answer",
          "marks": 10,
          "question": "Sample long answer question?",
          "subparts": [
            {
              "type": "Subpart",
              "marks": 5,
              "question": "Sample subpart question?"
            }
          ]
        }
      ]
    }
  ]
}`;

      // Call Gemini API
      const response = await fetchGeminiAPI(prompt);

      if (!response?.candidates || response.candidates.length === 0) {
        throw new Error("Invalid response format from API");
      }

      const logText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!logText) {
        throw new Error("Generated response is empty.");
      }

      // Clean and parse the response
      const cleanText = logText.replace(/```json|```/g, "").trim();
      const parsedPattern = JSON.parse(cleanText);

      // Ensure the parsed pattern has the correct structure
      if (!parsedPattern.sections || !Array.isArray(parsedPattern.sections)) {
        throw new Error("Invalid paper pattern format.");
      }

      // Update state with the generated paper pattern
      setSections(parsedPattern.sections);
      console.log(parsedPattern.sections)
      toast.success("Paper pattern generated successfully!");
    } catch (error) {
      console.error("Error generating paper pattern:", error);
      toast.error("Failed to generate paper pattern.");
    } finally {
      setIsLoading(false);
    }
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
    //   navigate("/dashboard"); // Redirect to the dashboard or another page
    } catch (error) {
      console.error("Error saving paper pattern:", error);
      toast.error("Failed to save paper pattern.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to call the Gemini API
  const fetchGeminiAPI = async (prompt) => {
    const apiKey = "AIzaSyAwNzTDuJ2ipBW-41QWhy04q3atK9ThkSk"; // Replace with your actual Gemini API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        AI Paper Editor
      </h1>

      {/* Generate Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={generatePaperPattern}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200"
        >
          <FaMagic className="mr-2" /> {isLoading ? "Generating..." : "Generate Paper Pattern"}
        </button>
      </div>

      {/* Generated Paper Pattern */}
      <div className="space-y-6">
        {sections && sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.name} className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {section.name} (Total Marks: {section.totalMarks})
              </h2>

              {/* Questions */}
              <div className="space-y-4">
                {section.questions && section.questions.length > 0 ? (
                  section.questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Question {index + 1} (Marks: {question.marks})
                      </h3>
                      <h4>{question.type}</h4>

                      {/* Subparts */}
                      <div className="space-y-3">
                        {question.subparts && question.subparts.length > 0 ? (
                          question.subparts.map((subpart, subIndex) => (
                            <div
                              key={subIndex}
                              className="bg-white p-3 rounded-lg border border-gray-200"
                            >
                              <h4 className="text-lg font-semibold text-gray-800">
                                Subpart {String.fromCharCode(97 + subIndex)} (Marks: {subpart.marks})
                              </h4>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No subparts for this question.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No questions in this section.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No sections generated yet. Click "Generate" to create a paper pattern.</p>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={savePaperPattern}
          disabled={isLoading || sections.length === 0}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200"
        >
          <FaSave className="mr-2" /> {isLoading ? "Saving..." : "Save Paper Pattern"}
        </button>
      </div>
    </div>
  );
};

export default AIPaperEditor;