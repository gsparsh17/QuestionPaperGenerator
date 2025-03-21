/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  getDoc,
  doc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useLocation } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  FaPlus,
  FaSave,
  FaSpinner,
  FaCalendarAlt,
  FaHistory,
  FaTrash
} from "react-icons/fa";

// Set the worker path for pdfjsLib
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const LogPage = () => {
  const [weeklyStructure, setWeeklyStructure] = useState([]);
  const [dailyLog, setDailyLog] = useState("");
  const [generatedLog, setGeneratedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookContent, setBookContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [dailyLogs, setDailyLogs] = useState({}); // Stores daily logs fetched from Firestore
  const [calendarDate, setCalendarDate] = useState(new Date()); // Calendar state
  const [selectedDay, setSelectedDay] = useState(null); // Selected day for updating logs
  const location = useLocation();

  const [ddailyLogs, setddailyLogs] = useState([]); // Store all daily logs
  const [newLog, setNewLog] = useState({ subject: "", class: "", week: "", day: "", log: "" }); // New log data
  const [addingNewLog, setAddingNewLog] = useState(false); 

  // Extract teacherId, subject, class, and curriculumDocId from the URL
  const queryParams = new URLSearchParams(location.search);
  const teacherId = queryParams.get("teacherId");
  const subject = queryParams.get("subject");
  const classId = queryParams.get("class");
  const curriculumDocId = queryParams.get("curriculumDocId");

  // Fetch book content, generated log, and weekly structure using curriculumDocId
  useEffect(() => {
    const fetchData = async () => {
      if (!curriculumDocId) return;

      const curriculumDoc = await getDoc(
        doc(db, `teachers/${teacherId}/curriculum`, curriculumDocId)
      );
      const bookId = curriculumDoc.data()?.bookId;
      const generatedLogData = curriculumDoc.data()?.generatedLog;
      const weeklyStructureData = curriculumDoc.data()?.weeklyStructure;

      if (bookId) {
        const bookDoc = await getDoc(doc(db, "books", bookId));
        const bookUrl = bookDoc.data()?.fileUrl;

        if (bookUrl) {
          // Fetch book content (e.g., extract text from PDF)
          const response = await fetch(bookUrl);
          const arrayBuffer = await response.arrayBuffer();
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          let text = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ");
          }

          setBookContent(text);
        }
      }

      if (generatedLogData) {
        setGeneratedLog(generatedLogData);
      }

      if (weeklyStructureData) {
        setWeeklyStructure(weeklyStructureData);
      } else if (generatedLogData) {
        // Initialize weeklyStructure with default data based on generatedLog
        const initialWeeklyStructure = generatedLogData.weeklyPlan.map(
          (week) => ({
            ...week,
            logs: Array(7).fill(""), // Assuming 7 days in a week
          })
        );
        setWeeklyStructure(initialWeeklyStructure);
      }

      // Fetch daily logs from the logs collection
      const logsCollection = collection(db, `teachers/${teacherId}/logs`);
      const logsSnapshot = await getDocs(logsCollection);
      const logsData = {};
      logsSnapshot.forEach((doc) => {
        const log = doc.data();
        logsData[`${log.week}-${log.day}`] = log.log;
      });
      setDailyLogs(logsData);
    };

    fetchData();
  }, [curriculumDocId, teacherId]);

  // Generate a new log using Gemini API
  const generateLog = async () => {
    if (generatedLog) {
      alert("A log has already been generated for this subject and class.");
      return;
    }

    setLoading(true);

    try {
      // Define the prompt for Gemini API
      const prompt = `Generate a detailed curriculum plan for a teacher in JSON format with the following details:
      - Subject: ${subject}
      - Class: ${classId}
      - Teacher ID: ${teacherId}
      - Date: ${new Date().toISOString()}
      - Book Content: ${bookContent}

      ### Instructions:
      1. Create a weekly and monthly plan for completing the syllabus of the subject for the respective class.
      2. Include the following details for each week:
         - Topics to be covered.
         - Weekly targets (e.g., chapters or sections to complete).
         - Homework assignments for students.
         - Deadlines for completing topics before mid-term exams.
      3. Ensure the plan is realistic and evenly distributes the syllabus over the available weeks.
      4. Include monthly targets summarizing the progress expected by the end of each month.
      5. Provide a clear structure for the curriculum plan.

      ### JSON Format:
      {
        "subject": "${subject}",
        "class": "${classId}",
        "teacherId": "${teacherId}",
        "date": "${new Date().toISOString()}",
        "weeklyPlan": [
          {
            "week": 1,
            "topics": ["Topic 1", "Topic 2"],
            "targets": "Complete Chapter 1 and 2",
            "homework": "Solve problems 1-10 from Chapter 1",
            "deadline": "2023-10-22"
          },
          {
            "week": 2,
            "topics": ["Topic 3", "Topic 4"],
            "targets": "Complete Chapter 3 and 4",
            "homework": "Solve problems 1-15 from Chapter 3",
            "deadline": "2023-10-29"
          }
          // Add more weeks as needed
        ],
        "monthlyTargets": [
          {
            "month": "October",
            "targets": "Complete Chapters 1-4",
            "progressSummary": "By the end of October, students should be comfortable with basic algebra concepts."
          },
          {
            "month": "November",
            "targets": "Complete Chapters 5-8",
            "progressSummary": "By the end of November, students should be able to solve linear equations and understand geometry basics."
          }
          // Add more months as needed
        ],
        "midTermDeadlines": {
          "topicsToComplete": ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4"],
          "deadline": "2023-11-15"
        }
      }`;

      // Call Gemini API
      const response = await fetchGeminiAPI(prompt);

      if (!response?.candidates || response.candidates.length === 0) {
        throw new Error("Invalid response format from API");
      }

      const logText =
        response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!logText) {
        throw new Error("Generated response is empty.");
      }

      // Clean and parse the response
      const cleanText = logText.replace(/```json|```/g, "").trim();
      const parsedLog = JSON.parse(cleanText);

      // Initialize weeklyStructure with default data based on generatedLog
      const initialWeeklyStructure = parsedLog.weeklyPlan.map((week) => ({
        ...week,
        logs: Array(7).fill(""), // Assuming 7 days in a week
      }));

      // Save the generated log and weeklyStructure to the current curriculum document
      const curriculumDoc = doc(
        db,
        `teachers/${teacherId}/curriculum`,
        curriculumDocId
      );
      await updateDoc(curriculumDoc, {
        generatedLog: parsedLog,
        weeklyStructure: initialWeeklyStructure,
      });

      // Update local state
      setGeneratedLog(parsedLog);
      setWeeklyStructure(initialWeeklyStructure);
      alert("Log generated successfully!");
    } catch (error) {
      console.error("Error generating log:", error);
      alert("Failed to generate log.");
    } finally {
      setLoading(false);
    }
  };

  // Update daily log for a specific week and day
  const updateDailyLog = async (weekIndex, dayIndex) => {
    const logKey = `${weekIndex}-${dayIndex}`;
    const logData = {
      teacherId,
      subject,
      class: classId,
      week: weekIndex,
      day: dayIndex,
      log: dailyLog,
      timestamp: new Date().toISOString(),
    };

    try {
      // Save the daily log to the logs collection
      const logsCollection = collection(db, `teachers/${teacherId}/logs`);
      await addDoc(logsCollection, logData);

      // Update local state
      setDailyLogs((prevLogs) => ({ ...prevLogs, [logKey]: dailyLog }));
      setDailyLog(""); // Clear the input field
      alert("Daily log updated successfully!");
    } catch (error) {
      console.error("Error updating daily log:", error);
      alert("Failed to update daily log.");
    }
  };

  // Call Gemini API
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

  const [teacher, setTeacher] = useState(null);
  const [subjectsWithClasses, setSubjectsWithClasses] = useState([]);
  const [curriculumLogs, setCurriculumLogs] = useState([]);
  const [daailyLogs, setDaailyLogs] = useState([]);
  const [updatedTeacher, setUpdatedTeacher] = useState({
    name: "",
    email: "",
    schoolId: "",
  });

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      if (!teacherId) return;

      // Fetch teacher details
      const teacherRef = doc(db, "teachers", teacherId);
      const teacherSnap = await getDoc(teacherRef);

      if (teacherSnap.exists()) {
        const teacherData = teacherSnap.data();
        setTeacher(teacherData);
        setUpdatedTeacher(teacherData);

        // Fetch subjects and classes
        const subjectsRef = collection(db, `teachers/${teacherId}/subjects`);
        const subjectsSnapshot = await getDocs(subjectsRef);
        const subjectsData = subjectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubjectsWithClasses(subjectsData);

        // Fetch curriculum logs
        const curriculumRef = collection(
          db,
          `teachers/${teacherId}/curriculum`
        );
        const curriculumSnapshot = await getDocs(curriculumRef);
        const curriculumData = curriculumSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCurriculumLogs(curriculumData);

        // Fetch daily logs
        const logsRef = collection(db, `teachers/${teacherId}/logs`);
        const logsSnapshot = await getDocs(logsRef);
        const logsData = logsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDaailyLogs(logsData);
      } else {
        console.error("Teacher not found");
      }
    };
    fetchTeacherDetails();
  }, [teacherId]);

  const [newRows, setNewRows] = useState([]);
  useEffect(() => {
    const fetchLogs = async () => {
      if (!teacherId) return;
      const logsCollection = collection(db, `teachers/${teacherId}/logs`);
      const logsSnapshot = await getDocs(logsCollection);
      const logsData = logsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setddailyLogs(logsData);
    };
    fetchLogs();
  }, [teacherId]);

  const handleAddRow = () => {
    setNewRows([...newRows, { subject: "", class: "", week: "", day: "", log: "", isSaved: false }]);
  };

  const handleInputChange = (e, index, field) => {
    const updatedRows = [...newRows];
    updatedRows[index][field] = e.target.value;
    setNewRows(updatedRows);
  };

  const saveNewLog = async (index) => {
    const logData = {
      ...newRows[index],
      teacherId,
      timestamp: new Date().toISOString(),
    };

    try {
      const logsCollection = collection(db, `teachers/${teacherId}/logs`);
      await addDoc(logsCollection, logData);

      setddailyLogs((prevLogs) => [{ ...logData, isSaved: true }, ...prevLogs]); // Move to saved logs
      setNewRows(newRows.filter((_, i) => i !== index)); // Remove from new rows
      alert("Log added successfully!");
    } catch (error) {
      console.error("Error adding log:", error);
      alert("Failed to add log.");
    }
  };

  const removeNewRow = (index) => {
    setNewRows(newRows.filter((_, i) => i !== index));
  };

  // Render the generated log in a tabular form
  const renderGeneratedLog = () => {
    if (!generatedLog) return null;

    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-white mb-4">Generated Log</h3>
        <table className="w-full bg-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-600">
              <th className="p-3 text-left text-white">Week</th>
              <th className="p-3 text-left text-white">Topics</th>
              <th className="p-3 text-left text-white">Targets</th>
              <th className="p-3 text-left text-white">Homework</th>
              <th className="p-3 text-left text-white">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {generatedLog.weeklyPlan?.map((week, weekIndex) => (
              <tr key={weekIndex} className="border-b border-gray-600">
                <td className="p-3 text-white">Week {week.week}</td>
                <td className="p-3 text-gray-400">{week.topics.join(", ")}</td>
                <td className="p-3 text-gray-400">{week.targets}</td>
                <td className="p-3 text-gray-400">{week.homework}</td>
                <td className="p-3 text-gray-400">{week.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render the calendar with deadlines and holidays
  const renderCalendar = () => {
    const deadlines =
      generatedLog?.weeklyPlan?.map((week) => new Date(week.deadline)) || [];

    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex gap-3">
          <FaCalendarAlt size={30} className="text-white" />
          <h3 className="text-2xl font-bold text-white mb-4">Calendar</h3>
        </div>
        <Calendar
          value={calendarDate}
          onChange={setCalendarDate}
          tileClassName={({ date }) => {
            const isDeadline = deadlines.some(
              (deadline) => deadline.toDateString() === date.toDateString()
            );
            return isDeadline ? "bg-red-500 text-white rounded-full" : null;
          }}
        />
      </div>
    );
  };

  // Render the daily progress section with a filter/search bar
  const renderDailyProgress = () => {
    return (
      <div className="mb-8 mt-4">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Daily Progress
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by day (e.g., Day 1, Day 2)"
            value={selectedDay ? `Day ${selectedDay + 1}` : ""}
            onChange={(e) => {
              const day = parseInt(e.target.value.replace("Day ", "")) - 1;
              setSelectedDay(day >= 0 && day < 7 ? day : null);
            }}
            className="w-full p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {selectedDay !== null && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              Day {selectedDay + 1}
            </h3>
            <textarea
              value={dailyLog}
              onChange={(e) => setDailyLog(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Update daily log"
              rows={4}
            />
            <button
              onClick={() => updateDailyLog(0, selectedDay)} // Assuming weekIndex is 0 for simplicity
              className="w-full bg-indigo-500 text-white py-2 rounded-lg mt-4 hover:bg-indigo-600 transition-all duration-300"
            >
              Update Log
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Log Page
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Log Generator Section */}
        <div className="col-span-2">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Log Generator
          </h2>

          {generatedLog ? (
            renderGeneratedLog()
          ) : (
            <button
              onClick={generateLog}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaPlus className="mr-2" />
              )}
              {loading ? "Generating..." : "Generate Log +"}
            </button>
          )}
        </div>

        {/* Calendar Section */}
        <div className="col-span-1 mt-12">{renderCalendar()}</div>
      </div>

      {/* Daily Progress Section */}
      {/* {renderDailyProgress()} */}


      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white flex items-center">
            <FaHistory className="mr-2" /> Daily Log History
          </h2>
          <button
            onClick={handleAddRow}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition duration-300"
          >
            <FaPlus className="mr-2" /> Add New Log
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-96">
          <table className="w-full bg-gray-700 rounded-lg text-sm">
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Week</th>
                <th className="p-3 text-left">Day</th>
                <th className="p-3 text-left">Log</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* New Log Rows (Editable) */}
              {newRows.map((row, index) => (
                <tr key={`new-${index}`} className="border-b border-gray-600">
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={row.subject}
                      onChange={(e) => handleInputChange(e, index, "subject")}
                      className="w-full p-2 bg-gray-700 text-white rounded-lg"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Class"
                      value={row.class}
                      onChange={(e) => handleInputChange(e, index, "class")}
                      className="w-full p-2 bg-gray-700 text-white rounded-lg"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Week"
                      value={row.week}
                      onChange={(e) => handleInputChange(e, index, "week")}
                      className="w-full p-2 bg-gray-700 text-white rounded-lg"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Day"
                      value={row.day}
                      onChange={(e) => handleInputChange(e, index, "day")}
                      className="w-full p-2 bg-gray-700 text-white rounded-lg"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Log Entry"
                      value={row.log}
                      onChange={(e) => handleInputChange(e, index, "log")}
                      className="w-full p-2 bg-gray-700 text-white rounded-lg"
                    />
                  </td>
                  <td className="p-3 flex space-x-2">
                    <button
                      onClick={() => saveNewLog(index)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition duration-300"
                    >
                      <FaSave className="mr-2" /> Save
                    </button>
                    <button
                      onClick={() => removeNewRow(index)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600 transition duration-300"
                    >
                      <FaTrash className="mr-2" /> Remove
                    </button>
                  </td>
                </tr>
              ))}

              {/* Existing Logs (Saved) */}
              {ddailyLogs.length > 0 ? (
                ddailyLogs.map((log, index) => (
                  <tr key={`saved-${index}`} className="border-b border-gray-600 hover:bg-gray-600 transition duration-200">
                    <td className="p-3 text-white">{log.subject}</td>
                    <td className="p-3 text-gray-400">{log.class}</td>
                    <td className="p-3 text-gray-400">{log.week}</td>
                    <td className="p-3 text-gray-400">Day {log.day}</td>
                    <td className="p-3 text-gray-400">{log.log}</td>
                    <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-white text-center" colSpan="6">
                    No logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default LogPage;
