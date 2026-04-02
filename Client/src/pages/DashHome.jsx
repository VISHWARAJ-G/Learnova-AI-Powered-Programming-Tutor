import DomainSection from "@/components/DomainSection";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import React from "react";

function DashHome() {
  const { user } = useAuth();
  const userData = user?.profile || {};
  const { lightTheme } = useTheme();
  return (
    <div
      className={`px-5 pb-7 pt-24 ${lightTheme ? "text-black" : "text-white"}`}
    >
      <div className="flex flex-col gap-2">
        <p className="text-3xl font-extrabold">
          Welcome Back,{`${userData?.full_name || "User"}`} 👋
        </p>
        <p
          className={`text-base  ${
            lightTheme ? "text-gray-500" : "text-gray-400"
          }`}
        >
          You've completed 0 lessons this week! Keep up the great work.
        </p>
      </div>
      <div className="flex gap-10 pt-6">
        <DomainSection />
      </div>
    </div>
  );
}

export default DashHome;
