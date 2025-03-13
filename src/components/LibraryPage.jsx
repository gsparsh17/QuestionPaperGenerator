import React, { useState, useEffect } from "react";
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

const LibraryPage = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    class: "",
    subject: "",
  });

  // Fetch books from Firestore
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const bookList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(bookList);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  // Filter books based on search query and filters
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filters.class ? book.class === filters.class : true;
    const matchesSubject = filters.subject ? book.subject === filters.subject : true;
    return matchesSearch && matchesClass && matchesSubject;
  });

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-100">Library</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search books..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
      />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <select
  value={filters.class}
  onChange={(e) => setFilters({ ...filters, class: e.target.value })}
  className="p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
>
  <option value="">All Classes</option>
  {classes.map((cls) => (
    <option key={cls} value={cls}>
      {cls}
    </option>
  ))}
</select>
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

      {/* Book List */}
      <div className="space-y-4">
        {filteredBooks.map((book) => (
          <div key={book.id} className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-100">{book.title}</h3>
            <p className="text-slate-300">Author: {book.author}</p>
            <p className="text-slate-300">Class: {book.class}</p>
            <p className="text-slate-300">Subject: {book.subject}</p>
            <a
              href={book.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;