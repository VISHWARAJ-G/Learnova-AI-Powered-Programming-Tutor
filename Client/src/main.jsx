import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import { LessonProvider } from "./context/LessonsContext";
import { TutorProvider } from "./context/TutorContext";
import { QuizProvider } from "./context/QuizContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LessonProvider>
          <QuizProvider>
            <TutorProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </TutorProvider>
          </QuizProvider>
        </LessonProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
