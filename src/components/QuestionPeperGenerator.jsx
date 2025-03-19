import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUpload, FaSearch, FaFilter } from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist";
import { getFirestore, collection, getDocs } from "firebase/firestore"; // Firebase Firestore

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

const QuestionPaperGenerator = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [uploadedBooks, setUploadedBooks] = useState([]); // List of uploaded books
  const [selectedBookUrl, setSelectedBookUrl] = useState(""); // Selected book URL
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [filters, setFilters] = useState({ subject: "", class: "" }); // Filters for subject and class
  const [filteredBooks, setFilteredBooks] = useState([]); // Books filtered by search and filters
  const [difficulty, setDifficulty] = useState("medium");
  const [totalMarks, setTotalMarks] = useState(100);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [chapters, setChapters] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionTypes, setQuestionTypes] = useState({
    mcq: false,
    shortAnswer: false,
    longAnswer: false,
    caseStudies: false,
    fillInTheBlanks: false,
    matchTheFollowing: false,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [schoolId, setSchoolId] = useState("");
  const queryParams = new URLSearchParams(location.search);
const selectedClass = queryParams.get("class");
const selectedSubject = queryParams.get("subject");
const requestId = queryParams.get("requestId");

// Pre-fill the form fields if class and subject are provided
useEffect(() => {
  if (selectedClass && selectedSubject) {
    setFilters({
      subject: selectedSubject,
      class: selectedClass,
    });
  }
}, [selectedClass, selectedSubject]);

  // Check for schoolId in the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("schoolId");
    if (!id) {
      navigate("/unauthorized"); // Redirect to unauthorized page if schoolId is missing
    } else {
      setSchoolId(id); // Set schoolId if present
    }
  }, [location, navigate]);

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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setPdfFiles(files);
    setSelectedBookUrl(""); // Clear selected book URL when a new file is uploaded
  };

  const handleBookSelection = (url) => {
    setSelectedBookUrl(url);
    setPdfFiles([]); // Clear uploaded files when a book is selected
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const extractTextFromPDF = async (fileOrUrl) => {
    let arrayBuffer;

    if (fileOrUrl instanceof File) {
      arrayBuffer = await fileOrUrl.arrayBuffer();
    } else {
      const response = await fetch(fileOrUrl);
      arrayBuffer = await response.arrayBuffer();
    }

    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ");
    }

    return text;
  };

  const handleGeneratePaper = async () => {
    if (pdfFiles.length === 0 && !selectedBookUrl) {
      alert("Please upload a file or select a book.");
      return;
    }

    setLoading(true);

    try {
      let pdfTexts;

      if (pdfFiles.length > 0) {
        // Extract text from uploaded files
        pdfTexts = await Promise.all(pdfFiles.map((file) => extractTextFromPDF(file)));
      } else {
        // Extract text from the selected book URL
        pdfTexts = [await extractTextFromPDF(selectedBookUrl)];
      }

      const combinedPDFText = pdfTexts.join("\n");

      const selectedTypes = Object.keys(questionTypes).filter(
        (type) => questionTypes[type]
      );

      if (selectedTypes.length === 0) {
        alert("Please select at least one question type.");
        return;
      }

      const prompt = `Generate a question paper in JSON format with the following details:
      - Difficulty: ${difficulty}
      - Total Marks: ${totalMarks}
      - Total Questions: ${totalQuestions}
      - Chapters: ${chapters}
      - Question Types: ${selectedTypes.join(", ")}
      - Based on the following PDF content:
      ${combinedPDFText}

      ### Instructions:
      1. Ensure the total marks for all questions add up to exactly ${totalMarks}.
      2. Follow the marks distribution strictly:
         - MCQ: 5 subparts, each worth 1 mark (total 5 marks per MCQ question).
         - Short Answer: 5-15 marks per question.
         - Long Answer: 10-20 marks per question.
         - Case Studies: 10-20 marks per question.
         - Fill in the Blanks: 5 subparts, each worth 1 mark (total 5 marks per question).
         - Match the Following: 5 pairs, each worth 1 mark (total 5 marks per question).
      3. Distribute questions across the specified chapters: ${chapters}.
      4. Ensure the JSON structure is valid and follows the format below.
      5. Questions should only be of selected types: ${selectedTypes.join(", ")}

      ### JSON Format:
      {
        "difficulty": "${difficulty}",
        "totalMarks": ${totalMarks},
        "totalQuestions": ${totalQuestions},
        "chapters": ${JSON.stringify(chapters.split(",").map((chap) => chap.trim()))},
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
        ]
      }`;

      const response = await fetchGeminiAPI(prompt);

      if (!response?.candidates || response.candidates.length === 0) {
        throw new Error("Invalid response format from API");
      }

      const questionPaperText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!questionPaperText) {
        throw new Error("Generated response is empty.");
      }

      const cleanText = questionPaperText.replace(/```json|```/g, "").trim();
      const parsedData = JSON.parse(cleanText);

      navigate("/question-paper-display", { state: { paper: parsedData, schoolId } });
    } catch (error) {
      console.error("Error generating question paper:", error);
      alert("Failed to generate question paper. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleQuestionTypeChange = (type) => {
    setQuestionTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (!schoolId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
          <p className="text-lg">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen relative bg-gradient-to-br from-gray-900 to-black pb-9">
      {/* <div className="flex justify-between w-full text-xl p-5 text-slate-300 sticky top-0 z-40 bg-gray-900/70">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent text-white ml-4 md:ml-16">
          Question Paper Generator
        </h1>
      </div> */}

      <div className="max-w-[900px] mx-auto max-md:mt-20 px-5">
        <div className="text-[56px] text-slate-300 font-semibold max-md:text-[25px]">
          <p>
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Generate Your Question Paper
            </span>
          </p>
        </div>

        <div className="mt-5">
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Upload PDF Files
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center px-4 py-6 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700">
                <FaUpload className="text-2xl text-indigo-400" />
                <span className="mt-2 text-sm text-slate-300">
                  {pdfFiles.length > 0
                    ? `${pdfFiles.length} file(s) selected`
                    : "Choose PDF files"}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Search and Select an Uploaded Book
            </label>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center bg-gray-800 rounded-lg p-2">
                <FaSearch className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search by title or author"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-transparent text-slate-300 focus:outline-none"
                />
              </div>

              {/* Filters */}
              <div>
          <label className="block text-slate-100 mb-2">Subject</label>
          <select
            value={filters.subject}
            onChange={handleFilterChange}
            className="w-full p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
            required
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
          <label className="block text-slate-100 mb-2">Class</label>
          <select
            value={filters.class}
            onChange={handleFilterChange}
            className="w-full p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
            required
          >
            <option value="">Select Class</option>
            {classes.map((cls, index) => (
              <option key={index} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

              {/* Book List */}
              <div className="max-h-48 overflow-y-auto">
              <label className="block text-slate-100 mb-2">Select The Book</label>
                {filteredBooks.length === 0 && (
                  <p className="text-sm text-gray-400">No books found.</p>
                )}
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => handleBookSelection(book.fileUrl)}
                    className={`p-2 m-2 cursor-pointer hover:bg-gray-700 rounded-lg ${
                      selectedBookUrl === book.fileUrl ? "bg-indigo-600" : "bg-gray-800"
                    }`}
                  >
                    <p className="text-slate-300">{book.title}</p>
                    <p className="text-sm text-slate-400">
                      {book.author} - {book.class} - {book.subject}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded-lg text-slate-300"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Total Marks
            </label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded-lg text-slate-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Total Questions
            </label>
            <input
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded-lg text-slate-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Chapters (comma-separated)
            </label>
            <input
              type="text"
              value={chapters}
              onChange={(e) => setChapters(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded-lg text-slate-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Question Types
            </label>
            <div className="flex flex-wrap gap-4">
              {Object.keys(questionTypes).map((type) => (
                <label key={type} className="flex items-center text-slate-300">
                  <input
                    type="checkbox"
                    checked={questionTypes[type]}
                    onChange={() => handleQuestionTypeChange(type)}
                    className="mr-2"
                  />
                  {type
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGeneratePaper}
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
          >
            {loading ? "Generating..." : "Generate Question Paper"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperGenerator;