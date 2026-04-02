import { useLesson } from "@/context/LessonsContext";
import { useTheme } from "@/context/ThemeContext";
import { MoveRight } from "lucide-react";
import React from "react";
import ProgressBarWrapper from "./ProgressBarWrapper";
import { logoForDomain } from "@/utils/LogoForDomains";
import { RotatingLines } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/utils/slugify";

function DomainSection() {
  const { lessons, domain, domainProgress, loading } = useLesson();
  const buttonBase =
    "text-white rounded-base text-sm px-4 py-2.5 text-center leading-5 w-full flex items-center justify-center gap-3 focus:outline-none group font-bold";
  const buttonLight =
    "bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:ring-cyan-300 shadow-lg shadow-cyan-500/50";
  const buttonDark =
    "bg-cyan-950 border border-cyan-700 text-cyan-200 focus:ring-4 focus:ring-cyan-800 shadow-lg shadow-cyan-900/80";
  const logoBase =
    "text-white rounded-base text-sm p-3 rounded-xl text-center leading-5 flex items-center justify-center gap-3 focus:outline-none group font-bold";

  const { lightTheme } = useTheme();
  const navigate = useNavigate();
  const iconMap = logoForDomain;
  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <RotatingLines strokeColor="#0284C7" width="40" height="40" />
      </div>
    );
  }
  return (
    <section className="w-[100%] grid grid-cols-3 gap-10">
      {domain.map((val) => {
        const Logo = iconMap[val];
        return (
          <div
            className={` ${
              lightTheme ? "bg-white text-black" : "bg-gray-800 text-white"
            } px-6 py-8 flex flex-col gap-4 rounded-2xl`}
          >
            <div className="flex gap-6 items-center">
              <div
                className={`${logoBase} ${
                  lightTheme ? buttonLight : buttonDark
                }`}
              >
                <Logo />
              </div>
              <div className={`font-bold`}>{val}</div>
            </div>
            <div
              className={`${
                lightTheme ? "text-gray-500" : "text-gray-300"
              } text-sm flex justify-between`}
            >
              <p>Progress</p>
              <p>{domainProgress[val]}</p>
            </div>
            <div className="w-full">
              <ProgressBarWrapper value={domainProgress[val]} />
            </div>
            <div className="w-full flex">
              <button
                className={`${buttonBase} ${
                  lightTheme ? buttonLight : buttonDark
                }`}
                onClick={() => navigate(`lessons/${slugify(val)}`)}
              >
                View Lessons{" "}
                <MoveRight className="transistion-transform duration:300 group-hover:translate-x-2" />
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default DomainSection;
