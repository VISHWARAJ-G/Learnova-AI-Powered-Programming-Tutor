import React, { useState } from "react";
import { LoginFormContent } from "../utils/LoginFormContents";
import LearnovaTitle from "./LearnovaTitle";
import * as yup from "yup";
import { supabase } from "../services/supabaseClient";
import { RotatingLines } from "react-loader-spinner";
import { Eye, EyeClosed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const schema = yup.object().shape({
  email: yup.string().email("Invalid Email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

function LoginSection({ setViewLogin }) {
  const navigate = useNavigate();
  const formContent = LoginFormContent;
  const [viewPass, setViewPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const { lightTheme } = useTheme();

  const handleFormSubmit = async (data, { resetForm }) => {
    if (loading) return;
    setLoading(true);
    try {
      const { email, password } = data;

      const userData = await loginWithEmail(email, password);
      toast.success("Login Successful");
      resetForm();

      if (!userData?.profile?.full_name) {
        toast.info("Please complete your profile before continuing!");
        navigate("/edit-profile");
      } else {
        navigate("/student-dashboard");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const authWithGoogle = async () => {
    toast.info("Redirecting to Google...");
    await loginWithGoogle();
  };

  const buttonBase =
    "text-white rounded-base text-sm px-4 py-5 text-center leading-5 w-full flex items-center justify-center gap-3 focus:outline-none group font-bold mt-5 rounded-2xl";
  const buttonLight =
    "bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:ring-cyan-300 shadow-lg shadow-cyan-500/50";
  const buttonDark =
    "bg-cyan-950 border border-cyan-700 text-cyan-200 focus:ring-4 focus:ring-cyan-800 shadow-lg shadow-cyan-900/80";

  return (
    <div
      className={`flex w-[55%] px-20 py-10 h-screen overflow-y-auto ${
        lightTheme ? "bg-auto" : "bg-gray-950 text-white"
      }`}
    >
      <div className="flex flex-col gap-2 w-full">
        <LearnovaTitle />
        <p
          className={`text-4xl font-extrabold tracking-wide ${
            lightTheme ? "" : "text-gray-300"
          }`}
        >
          Welcome Back!
        </p>
        <p
          className={`${
            lightTheme ? "text-gray-500" : "text-gray-300"
          } text-base`}
        >
          Login to Learnova to continue your learning Journey.
        </p>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={schema}
          onSubmit={handleFormSubmit}
        >
          {() => (
            <Form className="mt-4 flex flex-col gap-4">
              {formContent.map((obj) => {
                return (
                  <div key={obj.label} className="flex flex-col gap-3">
                    <label
                      className={`font-medium ${
                        lightTheme ? "" : "text-white"
                      }`}
                    >
                      {obj.labelVal}
                    </label>
                    <div
                      className={`${
                        obj.nameVal === "password" ? "relative" : ""
                      }`}
                    >
                      <Field
                        name={obj.nameVal}
                        autoComplete={obj.autocomplete}
                        type={
                          obj.nameVal === "password" && !viewPass
                            ? "password"
                            : obj.nameVal === "password" && viewPass
                            ? "text"
                            : obj.typeVal
                        }
                        placeholder={obj.placeholderVal}
                        className={`rounded-2xl border-2 py-3 px-4 w-full focus:outline-none ${
                          lightTheme ? "" : "bg-gray-800 border-gray-700"
                        }`}
                      />
                      {obj.nameVal === "password" && (
                        <button
                          type="button"
                          onClick={() => setViewPass((prev) => !prev)}
                          className="absolute top-1/3 right-5"
                        >
                          {viewPass ? (
                            <Eye
                              className={`${lightTheme ? "" : "text-white"}`}
                            />
                          ) : (
                            <EyeClosed
                              className={`${lightTheme ? "" : "text-white"}`}
                            />
                          )}
                        </button>
                      )}
                    </div>
                    <ErrorMessage
                      name={obj.nameVal}
                      component="p"
                      className={`animate-pulse font-bold ${
                        lightTheme ? "text-red-700" : "text-red-900"
                      }`}
                    />
                  </div>
                );
              })}
              {loading ? (
                <div className="flex items-center justify-center">
                  <RotatingLines strokeColor="#0284C7" width={"40"} />
                </div>
              ) : (
                <button
                  disabled={loading}
                  type="submit"
                  className={`${buttonBase} ${
                    lightTheme ? buttonLight : buttonDark
                  }`}
                >
                  Login
                </button>
              )}
            </Form>
          )}
        </Formik>
        <button
          onClick={authWithGoogle}
          className="text-center rounded-2xl py-4 flex justify-center items-center gap-3 border-2 border-gray-300 mt-3 font-medium"
        >
          <img src="Google.png" alt="Google-Image" className="h-5 w-5" />
          <p>Continue with Google</p>
        </button>
        <p className="text-center mt-3 font-medium pb-10">
          Don't have an account?
          <span>
            <button
              onClick={() => setViewLogin(false)}
              className="ml-1 text-sky-600 underline"
            >
              Sign Up
            </button>
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginSection;
