import React, { useState } from "react";
import ImageSection from "../components/ImageSection";
import SignupPage from "../components/SignupPage";
import LoginSection from "../components/LoginSection";

function AuthPage() {
  const [viewLogin, setViewLogin] = useState(true);
  return (
    <>
      <div className="flex inter items-center h-screen">
        <ImageSection viewLogin={viewLogin} />
        {viewLogin ? (
          <LoginSection key={"login"} setViewLogin={setViewLogin} />
        ) : (
          <SignupPage key={"signup"} setViewLogin={setViewLogin} />
        )}
      </div>
    </>
  );
}

export default AuthPage;
