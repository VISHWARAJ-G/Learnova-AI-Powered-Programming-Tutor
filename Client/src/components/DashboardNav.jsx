import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, MoonStarIcon, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useTheme } from "@/context/ThemeContext";

function DashboardNav() {
  const menuRef = useRef(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log(user);
  if (!user) return null;
  const userDetails = user?.profile || {};
  const { lightTheme, setLightTheme } = useTheme();
  const navLinkDetails = [
    { navName: "Home", toLink: "/student-dashboard", endTrue: true },
    { navName: "Lessons", toLink: "/student-dashboard/lessons" },
    { navName: "AI Tutor", toLink: "/student-dashboard/tutor-ai" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const signoutFunc = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };
  return (
    <nav
      className={`fixed top-0 left-0 flex justify-between items-center w-full z-50 ${
        lightTheme ? "bg-white text-black" : "bg-gray-800 text-white"
      } px-5`}
    >
      <div className="flex justify-between items-center gap-3">
        <img
          src={lightTheme ? "/Learnova-Logo.png" : "/Learnova-Logo-Dark.png"}
          alt="Logo"
          className="h-20 w-20 p-1"
        />
      </div>
      <div className="flex gap-5 justify-between items-center">
        {navLinkDetails.map((linkDetail) => {
          return (
            <NavLink
              key={linkDetail.navName}
              end={linkDetail.endTrue === true}
              className={({ isActive }) =>
                isActive
                  ? "text-[#1E88E5] font-semibold border-b-2 border-[#00BCD4]"
                  : `hover:text-[#1E88E5] ${
                      lightTheme ? "text-gray-600" : "text-gray-300"
                    }`
              }
              to={linkDetail.toLink}
            >
              {linkDetail.navName}
            </NavLink>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-5">
        <button
          onClick={() => setLightTheme(!lightTheme)}
          className="flex items-center justify-center p-2 border-2 border-blue-700 rounded-xl"
        >
          <MoonStarIcon className="text-blue-700" />
        </button>
        <div ref={menuRef} className="relative">
          <button
            className="flex justify-center"
            onClick={() => setShowProfile(!showProfile)}
            disabled={!user}
          >
            <div>
              <Avatar className="flex items-center justify-center shadow-sm">
                <AvatarImage
                  src={
                    userDetails?.avatar_number
                      ? `/avatars/avatar${userDetails.avatar_number}.png`
                      : "/avatars/default.png"
                  }
                  alt={userDetails?.full_name || "User"}
                  className="object-cover h-10 w-10 rounded-full"
                />
                <AvatarFallback className="text-red-600 bg-sky-100 text-xl font-semibold p-2 rounded-full">
                  {userDetails?.full_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.2 }}
                className={`absolute shadow-xl rounded-2xl right-0 top-16 p-4 flex flex-col gap-4 z-50 ${
                  lightTheme ? "bg-white" : "bg-gray-950"
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex items-center">
                    <Avatar className="h-14 w-14 shadow-sm flex items-center justify-center">
                      <AvatarImage
                        src={`/avatars/avatar${userDetails?.avatar_number}.png`}
                        alt={userDetails?.full_name || "?"}
                        className="object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="text-red-600 text-xl font-semibold p-4 rounded-full bg-sky-100">
                        {userDetails?.full_name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">
                      {userDetails?.full_name || "?"}
                    </p>
                    <p className="text-sm text-gray-500">{userDetails.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-lg pl-3">
                  <NavLink
                    to="/edit-profile"
                    navName="Edit Profile"
                    className={`text-blue-600 underline flex gap-8 items-center font-medium group`}
                  >
                    <User className="transition-transform group-hover:translate-x-1" />
                    Edit Profile
                  </NavLink>
                  <button
                    onClick={signoutFunc}
                    className="flex text-red-700 gap-8 items-center font-medium group"
                  >
                    <LogOut className="transition-transform group-hover:translate-x-1" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNav;
