import React, { useState, useEffect } from "react";
import { getDoc, doc, updateDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useLocation } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";

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
  const location = useLocation();

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

      const curriculumDoc = await getDoc(doc(db, `teachers/${teacherId}/curriculum`, curriculumDocId));
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
        const initialWeeklyStructure = generatedLogData.weeklyPlan.map((week) => ({
          ...week,
          logs: Array(7).fill(""), // Assuming 7 days in a week
        }));
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

      const logText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

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
      const curriculumDoc = doc(db, `teachers/${teacherId}/curriculum`, curriculumDocId);
      await updateDoc(curriculumDoc, { generatedLog: parsedLog, weeklyStructure: initialWeeklyStructure });

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

  // Update the generated log
  const updateGeneratedLog = async () => {
    if (!generatedLog) return;

    try {
      const curriculumDoc = doc(db, `teachers/${teacherId}/curriculum`, curriculumDocId);
      await updateDoc(curriculumDoc, { generatedLog });

      setEditing(false); // Exit edit mode
      alert("Log updated successfully!");
    } catch (error) {
      console.error("Error updating log:", error);
      alert("Failed to update log.");
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

  // Render the generated log
  const renderGeneratedLog = () => {
    if (!generatedLog) return null;

    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-white mb-4">Generated Log</h3>
        <div className="text-gray-400">
          <h4 className="text-lg font-semibold mb-2">Weekly Plan</h4>
          {generatedLog.weeklyPlan?.map((week, weekIndex) => (
            <div key={weekIndex} className="mb-6 p-4 bg-gray-700 rounded-lg">
              <p className="text-lg font-medium text-white">Week {week.week}</p>
              {editing ? (
                <>
                  <label className="block text-white">Topics:</label>
                  <input
                    type="text"
                    value={week.topics.join(", ")}
                    onChange={(e) =>
                      handleLogChange("weeklyPlan", e.target.value.split(", "), weekIndex, "topics")
                    }
                    className="w-full bg-gray-600 text-white p-2 rounded-lg mt-2"
                  />
                  <label className="block text-white mt-4">Targets:</label>
                  <input
                    type="text"
                    value={week.targets}
                    onChange={(e) =>
                      handleLogChange("weeklyPlan", e.target.value, weekIndex, "targets")
                    }
                    className="w-full bg-gray-600 text-white p-2 rounded-lg mt-2"
                  />
                  <label className="block text-white mt-4">Homework:</label>
                  <input
                    type="text"
                    value={week.homework}
                    onChange={(e) =>
                      handleLogChange("weeklyPlan", e.target.value, weekIndex, "homework")
                    }
                    className="w-full bg-gray-600 text-white p-2 rounded-lg mt-2"
                  />
                  <label className="block text-white mt-4">Deadline:</label>
                  <input
                    type="text"
                    value={week.deadline}
                    onChange={(e) =>
                      handleLogChange("weeklyPlan", e.target.value, weekIndex, "deadline")
                    }
                    className="w-full bg-gray-600 text-white p-2 rounded-lg mt-2"
                  />
                </>
              ) : (
                <>
                  <p><strong>Topics:</strong> {Array.isArray(week.topics) ? week.topics.join(", ") : "No topics available"}</p>
                  <p><strong>Targets:</strong> {week.targets || "No targets available"}</p>
                  <p><strong>Homework:</strong> {week.homework || "No homework available"}</p>
                  <p><strong>Deadline:</strong> {week.deadline || "No deadline available"}</p>
                </>
              )}
            </div>
          ))}
          <h4 className="text-lg font-semibold mb-2">Monthly Targets</h4>
          {generatedLog.monthlyTargets?.map((month, monthIndex) => (
            <div key={monthIndex} className="mb-6 p-4 bg-gray-700 rounded-lg">
              <p className="text-lg font-medium text-white">{month.month}</p>
              {editing ? (
                <>
                  <label className="block text-white">Targets:</label>
                  <input
                    type="text"
                    value={month.targets}
                    onChange={(e) =>
                      handleLogChange("monthlyTargets", e.target.value, monthIndex, "targets")
                    }
                    className="w-full bg-gray-600 text-white p-2 rounded-lg mt-2"
                  />
                  <label className="block text-white mt-4">Progress Summary:</label>
                  <input
                    type="text"
                    value={month.progressSummary}
                    onChange={(e) =>
                      handleLogChange("monthlyTargets", e.target.value, monthIndex, "progressSummary")
                    }
                    className="w-full bg-gray-600 text-white p-2 rounded-lg mt-2"
                  />
                </>
              ) : (
                <>
                  <p><strong>Targets:</strong> {month.targets || "No targets available"}</p>
                  <p><strong>Progress Summary:</strong> {month.progressSummary || "No progress summary available"}</p>
                </>
              )}
            </div>
          ))}
          <h4 className="text-lg font-semibold mb-2">Mid-Term Deadlines</h4>
          <div className="p-4 bg-gray-700 rounded-lg">
            {editing ? (
              <>
                <label className="block text-white">Topics to Complete:</label>
                <input
                  type="text"
                  value={generatedLog.midTermDeadlines?.topicsToComplete.join(", ")}
                  onChange={(e) =>
                    handleLogChange("midTermDeadlines", { ...generatedLog.midTermDeadlines, topicsToComplete: e.target.value.split(", ") }, null, "")
                  }
                  className="w-full bg-gray-600 text-white p-2 rounded-lg mt-2"
                />
                <label className="block text-white mt-4">Deadline:</label>
                <input
                  type="text"
                  value={generatedLog.midTermDeadlines?.deadline}
                  onChange={(e) =>
                    handleLogChange("midTermDeadlines", { ...generatedLog.midTermDeadlines, deadline: e.target.value }, null, "")
                  }
                  className="w-full bg-gray-600 text-white p-2 rounded-lg mt-2"
                />
              </>
            ) : (
              <>
                <p><strong>Topics to Complete:</strong> {Array.isArray(generatedLog.midTermDeadlines?.topicsToComplete) ? generatedLog.midTermDeadlines.topicsToComplete.join(", ") : "No topics available"}</p>
                <p><strong>Deadline:</strong> {generatedLog.midTermDeadlines?.deadline || "No deadline available"}</p>
              </>
            )}
          </div>
        </div>
        <button
          onClick={editing ? updateGeneratedLog : () => setEditing(true)}
          className="w-full bg-indigo-500 text-white py-2 rounded-lg mt-4 hover:bg-indigo-600 transition-all duration-300"
        >
          {editing ? "Save Changes" : "Edit Log"}
        </button>
      </div>
    );
  };

  // Render the daily progress section
  const renderDailyProgress = () => {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Daily Progress</h2>
        {weeklyStructure.map((week, weekIndex) => (
          <div key={weekIndex} className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Week {weekIndex + 1}</h3>
            <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3 text-left text-white">Day</th>
                  <th className="p-3 text-left text-white">Log</th>
                  <th className="p-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
              {week.logs.map((log, dayIndex) => {
                  const logKey = `${weekIndex}-${dayIndex}`;
                  const savedLog = dailyLogs[logKey] || "";

                  return (
                    <tr key={dayIndex} className="border-b border-gray-700">
                      <td className="p-3 text-white">Day {dayIndex + 1}</td>
                      <td className="p-3 text-gray-400">{savedLog}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={dailyLog}
                          onChange={(e) => setDailyLog(e.target.value)}
                          className="w-full bg-gray-700 text-white p-2 rounded-lg"
                          placeholder="Update daily log"
                        />
                        <button
                          onClick={() => updateDailyLog(weekIndex, dayIndex)}
                          className="w-full bg-indigo-500 text-white py-2 rounded-lg mt-2 hover:bg-indigo-600 transition-all duration-300"
                        >
                          Update Log
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Log Page</h1>

      {/* Log Generator Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Log Generator</h2>
        {generatedLog ? (
          renderGeneratedLog()
        ) : (
          <button
            onClick={generateLog}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
          >
            {loading ? "Generating..." : "Generate Log"}
          </button>
        )}
      </div>

      {/* Daily Progress Update Section */}
      {renderDailyProgress()}
    </div>
  );
};

export default LogPage;