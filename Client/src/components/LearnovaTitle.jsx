import { useTheme } from "@/context/ThemeContext";
import { MoonStarIcon } from "lucide-react";
import React from "react";

function LearnovaTitle() {
  const { lightTheme, setLightTheme } = useTheme();
  return (
    <div className="flex items-center justify-between">
      <div>
        <img
          src={lightTheme ? "Learnova-Logo.png" : "Learnova-Logo-Dark.png"}
          alt="Learnova"
          className="h-20 w-20"
        />
      </div>
      <button
        onClick={() => setLightTheme(!lightTheme)}
        className="flex items-center justify-center p-2 border-2 border-blue-700 rounded-xl"
      >
        <MoonStarIcon className="text-blue-700" />
      </button>
    </div>
  );
}

export default LearnovaTitle;
