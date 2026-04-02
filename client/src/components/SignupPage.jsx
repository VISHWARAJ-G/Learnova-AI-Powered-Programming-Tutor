import React, { useState } from "react";
import { SignupContent } from "../utils/SignupFormContents";
import LearnovaTitle from "./LearnovaTitle";
import * as yup from "yup";
import { supabase } from "../services/supabaseClient";
import { RotatingLines } from "react-loader-spinner";
import { ArrowLeft, Eye, EyeClosed } from "lucide-react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const schema = yup.object().shape({
  full_name: yup
    .string()
    .required("Name is Required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be under 50 characters")
    .matches(
      /^[A-Za-z\s.-]+$/,
      "Name can only contain letters, spaces, dots, and hyphens"
    ),
  email: yup.string().email("Invalid Email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "At least 8 Characters")
    .matches(/[A-Z]/, "Must contain one uppercase letter")
    .matches(/[0-9]/, "Must contain one number")
    .matches(/[@$!#%*?&]/, "Must contain one special character"),
  cpassword: yup
    .string()
    .required("Password must match")
    .oneOf([yup.ref("password"), null], "Password must match"),
});

function SignupPage({ setViewLogin }) {
  const { lightTheme, setLightTheme } = useTheme();
  const signupContent = SignupContent;
  const [loading, setLoading] = useState(false);
  const [viewPass, setViewPass] = useState(false);
  const [viewCPass, setViewCPass] = useState(false);
  const { loginWithGoogle } = useAuth();

  const handleFormSubmit = async (data, { resetForm }) => {
    setLoading(true);

    const { email, password, full_name } = data;
    console.log(full_name);

    const { data: userData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        toast.info("Account already exists! Please log in instead.");
        setViewLogin(true);
        setLoading(false);
        return;
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    toast.success("Signup successful! Please verify your email before login.");

    resetForm();
    setViewLogin(true);
    setLoading(false);
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
      className={`w-[55%] px-20 py-7 pb-3 flex flex-col gap-5 h-screen overflow-y-auto ${
        lightTheme ? "bg-auto" : "bg-gray-950 text-white"
      }`}
    >
      <LearnovaTitle />
      <div className="flex flex-col gap-2">
        <p className="text-4xl font-extrabold">Create Your Account</p>
        <p className="text-gray-500 text-sm">
          Your Personal AI Learning Platform Awaits
        </p>
      </div>
      <Formik
        initialValues={{
          full_name: "",
          email: "",
          password: "",
          cpassword: "",
        }}
        validationSchema={schema}
        onSubmit={handleFormSubmit}
      >
        {() => (
          <Form className="mt-4">
            <div className="grid grid-cols-2 gap-5">
              {signupContent.map((obj) => {
                return (
                  <div className="flex flex-col gap-2">
                    <label>
                      {obj.labelVal}
                      <span className="text-red-800 ml-2">*</span>
                    </label>
                    <div
                      className={`${
                        obj.typeVal === "password" ? "relative" : ""
                      }`}
                    >
                      <Field
                        name={obj.nameVal}
                        autoComplete={obj.autocomplete}
                        type={
                          (obj.nameVal === "password" && !viewPass) ||
                          (obj.nameVal === "cpassword" && !viewCPass)
                            ? obj.typeVal
                            : "text"
                        }
                        placeholder={obj.placeholderVal}
                        className={`rounded-2xl border-2 py-3 px-4 w-full focus:outline-none ${
                          lightTheme ? "" : "bg-gray-800 border-gray-700"
                        }`}
                      />
                      {obj.nameVal === "password" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setViewPass((prev) => !prev);
                          }}
                          className="absolute top-1/3 right-5"
                        >
                          {viewPass ? <Eye /> : <EyeClosed />}
                        </button>
                      ) : obj.nameVal === "cpassword" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setViewCPass((prev) => !prev);
                          }}
                          className="absolute top-1/3 right-5"
                        >
                          {viewCPass ? <Eye /> : <EyeClosed />}
                        </button>
                      ) : (
                        ""
                      )}
                    </div>
                    <ErrorMessage
                      name={obj.nameVal}
                      component="p"
                      className="text-red-700 animate-pulse font-bold"
                    />
                  </div>
                );
              })}
            </div>
            {loading ? (
              <div className="flex items-center justify-center">
                <RotatingLines strokeColor="#0284C7" width={"40"} />
              </div>
            ) : (
              <button
                type="submit"
                className={`${buttonBase} ${
                  lightTheme ? buttonLight : buttonDark
                }`}
              >
                Sign Up
              </button>
            )}
          </Form>
        )}
      </Formik>

      <button
        onClick={authWithGoogle}
        className="font-medium text-center rounded-2xl py-4 flex justify-center items-center gap-3 border-2 border-gray-300 mb-2"
      >
        <img src="Google.png" alt="Google-Image" className="h-5 w-5" />
        <p>Continue with Google</p>
      </button>
      <div className="flex gap-2 pb-10 -mt-2 group items-center cursor-pointer font-medium justify-center">
        <ArrowLeft className="transition-transform text-center duration-200 group-hover:-translate-x-1" />{" "}
        <button onClick={() => setViewLogin(true)}>
          Already have an Account?{" "}
          <span className="text-blue-600 underline">Login</span>
        </button>
      </div>
    </div>
  );
}

export default SignupPage;
