import CircularProgressBarWrapper from "@/components/CircularProgressBarWrapper";
import LessonExplorer from "@/components/LessonExplorer";
import OverlayResources from "@/components/OverlayResources";
import { useLesson } from "@/context/LessonsContext";
import { useTheme } from "@/context/ThemeContext";
import { alternateNamesForDomains, linkNames } from "@/utils/DomainService";
import { logoForDomain } from "@/utils/LogoForDomains";
import { slugify } from "@/utils/slugify";
import { CheckCircle, CircleDashed, Loader, PauseIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { useNavigate, useParams } from "react-router-dom";
import QuizSection from "./QuizSection";

function DashLessons({
  isQuizSectionOpened,
  setIsQuizSectionOpened,
  quizLessonContent,
  setQuizLessonContent,
}) {
  const logoForProgress = {
    "Not Started": CircleDashed,
    "In Progress": Loader,
    Completed: CheckCircle,
  };
  const LogoLink = logoForDomain;
  const { domain, domainProgress, loading, lessonsWithStatus } = useLesson();
  const { domainName } = useParams();
  const [activeLink, setActiveLink] = useState("C");
  const linkDerivals = linkNames;

  useEffect(() => {
    if (domainName && linkDerivals[domainName]) {
      setActiveLink(linkDerivals[domainName]);
    } else {
      setActiveLink("C");
    }
  }, [domainName]);

  const [loadingResourceId, setLoadingResourceId] = useState(null);
  const domainLessonMap = lessonsWithStatus.filter(
    (lesson) => lesson.domain === activeLink
  );

  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? domainLessonMap : domainLessonMap.slice(0, 4);
  const { lightTheme } = useTheme();
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(false);
  const alternateNames = alternateNamesForDomains;
  const baseBtn =
    "w-full font-medium px-4 py-2.5 rounded-2xl flex gap-6 items-center focus:ring-4 focus:outline-none text-center leading-5 transition-all";
  const activeLight =
    "text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600";
  const activeDark =
    "text-cyan-200 bg-cyan-950 border border-cyan-700 shadow-lg shadow-cyan-900/80";
  const inactiveLight = "text-gray-700 hover:bg-gray-100";
  const inactiveDark = "text-gray-300 hover:bg-gray-800";

  useEffect(() => {
    if (showOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showOverlay]);

  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <RotatingLines strokeColor="#0284C7" width="40" height="40" />
      </div>
    );
  }

  return (
    <>
      <div className={`${lightTheme ? "" : "text-white"}`}>
        <div className={`flex w-full pt-16`}>
          <div
            className={`w-[20%] ${
              lightTheme ? "bg-white" : "bg-gray-800"
            } flex flex-col gap-5 p-5 border-r sticky top-16 h-[calc(100vh-4rem)]`}
          >
            {domain.map((domainName) => {
              const Logo = LogoLink[domainName];
              return (
                <button
                  onClick={() => {
                    navigate(
                      `/student-dashboard/lessons/${slugify(domainName)}`,
                      { replace: true }
                    );
                    setActiveLink(domainName);
                  }}
                  className={`${baseBtn} ${
                    activeLink === domainName
                      ? lightTheme
                        ? activeLight
                        : activeDark
                      : lightTheme
                      ? inactiveLight
                      : inactiveDark
                  }`}
                >
                  <Logo className={`text-xs`} />
                  {alternateNames[domainName]}
                </button>
              );
            })}
          </div>
          <div className={`flex flex-col gap-4 w-[80%]`}>
            <div
              className={`${
                lightTheme ? "bg-white" : "bg-gray-800"
              } p-6 flex flex-col gap-4`}
            >
              <p className="font-bold text-4xl">{activeLink}</p>
              <p
                className={`text-sm ${
                  lightTheme ? "text-gray-500" : "text-gray-300"
                }`}
              >
                Start Achieving your Goals from Today
              </p>
              <div className="w-full">
                <CircularProgressBarWrapper
                  percentage={domainProgress[activeLink]}
                  text={"The only way to do great work is love what you do"}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <h1 className="font-bold text-2xl">Lesson Explorer</h1>
              <div className="relative w-full mx-auto">
                <LessonExplorer
                  visibleItems={visibleItems}
                  logoForProgress={logoForProgress}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  showOverlay={showOverlay}
                  setShowOverlay={setShowOverlay}
                  loadingResourceId={loadingResourceId}
                  setLoadingResourceId={setLoadingResourceId}
                  isQuizSectionOpened={isQuizSectionOpened}
                  setIsQuizSectionOpened={setIsQuizSectionOpened}
                  setQuizLessonContent={setQuizLessonContent}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showOverlay && (
        <OverlayResources
          setShowOverlay={setShowOverlay}
          loadingResourceId={loadingResourceId}
        />
      )}
    </>
  );
}

export default DashLessons;
