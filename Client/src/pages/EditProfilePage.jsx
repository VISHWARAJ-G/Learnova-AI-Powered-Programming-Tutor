import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/services/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { ArrowLeft, MoonStarIcon, Pencil } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

const schema = yup.object().shape({
  full_name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be under 50 characters")
    .matches(
      /^[A-Za-z\s.-]+$/,
      "Name can only contain letters, spaces, dots, and hyphens"
    ),
  email: yup.string().email("Invalid Email"),
  college_name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be under 50 characters")
    .matches(
      /^[A-Za-z\s.-]+$/,
      "Name can only contain letters, spaces, dots, and hyphens"
    ),
});

function EditProfilePage() {
  const [loading, setLoading] = useState(false);
  const Navigation = useNavigate();
  const { lightTheme, setLightTheme } = useTheme();
  const { user, session, setUser, setSession } = useAuth();
  const imageRef = useRef();
  const userDetails = user.profile;
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(
    `/avatars/avatar${userDetails?.avatar_number}.png`
  );
  console.log(userDetails);

  const formDetail = [
    {
      nameVal: "full_name",
      idVal: "full_name",
      editable: true,
      labelVal: "Full Name",
      placeholderVal: "Enter your name",
    },
    {
      nameVal: "email",
      idVal: "email",
      editable: false,
      labelVal: "Email Address",
      placeholderVal: "Enter your email",
    },
    {
      nameVal: "college_name",
      idVal: "college_name",
      editable: true,
      labelVal: "College Name",
      placeholderVal: "Enter your college name",
    },
  ];

  const handleEditSubmission = async (values, resetForm) => {
    if (loading) return;

    console.log("Hi 1");

    setLoading(true);
    const { full_name, college_name } = values;

    const userId = user?.id || session?.user?.id;

    if (!userId) {
      toast.error("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    console.log("Hi 2");

    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (fetchError || !existingProfile) {
        throw new Error("No matching user found. Try re-logging in.");
      }

      console.log("Hi 3");

      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: full_name,
          college_name: college_name,
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No matching user found.");

      console.log("Hi 4");

      const { data: freshProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setUser((prev) => ({ ...prev, profile: freshProfile }));

      console.log("Hi 5");

      toast.success("Profile updated successfully!");
      resetForm();
      await Navigation("/student-dashboard");
    } catch (error) {
      console.error("Profile update error:", error.message);
      toast.error("Failed to update profile. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center ${
        lightTheme ? "bg-gray-300 text-black" : "bg-gray-950 text-white"
      } min-h-screen min-w-full`}
    >
      <div className="w-1/2 flex flex-col gap-3">
        <nav className="w-full flex justify-between sticky top-0">
          <button
            onClick={() => {
              Navigation("/student-dashboard");
            }}
            to="/student-dashboard"
            className={`flex gap-2 items-center ${
              lightTheme ? "text-gray-800" : "text-gray-300"
            } hover:text-blue-600`}
          >
            <ArrowLeft />
            Back to dashboard
          </button>
          <button
            type="button"
            onClick={() => setLightTheme(!lightTheme)}
            className="flex items-center justify-center p-2 border-2 border-blue-700 rounded-xl"
          >
            <MoonStarIcon className="text-blue-700" />
          </button>
        </nav>
        <p className="font-extrabold text-3xl text-center mt-[-10px]">
          Edit Profile
        </p>
        <section
          className={`${
            lightTheme ? "bg-white" : "bg-slate-800"
          } flex flex-col px-5 p-8 gap-4`}
        >
          {userDetails && (
            <Formik
              validationSchema={schema}
              initialValues={{
                full_name: userDetails?.full_name || "",
                email: userDetails.email,
                college_name: userDetails?.college_name || "",
              }}
              enableReinitialize
              onSubmit={(values, { resetForm }) =>
                handleEditSubmission(values, resetForm)
              }
            >
              {({ dirty, isValid }) => (
                <Form className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 items-center justify-center">
                    <div className="relative flex flex-col gap-3 items-center justify-center">
                      <Avatar className="h-20 w-20 flex items-center justify-center shadow-sm">
                        <AvatarImage
                          src={preview}
                          alt={userDetails?.full_name}
                          className="object-cover h-20 w-20 rounded-full"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex items-center justify-center">
                          <AvatarFallback className="text-black flex items-center justify-center h-20 w-20 bg-yellow-500 text-5xl  p-2 rounded-full">
                            {userDetails?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        </div>
                      </Avatar>
                      <p className="font-bold">
                        {userDetails?.full_name || "?"}
                      </p>
                    </div>
                  </div>
                  {formDetail.map((obj) => {
                    return (
                      <div className="flex flex-col gap-3">
                        <label
                          htmlFor={obj.nameVal}
                          className="text-sm text-gray-500 font-medium"
                        >
                          {obj.labelVal}
                        </label>
                        <Field
                          id={obj.idVal}
                          disabled={!obj.editable}
                          name={obj.nameVal}
                          className={`rounded-2xl font-medium border-2 py-3 px-4 w-full focus:outline-none transition-all duration-200 ${
                            obj.editable
                              ? lightTheme
                                ? "bg-white border-gray-300 text-black"
                                : "bg-gray-800 border-gray-700 text-white"
                              : lightTheme
                              ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                              : "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed opacity-70"
                          }`}
                        />
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
                  <div className="flex items-center gap-10 justify-end">
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          Navigation("/student-dashboard");
                        }}
                        className={`px-5 py-2 flex items-center justify-center text-center rounded-2xl font-semibold border-2 border-gray-500 ${
                          lightTheme ? "text-black" : "text-white"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                    <div>
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <RotatingLines strokeColor="#0284C7" width={"40"} />
                        </div>
                      ) : (
                        <button
                          type="submit"
                          disabled={!dirty || !isValid}
                          className={`text-center font-semibold rounded-2xl flex items-center px-5 py-2 ${
                            !dirty || !isValid
                              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                              : "bg-sky-600 text-white hover:bg-sky-500"
                          }`}
                        >
                          Save Changes
                        </button>
                      )}
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </section>
      </div>
    </div>
  );
}

export default EditProfilePage;
