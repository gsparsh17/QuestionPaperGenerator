import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSave, FaDownload, FaPlus, FaTrash, FaLightbulb, FaSearch, FaTimes, FaEdit } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import * as pdfjsLib from "pdfjs-dist";
import { getFirestore, collection, getDocs, addDoc, doc, getDoc, updateDoc } from "firebase/firestore"; // Firebase Firestore

// Manually set the worker file path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
      marks: 20,
      questions: [],
    },
  ]);
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  const [questionSuggestions, setQuestionSuggestions] = useState([]); // AI-generated suggestions
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls sidebar visibility
  const [uploadedBooks, setUploadedBooks] = useState([]); // List of uploaded books
  const [selectedBookUrl, setSelectedBookUrl] = useState(""); // Selected book URL
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [filters, setFilters] = useState({ subject: "", class: "" }); // Filters for subject and class
  const [filteredBooks, setFilteredBooks] = useState([]); // Books filtered by search and filters
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(true); // Controls book selection dialog visibility
  const [searchType, setSearchType] = useState("");
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [schoolName, setSchoolName] = useState("St. Xavier High School"); // Default school name
const [examType, setExamType] = useState("Final Exam"); // Default exam type
const [totalDuration, setTotalDuration] = useState("2 Hours"); // Default duration
const [isEditingHeader, setIsEditingHeader] = useState(false); // Controls header editing mode
const paperId = queryParams.get("paperId");

const calculateTotalMarks = () => {
    return sections.reduce((total, section) => total + section.marks, 0);
  };

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      setFilters({
        subject: selectedSubject,
        class: selectedClass,
      });
    }
  }, [selectedClass, selectedSubject]);

  // Fetch uploaded books from Firestore
  useEffect(() => {
    const fetchUploadedBooks = async () => {
      const db = getFirestore();
      const booksCollection = collection(db, "books"); // Replace with your Firestore collection name
      const booksSnapshot = await getDocs(booksCollection);
      const booksList = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUploadedBooks(booksList);
      setFilteredBooks(booksList); // Initialize filtered books with all books
    };

    fetchUploadedBooks();
  }, []);

  const fetchExistingPaper = async () => {
    const db = getFirestore();
    const teacherDocRef = doc(db, "teachers", teacherId);
    const examsCollectionRef = collection(teacherDocRef, "exams");
  
    // Fetch the exam document with the given requestId
    const examsSnapshot = await getDocs(examsCollectionRef);
    const examDoc = examsSnapshot.docs.find((doc) => doc.data().requestId === requestId);
  
    if (examDoc && examDoc.data().paperId) {
      // Fetch the paper data from the questionPapers collection
      const paperDocRef = doc(db, "questionPapers", examDoc.data().paperId);
      const paperDoc = await getDoc(paperDocRef);
  
      if (paperDoc.exists()) {
        const paperData = paperDoc.data();
        setSections(paperData.sections); // Populate the editor with existing paper data
        setIsBookDialogOpen(false); // Skip the book selection dialog
      }
    }
  };

  const fetchPaperById = async (paperId) => {
    const db = getFirestore();
    const paperDocRef = doc(db, "questionPapers", paperId);
    const paperDoc = await getDoc(paperDocRef);
  
    if (paperDoc.exists()) {
      const paperData = paperDoc.data();
      setSections(paperData.sections); // Populate the editor with the fetched paper data
      setIsBookDialogOpen(false); // Skip the book selection dialog
    } else {
      alert("Paper not found!");
    }
  };
  
  useEffect(() => {
    if (paperId) {
        fetchPaperById(paperId); // Fetch and display the paper data
      } else if (requestId) {
        fetchExistingPaper(); // Fetch paper data using requestId (existing logic)
      } else {
        setIsBookDialogOpen(true); // Show the book dialog if no paperId or requestId is present
        }    
  }, [requestId]);



  // Handle search and filters
  useEffect(() => {
    const filtered = uploadedBooks.filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = filters.subject ? book.subject === filters.subject : true;
      const matchesClass = filters.class ? book.class === filters.class : true;

      return matchesSearch && matchesSubject && matchesClass;
    });

    setFilteredBooks(filtered);
  }, [searchQuery, filters, uploadedBooks]);

  const handleHeaderEdit = () => {
    setIsEditingHeader(true); // Enable editing mode
  };
  
  const handleHeaderSave = () => {
    setIsEditingHeader(false); // Disable editing mode
  };
  // Extract text from PDF
  const extractTextFromPDF = async (url) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ");
    }

    return text;
  };

  // Fetch AI-generated question suggestions
  const fetchQuestionSuggestions = async () => {
    if (!selectedBookUrl) {
      alert("Please select a book first.");
      return;
    }
  
    setIsLoadingSuggestions(true); // Set loading state to true
  
    const bookContent = await extractTextFromPDF(selectedBookUrl);
  
    const prompt = `
      Generate a list of questions for ${selectedSubject} (Class ${selectedClass}) based on the following book content:
      ${bookContent}
  
      ### Instructions:
      1. Generate questions in the following JSON format:
         [
           {
             "type": "MCQ | Short Answer | Long Answer | Case Study | Fill in the Blanks | Match the Following",
             "question": "The question text",
             "marks": 5, // Marks for the question
             "options": ["Option 1", "Option 2", "Option 3", "Option 4"], // Only for MCQ
             "correctAnswer": "Correct Answer", // Only for MCQ and Fill in the Blanks
             "pairs": [{ "term": "Term 1", "definition": "Definition 1" }] // Only for Match the Following
           }
         ]
      2. Include a variety of question types: MCQ, Short Answer, Long Answer, Case Studies, Fill in the Blanks, and Match the Following (7-7 questions of each type).
      3. Ensure the questions are relevant to the book content and appropriate for the class and subject.
    `;
  
    try {
      const response = await fetchGeminiAPI(prompt);
      if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const cleanText = response.candidates[0].content.parts[0].text
          .replace(/```json|```/g, "")
          .trim();
  
        const suggestions = JSON.parse(cleanText);
        setQuestionSuggestions(suggestions);
        console.log("Question Suggestions:", suggestions);
      }
    } catch (error) {
      console.error("Error fetching question suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false); // Set loading state to false
    }
  };

  // Fetch suggestions when the component mounts or when the selected book changes
  useEffect(() => {
    if (selectedBookUrl) {
      fetchQuestionSuggestions();
    }
  }, [selectedBookUrl]);

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

  // Handle book selection
  const handleBookSelection = (url) => {
    setSelectedBookUrl(url);
    setIsBookDialogOpen(false); // Close the dialog after selection
  };

  // Add a new question to a section
  const addQuestion = (sectionId, questionData) => {
    const newQuestion = {
      id: uuidv4(),
      type: questionData.type || "MCQ", // Default to "MCQ" if type is missing
      question: questionData.question || "",
      marks: questionData.marks || 0, // Default to 0 if marks are missing
      options: questionData.options || [], // Only for MCQ
      correctAnswer: questionData.correctAnswer || "", // Only for MCQ and Fill in the Blanks
      pairs: questionData.pairs || [], // Only for Match the Following
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
      question: "",
      marks: 0,
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

  // Add a new section
  const addSection = () => {
    const newSection = {
      id: uuidv4(),
      name: `Section ${String.fromCharCode(65 + sections.length)}`, // A, B, C, etc.
      marks: 0,
      questions: [],
    };
    setSections([...sections, newSection]);
    setActiveSectionId(newSection.id);
  };

  // Update section details
  const updateSection = (id, field, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  // Delete a section
  const deleteSection = (id) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
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

  const savePaper = async () => {
    const paperId = queryParams.get("paperId"); // Get paperId from query params
  
    // Transform sections into the required questions array format
    const questions = sections.flatMap((section, sectionIndex) => {
      return section.questions.map((question, questionIndex) => {
        const questionData = {
          chapter: question.chapter || "General", // Default chapter if not provided
          marks: question.marks,
          question: question.question,
          question_number: questionIndex + 1,
          question_type: question.type,
        };
  
        // Add subparts if they exist
        if (question.subparts && question.subparts.length > 0) {
          questionData.subparts = question.subparts.map((subpart, subpartIndex) => ({
            correct_option: subpart.correctAnswer, // For MCQ and Fill in the Blanks
            marks: subpart.marks,
            options: subpart.options || [], // For MCQ
            question: subpart.question,
            subpart_number: String.fromCharCode(97 + subpartIndex), // a, b, c, etc.
          }));
        }
  
        // Add pairs if the question type is "Match the Following"
        if (question.type === "Match the Following" && question.pairs) {
          questionData.pairs = question.pairs.map((pair) => ({
            term: pair.term,
            definition: pair.definition,
          }));
        }
  
        return questionData;
      });
    });
  
    // Calculate total marks
    const totalMarks = calculateTotalMarks();
  
    // Prepare the paper object
    const editedPaper = {
      class: selectedClass,
      createdAt: new Date().toISOString(), // Current timestamp
      examType, // Use the updated exam type
      questions,
      schoolId: "adminid", // Replace with actual school ID
      schoolName, // Use the updated school name
      status: "unapproved", // Default status
      subject: selectedSubject,
      totalDuration, // Use the updated total duration
      totalMarks,
    };
  
    // Save the paper to Firestore
    try {
      const db = getFirestore();
  
      if (paperId) {
        // Update the existing paper
        const paperDocRef = doc(db, "questionPapers", paperId);
        await updateDoc(paperDocRef, editedPaper);
        console.log("Paper updated successfully:", editedPaper);
        alert("Paper updated successfully!");
      } else {
        // Create a new paper
        const questionPapersCollection = collection(db, "questionPapers");
        const paperRef = await addDoc(questionPapersCollection, editedPaper);
        console.log("Paper saved successfully:", editedPaper);
        alert("Paper saved successfully!");
  
        // Update the exams collection with the paperId and set status to "Generated"
        if (requestId) {
          const teacherDocRef = doc(db, "teachers", teacherId);
          const examsCollectionRef = collection(teacherDocRef, "exams");
  
          // Find the exam document with the given requestId
          const examsSnapshot = await getDocs(examsCollectionRef);
          const examDoc = examsSnapshot.docs.find((doc) => doc.data().requestId === requestId);
  
          if (examDoc) {
            await updateDoc(doc(examsCollectionRef, examDoc.id), {
              paperId: paperRef.id,
              status: "Generated",
            });
          }
        }
      }
  
      // Navigate to the final question paper page
      navigate("/final-question-paper", {
        state: {
          paper: editedPaper,
          totalMarks,
          schoolName,
          examType,
          subject: selectedSubject,
          class: selectedClass, // Add class
          totalDuration,
        },
      });
    } catch (error) {
      console.error("Error saving paper:", error);
      alert("Failed to save paper. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Book Selection Dialog */}
      {isBookDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Select a Book
            </h2>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center bg-gray-100 rounded-lg p-3">
                <FaSearch className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search by title or author"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-gray-700 focus:outline-none placeholder-gray-400"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    value={filters.class}
                    onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                    className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls, index) => (
                      <option key={index} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Book List */}
              <div className="max-h-64 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                {filteredBooks.length === 0 ? (
                  <p className="text-sm text-gray-500">No books found.</p>
                ) : (
                  filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleBookSelection(book.fileUrl)}
                      className={`p-3 mb-2 cursor-pointer rounded-lg transition-all duration-200 ${
                        selectedBookUrl === book.fileUrl
                          ? "bg-indigo-100 border-indigo-500"
                          : "bg-white hover:bg-gray-100 border-gray-200"
                      } border`}
                    >
                      <p className="text-gray-800 font-medium">{book.title}</p>
                      <p className="text-sm text-gray-500">
                        {book.author} - {book.class} - {book.subject}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content (Visible after book selection) */}
      {!isBookDialogOpen && (
        <>
          {/* Header */}
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            Manual Paper Editor
          </h1>

          {/* AI Suggestions Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform ease-in-out duration-300 ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">AI Suggestions</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by question type (e.g., MCQ, Short Answer)"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Suggestions List */}
              <div className="flex-1 overflow-y-auto">
  {isLoadingSuggestions ? (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="mt-4 text-gray-700">Generating suggestions...</p>
    </div>
  ) : (
    questionSuggestions
      .filter((suggestion) =>
        suggestion.type.toLowerCase().includes(searchType.toLowerCase())
      )
      .map((suggestion, index) => (
        <div
          key={index}
          onClick={() => {
            if (suggestion.question && suggestion.type) {
              addQuestion(activeSectionId, suggestion);
            } else {
              console.error("Invalid question data:", suggestion);
              alert("Invalid question data. Please try again.");
            }
          }}
          className="p-4 mb-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200"
        >
          {/* Question Type Badge */}
          <div className="flex items-center mb-2">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                suggestion.type === "MCQ"
                  ? "bg-blue-100 text-blue-800"
                  : suggestion.type === "Short Answer"
                  ? "bg-green-100 text-green-800"
                  : suggestion.type === "Long Answer"
                  ? "bg-purple-100 text-purple-800"
                  : suggestion.type === "Case Study"
                  ? "bg-yellow-100 text-yellow-800"
                  : suggestion.type === "Fill in the Blanks"
                  ? "bg-pink-100 text-pink-800"
                  : suggestion.type === "Match the Following"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {suggestion.type}
            </span>
          </div>

          {/* Question Text */}
          <p className="text-sm text-gray-700">{suggestion.question}</p>
        </div>
      ))
  )}
</div>
            </div>
          </div>
            {/* Header Section */}
        <div className="border p-5 rounded-lg shadow-lg bg-white mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">School: {schoolName}</h2>
            {isEditingHeader ? (
              <button
                onClick={handleHeaderSave}
                className="bg-green-600 text-white py-1 px-3 rounded flex items-center hover:bg-green-700 transition"
              >
                <FaSave className="mr-2" /> Save
              </button>
            ) : (
              <button
                onClick={handleHeaderEdit}
                className="bg-yellow-500 text-white py-1 px-3 rounded flex items-center hover:bg-yellow-600 transition"
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
                  value={selectedSubject}
                  readOnly
                />
              </div>
              <div>
                <label className="font-semibold text-gray-800">Class:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-gray-900"
                  value={selectedClass}
                  readOnly
                />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-700">Exam Type: {examType}</p>
              <p className="text-gray-700">Subject: {selectedSubject}</p>
              <p className="text-gray-700">Class: {selectedClass}</p>
              <p className="text-gray-700">Total Duration: {totalDuration}</p>
            </div>
          )}
        </div>
          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {section.name} (Total Marks: {section.marks})
                  </h2>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrash className="text-lg" />
                  </button>
                </div>

                {/* Section Marks Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Marks
                  </label>
                  <input
                    type="number"
                    value={section.marks}
                    onChange={(e) =>
                      updateSection(section.id, "marks", parseInt(e.target.value))
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

                      {/* Question Type */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(section.id, question.id, "type", e.target.value)
                          }
                          className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="MCQ">MCQ</option>
                          <option value="Short Answer">Short Answer</option>
                          <option value="Long Answer">Long Answer</option>
                          <option value="Case Study">Case Study</option>
                          <option value="Fill in the Blanks">Fill in the Blanks</option>
                          <option value="Match the Following">Match the Following</option>
                        </select>
                      </div>

                      {/* Question Text */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(section.id, question.id, "question", e.target.value)
                          }
                          className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={3}
                        />
                      </div>

                      {/* Marks */}
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

                      {/* MCQ Options */}
                      {question.type === "MCQ" && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options
                          </label>
                          {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[index] = e.target.value;
                                  updateQuestion(section.id, question.id, "options", newOptions);
                                }}
                                className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = question.options.filter((_, i) => i !== index);
                                  updateQuestion(section.id, question.id, "options", newOptions);
                                }}
                                className="ml-2 text-red-500 hover:text-red-600"
                              >
                                <FaTrash className="text-lg" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [...(question.options || []), ""];
                              updateQuestion(section.id, question.id, "options", newOptions);
                            }}
                            className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                          >
                            Add Option
                          </button>
                        </div>
                      )}

                      {/* Correct Answer (MCQ and Fill in the Blanks) */}
                      {(question.type === "MCQ" || question.type === "Fill in the Blanks") && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer
                          </label>
                          <input
                            type="text"
                            value={question.correctAnswer}
                            onChange={(e) =>
                              updateQuestion(section.id, question.id, "correctAnswer", e.target.value)
                            }
                            className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      )}

                      {/* Match the Following Pairs */}
                      {question.type === "Match the Following" && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pairs
                          </label>
                          {question.pairs?.map((pair, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <input
                                type="text"
                                value={pair.term}
                                onChange={(e) => {
                                  const newPairs = [...question.pairs];
                                  newPairs[index].term = e.target.value;
                                  updateQuestion(section.id, question.id, "pairs", newPairs);
                                }}
                                className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Term"
                              />
                              <input
                                type="text"
                                value={pair.definition}
                                onChange={(e) => {
                                  const newPairs = [...question.pairs];
                                  newPairs[index].definition = e.target.value;
                                  updateQuestion(section.id, question.id, "pairs", newPairs);
                                }}
                                className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ml-2"
                                placeholder="Definition"
                              />
                              <button
                                onClick={() => {
                                  const newPairs = question.pairs.filter((_, i) => i !== index);
                                  updateQuestion(section.id, question.id, "pairs", newPairs);
                                }}
                                className="ml-2 text-red-500 hover:text-red-600"
                              >
                                <FaTrash className="text-lg" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newPairs = [...(question.pairs || []), { term: "", definition: "" }];
                              updateQuestion(section.id, question.id, "pairs", newPairs);
                            }}
                            className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                          >
                            Add Pair
                          </button>
                        </div>
                      )}

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

                            {/* Subpart Text */}
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subpart Text
                              </label>
                              <textarea
                                value={subpart.question}
                                onChange={(e) =>
                                  updateSubpart(
                                    section.id,
                                    question.id,
                                    subpart.id,
                                    "question",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows={2}
                              />
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
                  onClick={() => addQuestion(section.id, { type: "MCQ", question: "", marks: 0 })}
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

          {/* Save and Download Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={savePaper}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200"
            >
              <FaSave className="mr-2" /> Save Paper
            </button>
            {/* <button
              onClick={downloadPDF}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200"
            >
              <FaDownload className="mr-2" /> Download PDF
            </button> */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200"
            >
              <FaLightbulb className="mr-2" /> AI Suggestions
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ManualPaperEditor;