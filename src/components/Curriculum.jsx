import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import '../index.css'

const CurriculumPage = () => {
  const [subjects, setSubjects] = useState([]); // List of subjects taught by the teacher
  const [classes, setClasses] = useState([]); // List of classes for the selected subject
  const [books, setBooks] = useState([]); // List of all books
  const [assignedBooks, setAssignedBooks] = useState({}); // { subject: { class: { bookId, docId } } }
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCurriculums, setPendingCurriculums] = useState([]); // State for pending curriculums
  const queryParams = new URLSearchParams(location.search);
  const teacherId = queryParams.get("teacherId");

const fetchPendingCurriculums = async () => {

  // Fetch all subjects and classes taught by the teacher
  const subjectsRef = collection(db, "teachers", teacherId, "subjects");
  const subjectsSnapshot = await getDocs(subjectsRef);
  const subjectsData = subjectsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Fetch all curriculum documents for the teacher
  const curriculumRef = collection(db, `teachers/${teacherId}/curriculum`);
  const curriculumSnapshot = await getDocs(curriculumRef);
  const curriculumData = curriculumSnapshot.docs.map((doc) => doc.data());

  // Identify pending curriculums
  const pending = [];
  subjectsData.forEach((subject) => {
    subject.classes.forEach((classId) => {
      const isAssigned = curriculumData.some(
        (curriculum) =>
          curriculum.subject === subject.subject && curriculum.class === classId
      );
      if (!isAssigned) {
        pending.push({ subject: subject.subject, class: classId });
      }
    });
  });

  setPendingCurriculums(pending);
};

useEffect(() => {
  fetchPendingCurriculums();
}, [teacherId]);

  
  useEffect(() => {
    const fetchData = async () => {
      // Fetch subjects taught by the teacher
      const subjectsRef = collection(db, "teachers", teacherId, "subjects");
      const subjectsSnapshot = await getDocs(subjectsRef);
      const subjectsData = subjectsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubjects(subjectsData);

      // Fetch all books
      const booksRef = collection(db, "books");
      const booksSnapshot = await getDocs(booksRef);
      const booksData = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(booksData);

      // Fetch assigned books for the teacher
      const curriculumRef = collection(db, `teachers/${teacherId}/curriculum`);
      const curriculumSnapshot = await getDocs(curriculumRef);
      const assignedBooksData = {};

      curriculumSnapshot.docs.forEach((doc) => {
        const { subject, class: classId, bookId } = doc.data();
        if (!assignedBooksData[subject]) {
          assignedBooksData[subject] = {};
        }
        assignedBooksData[subject][classId] = { bookId, docId: doc.id }; // Store both bookId and docId
      });

      setAssignedBooks(assignedBooksData);
    };

    fetchData();
  }, [teacherId]);

  // Fetch classes for the selected subject
  useEffect(() => {
    const fetchClassesForSubject = async () => {
      if (!selectedSubject) return;

      const subjectDoc = subjects.find((subject) => subject.subject === selectedSubject);
      if (subjectDoc) {
        setClasses(subjectDoc.classes || []);
      }
    };

    fetchClassesForSubject();
  }, [selectedSubject, subjects]);

  // Handle book assignment
  const handleAssignBook = async () => {
    if (!selectedSubject || !selectedClass || !selectedBook) {
      alert("Please select a subject, class, and book.");
      return;
    }

    try {
      // Save the assigned book to Firestore
      const curriculumRef = collection(db, `teachers/${teacherId}/curriculum`);
      const docRef = await addDoc(curriculumRef, {
        subject: selectedSubject,
        class: selectedClass,
        bookId: selectedBook,
      });

      // Update the local state
      const updatedAssignedBooks = { ...assignedBooks };
      if (!updatedAssignedBooks[selectedSubject]) {
        updatedAssignedBooks[selectedSubject] = {};
      }
      updatedAssignedBooks[selectedSubject][selectedClass] = { bookId: selectedBook, docId: docRef.id };
      setAssignedBooks(updatedAssignedBooks);
// Update the pending curriculums list
setPendingCurriculums((prev) =>
  prev.filter(
    (curriculum) =>
      !(curriculum.subject === selectedSubject && curriculum.class === selectedClass)
  )
);

alert("Book assigned successfully!");
    } catch (error) {
      console.error("Error assigning book:", error);
      alert("Failed to assign book.");
    }
  };

  // Handle book replacement
  const handleReplaceBook = async (subject, classId, newBookId) => {
    try {
      // Find the document ID for the subject and class
      const curriculumRef = collection(db, `teachers/${teacherId}/curriculum`);
      const q = query(curriculumRef, where("subject", "==", subject), where("class", "==", classId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(db, `teachers/${teacherId}/curriculum`, docId);

        // Update the book ID in Firestore
        await updateDoc(docRef, { bookId: newBookId });

        // Update the local state
        const updatedAssignedBooks = { ...assignedBooks };
        updatedAssignedBooks[subject][classId].bookId = newBookId;
        setAssignedBooks(updatedAssignedBooks);

        alert("Book replaced successfully!");
      } else {
        alert("No matching record found.");
      }
    } catch (error) {
      console.error("Error replacing book:", error);
      alert("Failed to replace book.");
    }
  };

  // Navigate to the Log Page
  const handleAccessLog = (subject, classId, curriculumDocId) => {
    navigate(`/main/log?teacherId=${teacherId}&subject=${subject}&class=${classId}&curriculumDocId=${curriculumDocId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Curriculum Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Subject Selection */}
        <div>
          <label className="text-white">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-gray-800 text-white p-2 rounded-lg"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.subject}>
                {subject.subject}
              </option>
            ))}
          </select>
        </div>

        {/* Class Selection */}
        <div>
          <label className="text-white">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-gray-800 text-white p-2 rounded-lg"
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

      {/* Book Selection */}
<div className="mb-8">
  <h2 className="text-2xl font-semibold text-white mb-4">Select Book</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto"> {/* Add max-h-64 and overflow-y-auto */}
    {books.map((book) => (
      <div
        key={book.id}
        className={`p-4 rounded-lg cursor-pointer ${
          selectedBook === book.id ? "bg-indigo-600" : "bg-gray-800"
        }`}
        onClick={() => setSelectedBook(book.id)}
      >
        <h3 className="text-white font-medium">{book.title}</h3>
        <p className="text-gray-400">{book.author}</p>
      </div>
    ))}
  </div>
</div>

      {/* Assign Book Button */}
      <button
        onClick={handleAssignBook}
        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all duration-300 mb-8"
      >
        Assign Book
      </button>

      {/* Assigned Books Table */}
      <h2 className="text-2xl font-semibold text-white mb-4">Assigned Books</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800 rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-3 text-left text-white">Subject</th>
              <th className="p-3 text-left text-white">Class</th>
              <th className="p-3 text-left text-white">Assigned Book</th>
              <th className="p-3 text-left text-white">Actions</th>
              <th className="p-3 text-left text-white">Access Log</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(assignedBooks).map(([subject, classData]) =>
              Object.entries(classData).map(([classId, { bookId, docId }]) => {
                const assignedBook = books.find((book) => book.id === bookId);
                return (
                  <tr key={`${subject}-${classId}`} className="border-b border-gray-700">
                    <td className="p-3 text-white">{subject}</td>
                    <td className="p-3 text-white">{classId}</td>
                    <td className="p-3 text-white">
                      {assignedBook ? assignedBook.title : "No book assigned"}
                    </td>
                    <td className="p-3">
                      <select
                        value=""
                        onChange={(e) => handleReplaceBook(subject, classId, e.target.value)}
                        className="bg-gray-700 text-white p-1 rounded-lg"
                      >
                        <option value="">Replace Book</option>
                        {books.map((book) => (
                          <option key={book.id} value={book.id}>
                            {book.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleAccessLog(subject, classId, docId)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300"
                      >
                        Access Log
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
      </div>
      <div className="mt-8">
  <h2 className="text-2xl font-semibold text-white mb-4">Pending Curriculums</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {pendingCurriculums.map(({ subject, class: classId }, index) => (
      <div
        key={index}
        className="p-4 bg-gray-800 rounded-lg shadow-lg"
      >
        <h3 className="text-white font-medium">{subject}</h3>
        <p className="text-gray-400">Class: {classId}</p>
        <button
          onClick={() => {
            setSelectedSubject(subject);
            setSelectedClass(classId);
          }}
          className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all duration-300"
        >
          Assign Book
        </button>
      </div>
    ))}
  </div>
</div>
    </div>
  );
};

export default CurriculumPage;