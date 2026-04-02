import React, { useEffect, useRef } from "react";
import DashboardNav from "../components/DashboardNav";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lightTheme } = useTheme();

  return (
    <div
      className={`${
        lightTheme
          ? "bg-gradient-to-r from-cyan-200 via-cyan-300 to-cyan-200 "
          : "bg-[#001535]"
      } min-h-screen inter`}
    >

      <main className="pt-4">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentDashboard;
