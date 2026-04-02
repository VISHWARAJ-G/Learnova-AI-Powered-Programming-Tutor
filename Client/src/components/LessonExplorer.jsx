import { useAuth } from "@/context/AuthContext";
import { useLesson } from "@/context/LessonsContext";
import { useTheme } from "@/context/ThemeContext";
import { useTutor } from "@/context/TutorContext";
import React, { useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { Link, useNavigate } from "react-router-dom";

function LessonExplorer({
  visibleItems,
  logoForProgress,
  expanded,
  setExpanded,
  setShowOverlay,
  loadingResourceId,
  setLoadingResourceId,
  setQuizLessonContent,
}) {
  const { lightTheme } = useTheme();
  const { setLessonsWithStatus } = useLesson();
  const { user } = useAuth();
  const {
    setLessonContent,
    setLessonId,
    setDomain,
    setLessonTitle,
    setResources,
  } = useTutor();
  const navigate = useNavigate();
  const [loadingLessonId, setLoadingLessonId] = useState(null);
  const alterNamesForProgress = {
    "Not Started": "Get Started",
    "In Progress": "Continue Learning",
  };
  const baseBtn =
    "w-full font-medium px-4 py-2.5 rounded-2xl flex gap-6 items-center focus:ring-4 focus:outline-none text-center leading-5";
  const activeLight =
    "text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600";
  const activeDark =
    "text-cyan-200 bg-cyan-950 border border-cyan-700 shadow-lg shadow-cyan-900/80";
  const statusStyles = {
    "Not Started": {
      light:
        "text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/50",
      dark: "text-red-200 bg-red-950 border border-red-700 shadow-lg shadow-red-900/40",
    },
    "In Progress": {
      light:
        "text-white text-heading bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 shadow-lg shadow-yellow-500/50",
      dark: "text-yellow-200 bg-yellow-950 border border-yellow-700 shadow-lg shadow-yellow-900/40",
    },
    Completed: {
      light:
        "text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 shadow-lg shadow-green-500/50",
      dark: "text-green-200 bg-green-950 border border-green-700 shadow-lg shadow-green-900/40",
    },
  };

  const handleTopic = async (lessonId, lessonTitle, domain, description) => {
    setQuizLessonContent({ lessonId, lessonTitle, domain, description });
  };

  const handleResource = async (lessonId, lessonTitle, domain, description) => {
    setLoadingResourceId(lessonId);
    try {
      const response = await fetch("http://localhost:5000/api/resource/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lessonId,
          lessonTitle: lessonTitle,
          domain: domain,
          description: description,
        }),
      });
      const data = await response.json();
      setResources(data.resources);
      console.log(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResourceId(null);
    }
  };

  return (
    <>
      <div
        className={`grid transition-all duration-300 border rounded-xl ${
          expanded
            ? "max-h-[400px] overflow-y-auto"
            : "max-h-[300px] overflow-hidden"
        }`}
      >
        {visibleItems.map((item, index) => {
          const Logo = logoForProgress[item.status];
          return (
            <div
              key={index}
              className={`p-4  ${
                lightTheme
                  ? "bg-white hover:bg-slate-200"
                  : "bg-[#001535] text-white hover:bg-slate-700"
              } shadow-sm flex gap-10 ${
                !expanded && index === 3 ? "blur-[10px] opacity-70" : ""
              }`}
            >
              <div className={`w-[5%] flex items-center`}>
                <div
                  className={`p-2 rounded-2xl ${
                    lightTheme
                      ? statusStyles[item.status].light
                      : statusStyles[item.status].dark
                  }`}
                >
                  <Logo />
                </div>
              </div>
              <div className="flex flex-col gap-3 w-[55%]">
                <p className="font-bold">{item.title}</p>
                <p
                  className={`text-sm ${
                    lightTheme ? "text-gray-500" : "text-gray-300"
                  }`}
                >
                  {item.description}
                </p>
              </div>
              <div className="w-[40%] flex items-center justify-center">
                <div className="w-[50%] flex justify-center">
                  {loadingResourceId !== item.id ? (
                    <button
                      onClick={async () => {
                        await handleResource(
                          item.id,
                          item.title,
                          item.domain,
                          item.description
                        );
                        setShowOverlay(true);
                      }}
                      type="button"
                      className={`rounded-base text-sm px-4 py-2.5 text-center leading-5 font-medium transition-all ${
                        lightTheme ? activeLight : activeDark
                      }`}
                    >
                      Get Resources
                    </button>
                  ) : (
                    <RotatingLines
                      strokeColor="#0284C7"
                      width="40"
                      height="40"
                    />
                  )}
                </div>
                <div className="w-[50%] flex justify-center">
                  {loadingLessonId !== item.id ? (
                    <Link
                      to={`/student-dashboard/quiz/${item.id}`}
                      onClick={() =>
                        handleTopic(
                          item.id,
                          item.title,
                          item.domain,
                          item.description
                        )
                      }
                      className={`rounded-base text-sm px-4 py-2.5 text-center leading-5 font-medium ${
                        lightTheme
                          ? statusStyles[item.status].light
                          : statusStyles[item.status].dark
                      }`}
                    >
                      {alterNamesForProgress[item.status] || item.status}
                    </Link>
                  ) : (
                    <RotatingLines
                      strokeColor="#0284C7"
                      width="40"
                      height="40"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {
        <div className="absolute bottom-1 left-0 right-0 flex justify-center">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow-lg"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        </div>
      }
    </>
  );
}

export default LessonExplorer;
