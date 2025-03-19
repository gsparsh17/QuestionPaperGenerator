import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SetExams = ({ schoolId, onBack }) => {
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examRequests, setExamRequests] = useState([]); // State to store exam requests
  const [isGenerating, setIsGenerating] = useState(false); // State to track AI generation process
  const navigate = useNavigate();

  // Fetch teachers and their associated classes based on selected classes
  useEffect(() => {
    const fetchTeachers = async () => {
      if (selectedClasses.length === 0) return;

      setLoading(true);
      try {
        // Fetch all teachers for the school
        const teachersQuery = query(
          collection(db, "teachers"),
          where("schoolId", "==", schoolId)
        );
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersData = [];

        // Iterate through each teacher
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherId = teacherDoc.id;
          const teacherData = teacherDoc.data();

          // Fetch the teacher's subjects collection
          const subjectsRef = collection(db, `teachers/${teacherId}/subjects`);
          const subjectsSnapshot = await getDocs(subjectsRef);

          // Iterate through each subject
          for (const subjectDoc of subjectsSnapshot.docs) {
            const subjectData = subjectDoc.data();
            const classes = subjectData.classes || [];

            // Check if any of the selected classes are in this subject's classes array
            const hasSelectedClass = selectedClasses.some((cls) =>
              classes.includes(cls)
            );

            if (hasSelectedClass) {
              teachersData.push({
                id: teacherId,
                name: teacherData.name,
                subject: subjectData.subject, // Assuming subjectName is the field for subject name
                classes: classes,
              });
            }
          }
        }

        setTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [selectedClasses, schoolId]);

  // Fetch exam requests for the school
  useEffect(() => {
    const fetchExamRequests = async () => {
      try {
        const examRequestsQuery = query(
          collection(db, "schools", schoolId, "examRequests")
        );
        const examRequestsSnapshot = await getDocs(examRequestsQuery);
        const requests = examRequestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExamRequests(requests);
      } catch (error) {
        console.error("Error fetching exam requests:", error);
      }
    };

    fetchExamRequests();
  }, [schoolId]);

  // Handle class selection
  const handleClassSelection = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedClasses([...selectedClasses, value]);
    } else {
      setSelectedClasses(selectedClasses.filter((cls) => cls !== value));
    }
  };

  // Handle sending exam notifications
  const handleSendNotifications = async () => {
    try {
      for (const teacher of teachers) {
        // Iterate through each selected class
        for (const selectedClass of selectedClasses) {
          // Check if the teacher teaches this class for the subject
          if (teacher.classes.includes(selectedClass)) {
            const examRequest = {
              schoolId,
              class: selectedClass, // Single class per request
              subject: teacher.subject, // Single subject per request
              status: "Pending",
              timestamp: new Date().toISOString(),
            };

            // Generate a unique document ID
            const examDocRef = doc(collection(db, `teachers/${teacher.id}/Exams`));
            const docId = examDocRef.id; // Get the generated ID

            // Add exam request to the teacher's Exams collection with the same docId
            await setDoc(examDocRef, { ...examRequest, docId });

            // Also add the same exam request to the school's examRequests collection using the same docId
            await setDoc(doc(db, "schools", schoolId, "examRequests", docId), {
              teacherId: teacher.id,
              teacherName: teacher.name,
              ...examRequest,
              docId, // Store docId for reference
            });
          }
        }
      }
      alert("Exam notifications sent successfully!");

      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error("Error sending notifications:", error);
      alert("Failed to send notifications.");
    }
  };

  // Handle generating a question paper
  const handleGeneratePaper = async (request) => {
    setIsGenerating(true); // Start loading
    console.log("Starting paper generation...");
  
    try {
      // Fetch the saved paper pattern for this request
      const paperPatternQuery = query(
        collection(db, "paperPatterns"),
        where("class", "==", request.class),
        where("subject", "==", request.subject)
      );
      const paperPatternSnapshot = await getDocs(paperPatternQuery);
      console.log("Fetched paper pattern snapshot:", paperPatternSnapshot);
  
      // Check if the paper pattern exists
      if (paperPatternSnapshot.empty) {
        console.log("No paper pattern found for this request.");
        toast.error("No paper pattern found for this request.");
        return;
      }
  
      // Get the first matching paper pattern
      const paperPattern = paperPatternSnapshot.docs[0].data();
      console.log("Fetched paper pattern:", paperPattern);
  
      // Validate the paper pattern structure
      if (!paperPattern || !paperPattern.sections || !Array.isArray(paperPattern.sections)) {
        console.log("Invalid paper pattern structure:", paperPattern);
        toast.error("Invalid paper pattern structure.");
        return;
      }
  
      // Validate each section in the paper pattern
      for (const section of paperPattern.sections) {
        if (!section.questions || !Array.isArray(section.questions)) {
          console.log("Invalid section structure:", section);
          toast.error("Invalid section structure in paper pattern.");
          return;
        }
      }
  
      // Calculate total questions and question types
      const totalQuestions = paperPattern.sections.reduce(
        (total, section) => total + (section.questions ? section.questions.length : 0),
        0
      );
      const questionTypes = paperPattern.sections
        .flatMap((section) => (section.questions ? section.questions.map((q) => q.type) : []))
        .join(", ");
      // Define the Gemini API prompt
      const prompt = `Generate a question paper in JSON format with the following details:
    - Difficulty: Medium
    - Total Marks: ${paperPattern.totalMarks}
    - Total Questions: ${totalQuestions}
    - Chapters: All
    - Question Types: ${questionTypes}
    - Based on the following paper pattern:
    ${JSON.stringify(paperPattern)}

    ### Instructions:
    1. Ensure the total marks for all questions add up to exactly ${paperPattern.totalMarks}.
    2. Follow the marks distribution strictly.
    3. Distribute questions across the specified chapters.
    4. Ensure the JSON structure is valid and follows the format below.
    5. Questions should only be of selected types: ${questionTypes}.
        
         ### JSON Format:
      {
        "totalMarks": ${paperPattern.totalMarks},
        "totalQuestions": ${totalQuestions},
        "chapters": ${JSON.stringify(paperPattern.chapters.split(",").map((chap) => chap.trim()))},
        "questions": [
          {
            "question_number": 1,
            "question_type": "MCQ",
            "question": "Multiple Choice Questions",
            "subparts": [
              {
                "subpart_number": "a",
                "question": "What is the primary problem addressed by Questera?",
                "options": [
                  "Lack of investment opportunities for young adults.",
                  "Low interest rates on savings accounts.",
                  "Widespread financial illiteracy.",
                  "Lack of access to credit for students."
                ],
                "correct_option": "Widespread financial illiteracy.",
                "marks": 1
              },
              // Add 4 more subparts for MCQ
            ],
            "marks": 5,
            "chapter": "Introduction to Finance"
          },
          {
            "question_number": 2,
            "question_type": "Short Answer",
            "question": "Explain the situation of financial literacy in India.",
            "marks": 5,
            "chapter": "Financial Education in India"
          },
          {
            "question_number": 3,
            "question_type": "Long Answer",
            "question": "Discuss the impact of financial literacy on economic growth in developing countries.",
            "marks": 10,
            "chapter": "Global Financial Systems"
          },
          {
            "question_number": 4,
            "question_type": "Case Study",
            "question": "Read the following case study and answer the questions below: [Case Study Text]",
            "sub_questions": [
              {
                "question": "What are the key challenges faced by the organization in the case study?",
                "marks": 5,
                "chapter": "Case Studies in Finance"
              },
              {
                "question": "Suggest solutions to address the challenges mentioned above.",
                "marks": 5,
                "chapter": "Case Studies in Finance"
              }
            ],
            "marks": 10,
            "chapter": "Case Studies in Finance"
          },
          {
            "question_number": 5,
            "question_type": "Fill in the Blanks",
            "question": "Fill in the blanks with the correct terms:",
            "subparts": [
              {
                "subpart_number": "a",
                "question": "The process of managing money to achieve personal economic satisfaction is called __________.",
                "correct_answer": "financial planning",
                "marks": 1
              },
              // Add 4 more subparts for Fill in the Blanks
            ],
            "marks": 5,
            "chapter": "Personal Finance"
          },
          {
            "question_number": 6,
            "question_type": "Match the Following",
            "question": "Match the following terms with their correct definitions:",
            "pairs": [
              {
                "term": "Inflation",
                "definition": "A general increase in prices and fall in the purchasing value of money."
              },
              // Add 4 more pairs for Match the Following
            ],
            "marks": 5,
            "chapter": "Economic Concepts"
          }
      ]}`;

      console.log("Sending prompt to Gemini API...");

    // Call the Gemini API
    const response = await fetchGeminiAPI(prompt);
    console.log("Received response from Gemini API:", response);

    // Extract the text from the response
    const responseText = response.candidates[0].content.parts[0].text;

    // Clean the response by removing Markdown code blocks
    const cleanResponseText = responseText.replace(/```json|```/g, "").trim();
    console.log("Cleaned response text:", cleanResponseText);

    // Parse the generated paper
    let generatedPaper;
    try {
      generatedPaper = JSON.parse(cleanResponseText);
      console.log("Generated paper:", generatedPaper);
    } catch (error) {
      console.error("Error parsing generated paper:", error);
      toast.error("Failed to parse the generated paper.");
      return;
    }

    // Validate the generated paper
    if (!generatedPaper || !generatedPaper.questions || !Array.isArray(generatedPaper.questions)) {
      console.log("Invalid paper generated by Gemini API.");
      toast.error("Invalid paper generated by Gemini API.");
      return;
    }

    // Navigate to the QuestionPaperDisplay page with the generated paper
    console.log("Navigating to QuestionPaperDisplay...");
    navigate("/question-paper-display", {
      state: {
        paper: generatedPaper,
        schoolId: request.schoolId,
        teacherId: request.teacherId,
        class: request.class,
        subject: request.subject,
        requestId: request.id,
      },
    });
  } catch (error) {
    console.error("Error generating paper:", error);
    toast.error("Failed to generate paper.");
  } finally {
    setIsGenerating(false); // Stop loading
    console.log("Loader stopped.");
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
   <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
     <h1 className="text-4xl font-bold text-white mb-8 text-center">Set Exams</h1>

     {/* Back Button */}
     <button
       onClick={onBack}
       className="relative text-indigo-500 rounded-full shadow-lg hover:text-white transition-colors duration-200 mb-8"
     >
       &larr; Back
     </button>

     {/* Class Selection */}
     <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
       <h2 className="text-2xl font-semibold text-white mb-4">Select Classes</h2>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {["Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
           "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
           "Class 11", "Class 12"
         ].map((cls) => (
           <label key={cls} className="flex items-center space-x-2 text-white">
             <input
               type="checkbox"
               value={cls}
               onChange={handleClassSelection}
               className="form-checkbox h-5 w-5 text-indigo-600 rounded"
             />
             <span>{cls}</span>
           </label>
         ))}
       </div>
     </div>

     {/* Teachers Table */}
     {loading ? (
       <div className="text-white text-center py-8">Loading teachers...</div>
     ) : (
       <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
         <h2 className="text-2xl font-semibold text-white mb-4">Associated Teachers</h2>
         <table className="w-full text-white">
           <thead>
             <tr>
               <th className="py-2">Teacher Name</th>
               <th className="py-2">Subject</th>
               <th className="py-2">Classes</th>
             </tr>
           </thead>
           <tbody>
             {teachers.map((teacher) => {
               // Filter selectedClasses to only include classes that match the teacher's classes
               const matchingClasses = selectedClasses.filter((cls) =>
                 teacher.classes.includes(cls)
               );

               return (
                 <tr key={teacher.id} className="border-b border-gray-700">
                   <td className="py-2 text-center">{teacher.name}</td>
                   <td className="py-2 text-center">{teacher.subject}</td>
                   <td className="py-2 text-center">
                     {matchingClasses.length > 0 ? matchingClasses.join(", ") : "No matching classes"}
                   </td>
                 </tr>
               );
             })}
           </tbody>
         </table>
       </div>
     )}

     {/* Send Notifications Button */}
     {teachers.length > 0 && (
       <div className="flex justify-end mt-6">
         <motion.button
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={handleSendNotifications}
           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
         >
           Send Notifications
         </motion.button>
       </div>
     )}

     {/* On Progress Notifications Section */}
     <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-8">
       <h2 className="text-2xl font-semibold text-white mb-4">On Progress Notifications</h2>
       <table className="w-full text-white">
         <thead>
           <tr>
             <th className="py-2">Teacher Name</th>
             <th className="py-2">Subject</th>
             <th className="py-2">Class</th>
             <th className="py-2">Status</th>
             <th className="py-2">Action</th>
           </tr>
         </thead>
         <tbody>
           {examRequests.map((request) => (
             <tr key={request.id} className="border-b border-gray-700">
               <td className="py-2 text-center">{request.teacherName}</td>
               <td className="py-2 text-center">{request.subject}</td>
               <td className="py-2 text-center">{request.class}</td>
               <td className="py-2 text-center">
                 <span
                   className={`px-2 py-1 rounded-full text-sm ${
                     request.status === "Pending"
                       ? "bg-yellow-500"
                       : request.status === "set"
                       ? "bg-green-500"
                       : "bg-red-500"
                   }`}
                 >
                   {request.status}
                 </span>
               </td>
               <td className="py-2 text-center">
                 {request.status === "set" && (
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => handleGeneratePaper(request)}
                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                     disabled={isGenerating} // Disable button while generating
                   >
                     {isGenerating ? "Generating..." : "Generate Paper"}
                   </motion.button>
                 )}
               </td>
             </tr>
           ))}
         </tbody>
       </table>
     </div>

     {/* Loader for AI Generation */}
     {isGenerating && (
       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
         <div className="bg-white p-6 rounded-lg shadow-lg text-center">
           <h2 className="text-xl font-bold mb-4">Generating Paper...</h2>
           <p className="text-gray-600">Please wait while the AI generates the question paper.</p>
           <div className="mt-4">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default SetExams;