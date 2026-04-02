import "./App.css";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import DashHome from "./pages/DashHome";
import DashLessons from "./pages/DashLessons";
import EditProfilePage from "./pages/EditProfilePage";
import TutorUi from "./pages/TutorUi";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import QuizSection from "./pages/QuizSection";
import DashboardNav from "./components/DashboardNav";
import ProfileGuard from "./routes/ProfileGuard";
import QuizResult from "./pages/QuizResult";

function App() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const location = useLocation();

  const [quizLessonContent, setQuizLessonContent] = useState({
    lessonId: "",
    lessonTitle: "",
    domain: "",
    description: "",
  });

  const hideNavbar =
    location.pathname.startsWith("/student-dashboard/quiz/") ||
    location.pathname === "/edit-profile" ||
    location.pathname === "/";

  useEffect(() => {
    if (!loading && user && location.pathname === "/") {
      if (!user.profile?.full_name) {
        navigate("/edit-profile", { replace: true });
      } else {
        navigate("/student-dashboard", { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <>
      <ToastContainer position="top-right" />

      {!loading && !hideNavbar && user && <DashboardNav />}

      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route
          path="/student-dashboard/*"
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <StudentDashboard />
              </ProfileGuard>
            </ProtectedRoute>
          }
        >
          <Route
            path="quiz/:lessonId"
            element={
              <QuizSection
                quizLessonContent={quizLessonContent}
                setQuizLessonContent={setQuizLessonContent}
              />
            }
          />

          <Route
            path="quiz-result/:quizId/:lessonId"
            element={<QuizResult quizLessonContent={quizLessonContent} />}
          />

          <Route index element={<DashHome />} />

          <Route
            path="lessons/:domainName?"
            element={
              <DashLessons
                quizLessonContent={quizLessonContent}
                setQuizLessonContent={setQuizLessonContent}
              />
            }
          />

          <Route path="tutor-ai" element={<TutorUi />} />
        </Route>

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
