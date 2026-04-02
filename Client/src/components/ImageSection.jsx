import React from "react";

function ImageSection({ viewLogin }) {
  return (
    <>
      <div className="relative bg-red-900 w-[45%] h-screen">
        <img
          src={viewLogin ? "Login-Page-Image.png" : "Signup-Page-Image.png"}
          alt="Login-page-image"
          className="w-full h-screen"
        />
        <div className="absolute bottom-14 right-0 bg-gray-900/10 w-full backdrop-blur-sm rounded-xl px-2 py-3 text-white">
          <div className="font-bold text-center text-2xl">
            {viewLogin
              ? "The Future of Learning is Here."
              : "Unlock your potential with AI"}
          </div>
          <div className="text-gray-300 text-lg text-center">
            {viewLogin
              ? "Unlock Your Potential with AI"
              : "Join Learnova and start a personalized learning journey tailored just for you"}
          </div>
        </div>
      </div>
    </>
  );
}

export default ImageSection;
