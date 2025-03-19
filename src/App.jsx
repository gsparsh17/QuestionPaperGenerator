import React from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Activities from './components/Activities';
import ActivityDetails from "./pages/ActivityDetails";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./components/AdminDashboard";
import QuestionPaperGenerator from "./components/QuestionPeperGenerator";
import QuestionPaperDisplay from "./components/QuestionPaperDisplay";
import FinalQuestionPaper from "./components/FinalQuestionPaper";
import Unauthorized from "./components/Unauthorised";
import SchoolDashboard from "./components/SchoolDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RecentActivities from "./components/RecentActivities";
import StaffRoom from "./components/StaffRoom";
import LibraryPage from "./components/LibraryPage";
import GeneratedPapers from "./components/GeneratedPapers";
import Main from "./components/Main";
import Help from "./components/Help";
import Settings from "./components/Settings";
import TeacherDashboard from "./components/TeacherDashboard";
import TeacherDetails from "./components/TeacherDetails";
import CurriculumPage from "./components/Curriculum";
import LogPage from "./components/Logs";
import ManualPaperEditor from "./components/ManualPaperEditor";
import AIPaperEditor from "./components/AIPaperEditor";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="flex animate-fadeIn duration-1000">
              <Sidebar />
              <MainContent />
            </div>
          } 
        />
        {/* <Route path="/main" element={
            <div className="flex animate-fadeIn duration-1000">
              <Sidebar />
              <MainContent />
            </div>
          } /> */}
          <Route path="/main" element={
            <Main/>
          } />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/help" element={<Help />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/question-paper-generator" element={<QuestionPaperGenerator/>} />
        <Route path="/manual-paper-editor" element={<ManualPaperEditor/>} />
        <Route path="/ai-paper-editor" element={<AIPaperEditor/>} />
        <Route path="/final-question-paper" element={<FinalQuestionPaper/>} />
        <Route path="/generated-papers" element={<GeneratedPapers />} />
        <Route path="/schooldashboard" element={<SchoolDashboard />} />
        <Route path="/school-dashboard/:uniqueId" element={<SchoolDashboard />} />
        <Route path="/staff-room" element={<StaffRoom />} />
        <Route path="/question-paper-display" element={<QuestionPaperDisplay />} />
        <Route path="/recent-activities" element={<RecentActivities />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/main/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/main/teacher-details" element={<TeacherDetails />} />
        <Route path="/main/curriculum" element={<CurriculumPage />} />
        <Route path="/main/log" element={<LogPage />} />
        <Route path="/activities/:activityId" element={<ActivityDetails/>} />
      </Routes>
    </Router>
  );
}

export default App;
