import { useTheme } from "@/context/ThemeContext";
import { useTutor } from "@/context/TutorContext";
import {
  ArrowRight,
  BookOpenText,
  CheckSquare,
  FileText,
  PlayCircle,
  X,
} from "lucide-react";
import React from "react";
import { RotatingLines } from "react-loader-spinner";

function OverlayResources({ loadingResourceId, setShowOverlay }) {
  const { lightTheme } = useTheme();
  const { resources } = useTutor();
  const resourceTypeMapping = {
    article: FileText,
    video: PlayCircle,
    documentation: BookOpenText,
    practice: CheckSquare,
  };
  const resourceBg = {
    article:
      "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-base text-sm px-2 text-center leading-5",
    video:
      "text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-base text-sm px-2 text-center leading-5",
    documentation:
      "text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-base text-sm px-2 text-center leading-5",
    practice:
      "text-white text-heading bg-gradient-to-r from-lime-500 via-lime-500 to-lime-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 shadow-lg shadow-lime-500/50 dark:shadow-lg dark:shadow-lime-800/80 font-medium rounded-base text-sm px-2 text-center leading-5",
  };
  const activeLight =
    "text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600";
  const activeDark =
    "text-cyan-200 bg-cyan-950 border border-cyan-700 shadow-lg shadow-cyan-900/80";
  return (
    <div className="h-screen w-screen inset-10 bg-black/50 fixed top-0 left-0 z-50 flex items-center justify-center">
      <div
        className={`${
          lightTheme ? "bg-white" : "bg-[#001535] text-white"
        } flex flex-col gap-4 p-8 w-1/2 rounded-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex flex-col">
          <div className="flex w-full justify-between items-center">
            <h1 className="font-bold text-2xl">Resources Recommendations</h1>
            <button
              className={`p-2 ${
                lightTheme ? "hover:bg-slate-200" : "hover:bg-slate-500"
              }  rounded-xl`}
              onClick={() => setShowOverlay(false)}
            >
              <X />
            </button>
          </div>
          <div
            className={`${
              lightTheme ? "text-slate-700" : "text-slate-400"
            } text-sm`}
          >
            <h5>Curated Learning Materials For This Lesson</h5>
          </div>
        </div>
        <div className="grid grid-cols-1 border-y">
          {loadingResourceId ? (
            <RotatingLines strokeColor="#0284C7" width="40" height="40" />
          ) : (
            (resources ?? []).map((obj) => {
              const Logo = resourceTypeMapping[obj.type];
              return (
                <div
                  className={`${
                    lightTheme ? "hover:bg-slate-200 " : "hover:bg-slate-700"
                  }  px-2 rounded-xl`}
                >
                  <a
                    href={obj.url}
                    target="_blank"
                    className="group py-5 flex gap-8 items-center"
                  >
                    <div
                      className={`w-[10%] rounded-base text-sm p-4 rounded-2xl text-center leading-5 font-medium transition-all flex items-center justify-center ${
                        lightTheme ? activeLight : activeDark
                      }`}
                    >
                      <Logo />
                    </div>
                    <div className="w-[80%] flex flex-col gap-2">
                      <div className="font-bold">{obj.title}</div>
                      <div className="flex justify-start">
                        <div className={resourceBg[obj.type]}>
                          {obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div className="w-[10%] group-hover:translate-x-3">
                      <ArrowRight />
                    </div>
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default OverlayResources;
