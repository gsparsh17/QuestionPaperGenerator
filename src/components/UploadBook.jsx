import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";



const s3 = new AWS.S3();

const UploadBook = ({ fetchData }) => {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookSubject, setBookSubject] = useState("");
  const [bookClass, setBookClass] = useState("");
  const [bookFile, setBookFile] = useState(null);
  const navigate = useNavigate();

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

  // Upload file to S3
  const uploadFileToS3 = async (file) => {
    const params = {
      Bucket: "paper-generation",
      Key: `books/${file.name}`,
      Body: file,
      ContentType: file.type,
    };

    try {
      const data = await s3.upload(params).promise();
      const fileUrl = data.Location;
      console.log("File uploaded to S3:", fileUrl);
      return fileUrl;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  };

  // Store file metadata in Firestore
  const storeFileMetadata = async (fileUrl, metadata) => {
    try {
      const docRef = await addDoc(collection(db, "books"), {
        ...metadata,
        fileUrl,
        createdAt: new Date(),
      });
      console.log("File metadata stored with ID:", docRef.id);
    } catch (error) {
      console.error("Error storing file metadata:", error);
      throw error;
    }
  };

  // Handle book upload
  const handleUploadBook = async (e) => {
    e.preventDefault();
    if (!bookFile) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      // Upload file to S3
      const fileUrl = await uploadFileToS3(bookFile);

      // Store metadata in Firestore
      await storeFileMetadata(fileUrl, {
        title: bookTitle,
        author: bookAuthor,
        description: bookDescription,
        subject: bookSubject,
        class: bookClass,
      });

      alert("Book uploaded successfully!");
      setBookTitle("");
      setBookAuthor("");
      setBookDescription("");
      setBookSubject("");
      setBookClass("");
      setBookFile(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error uploading book:", error);
      alert("Error uploading book: " + error.message);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-100">Upload Book</h2>

      <form onSubmit={handleUploadBook} className="space-y-4">
        <div>
          <label className="block text-slate-100 mb-2">Title</label>
          <input
            type="text"
            placeholder="Book Title"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            className="w-full p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-100 mb-2">Author</label>
          <input
            type="text"
            placeholder="Author"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            className="w-full p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-100 mb-2">Description</label>
          <textarea
            placeholder="Description"
            value={bookDescription}
            onChange={(e) => setBookDescription(e.target.value)}
            className="w-full p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-100 mb-2">Subject</label>
          <select
            value={bookSubject}
            onChange={(e) => setBookSubject(e.target.value)}
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
            value={bookClass}
            onChange={(e) => setBookClass(e.target.value)}
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

        <div>
          <label className="block text-slate-100 mb-2">Upload File</label>
          <input
            type="file"
            onChange={(e) => setBookFile(e.target.files[0])}
            className="w-full p-2 bg-gray-700 text-slate-100 rounded-lg focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200"
        >
          Upload Book
        </button>
      </form>
    </div>
  );
};

export default UploadBook;