import ProgressBarWrapper from "@/components/ProgressBarWrapper";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  ArrowLeft,
  ArrowLeftIcon,
  ArrowRight,
  MoonStarIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLesson } from "@/context/LessonsContext";

function QuizSection({ quizLessonContent, setQuizLessonContent }) {
  const { lessonId } = useParams();
  const { lightTheme, setLightTheme } = useTheme();
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const { user } = useAuth();
  const uid = user?.id || user?.user?.id || user?.session?.user?.id;
  const [quizDetails, setQuizDetails] = useState(null);
  const finalLessonId = lessonId || quizLessonContent.lessonId;
  const [quizProgressDetails, setQuizProgressDetails] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [chosen, setChosen] = useState({});
  const { setLessonsWithStatus } = useLesson();
  const buttonBase =
    "rounded-xl text-sm px-4 py-4 leading-5 w-full flex items-center justify-center gap-3 focus:outline-none group ";
  const buttonLight =
    "bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:bg-gradient-to-br focus:ring-4 focus:ring-cyan-300 shadow-lg shadow-cyan-500/50 text-white";
  const buttonDark =
    "bg-cyan-950 border border-cyan-700 text-cyan-200 focus:ring-4 focus:ring-cyan-800 shadow-lg shadow-cyan-900/80";
  const greenButtonBase =
    "rounded-xl text-sm px-4 py-4 leading-5 w-full flex items-center justify-center gap-3 focus:outline-none group";
  const greenButtonLight =
    "text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:ring-green-300 shadow-lg shadow-green-500/50";
  const greenButtonDark =
    "bg-green-800/60 border border-green-700 text-green-200 focus:ring-4 focus:ring-green-800 shadow-lg shadow-green-800/80";

  const navigate = useNavigate();

  useEffect(() => {
    const uid =
      user?.id ||
      user?.user?.id ||
      user?.session?.user?.id ||
      user?.profile?.id;

    if (!uid) return;

    async function fetchQuizDetails() {
      try {
        const response = await fetch("http://localhost:5000/api/quiz/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: finalLessonId,
            lessonTitle: quizLessonContent.lessonTitle,
            domain: quizLessonContent.domain,
            description: quizLessonContent.description,
            userId: uid,
          }),
        });

        const data = await response.json();

        if (data.mode === "REVIEW") {
          navigate(
            `/student-dashboard/quiz-result/${data.quiz.id}/${data.quiz.lesson_id}`,
            { replace: true }
          );
          return;
        }

        const quizId = data.quiz.id;

        setQuizDetails({
          meta: {
            quiz_id: data.quiz.id,
            user_id: data.quiz.user_id,
            lesson_id: data.quiz.lesson_id,
          },
          payload: data.quiz.payload,
        });
        const responseLesson = await fetch(
          "http://localhost:5000/api/quiz/start",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quiz_id: data.quiz.id,
              user_id: data.quiz.user_id,
              lesson_id: data.quiz.lesson_id,
            }),
          }
        );

        const startData = await responseLesson.json();

        if (!startData?.success) {
          throw new Error("Failed to start quiz");
        }

        const quizCountResponse = await fetch(
          "http://localhost:5000/api/quizCount/get",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quiz_id: data.quiz.id,
              user_id: data.quiz.user_id,
              lesson_id: data.quiz.lesson_id,
            }),
          }
        );

        const quizCountData = await quizCountResponse.json();
        setQuizProgressDetails(quizCountData.quizProgressDetails);
        setQuestionIndex(
          quizCountData.quizProgressDetails.current_question_index
        );
        console.log(data.quiz);
        setCompletionPercent(
          Math.round(
            ((quizCountData.quizProgressDetails.current_question_index + 1) /
              data.quiz.payload.total) *
              100
          )
        );

        setLessonsWithStatus((prev) =>
          prev.map((lesson) =>
            lesson.id === finalLessonId
              ? { ...lesson, status: "In Progress" }
              : lesson
          )
        );
      } catch (err) {
        console.error("QUIZ FETCH ERROR:", err);
      } finally {
        setLoadingQuiz(false);
      }
    }

    fetchQuizDetails();
  }, [quizLessonContent, user]);

  useEffect(() => {
    if (quizProgressDetails?.selected_answers) {
      setChosen(quizProgressDetails.selected_answers);
    }
  }, [quizProgressDetails]);

  if (!uid) return null;

  if (loadingQuiz || !quizDetails) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <RotatingLines strokeColor="#0284C7" width="40" height="40" />
      </div>
    );
  }

  if (!quizProgressDetails) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <RotatingLines strokeColor="#0284C7" width="40" height="40" />
      </div>
    );
  }

  const handleNextQuestion = async () => {
    setLoadingQuiz(true);
    try {
      console.log("Hello 1");
      const nextQuestionData = await fetch(
        "http://localhost:5000/api/quizCount/next",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quiz_id: quizDetails.meta.quiz_id,
            user_id: quizDetails.meta.user_id,
            lesson_id: quizDetails.meta.lesson_id,
            questionNo: questionIndex + 1,
          }),
        }
      );

      const nextQuestionResult = await nextQuestionData.json();
      setQuizProgressDetails(nextQuestionResult.quizProgressDetails);
      setQuestionIndex(
        nextQuestionResult.quizProgressDetails.current_question_index
      );
      setCompletionPercent(
        Math.round(
          ((nextQuestionResult.quizProgressDetails.current_question_index + 1) /
            quizDetails.payload.total) *
            100
        )
      );
    } catch (err) {
      console.error("QUIZ FETCH ERROR:", err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleBackQuestion = async () => {
    setLoadingQuiz(true);
    try {
      const backQuestionData = await fetch(
        "http://localhost:5000/api/quizCount/back",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quiz_id: quizDetails.meta.quiz_id,
            user_id: quizDetails.meta.user_id,
            lesson_id: quizDetails.meta.lesson_id,
            questionNo: questionIndex - 1,
          }),
        }
      );
      const backQuestionResult = await backQuestionData.json();
      setQuizProgressDetails(backQuestionResult.quizProgressDetails);
      setQuestionIndex(
        backQuestionResult.quizProgressDetails.current_question_index
      );
      setCompletionPercent(
        Math.round(
          ((backQuestionResult.quizProgressDetails.current_question_index + 1) /
            quizDetails.payload.total) *
            100
        )
      );
    } catch (err) {
      console.error("QUIZ FETCH ERROR:", err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const questionNoNavigate = async (key) => {
    setLoadingQuiz(true);
    try {
      const updatedQuizDetails = await fetch(
        "http://localhost:5000/api/quizCount/number",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quiz_id: quizDetails.meta.quiz_id,
            user_id: quizDetails.meta.user_id,
            lesson_id: quizDetails.meta.lesson_id,
            questionNo: key,
          }),
        }
      );
      const updatedQuizResult = await updatedQuizDetails.json();
      setQuizProgressDetails(updatedQuizResult.quizProgressDetails);
      setQuestionIndex(
        updatedQuizResult.quizProgressDetails.current_question_index
      );
      setCompletionPercent(
        Math.round(
          ((updatedQuizResult.quizProgressDetails.current_question_index + 1) /
            quizDetails.payload.total) *
            100
        )
      );
    } catch (err) {
      console.error("QUIZ FETCH ERROR:", err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleOptionClick = async (key) => {
    setChosen((prev) => ({
      ...prev,
      [questionIndex]: key,
    }));
    try {
      await fetch("http://localhost:5000/api/quizCount/answer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: quizDetails.meta.quiz_id,
          user_id: quizDetails.meta.user_id,
          lesson_id: quizDetails.meta.lesson_id,
          questionIndex,
          selectedOption: key,
        }),
      });
    } catch (err) {
      console.error("OPTION ERROR:", err);
    }
  };

  const handleFinish = async (key) => {
    setChosen((prev) => ({
      ...prev,
      [questionIndex]: key,
    }));
    navigate(
      `/student-dashboard/quiz-result/${quizDetails.meta.quiz_id}/${lessonId}`
    );
  };

  return (
    <div
      className={`p-6 flex flex-col gap-7 ${
        lightTheme
          ? "bg-gradient-to-r from-cyan-200 via-cyan-300 to-cyan-200 "
          : "bg-[#001535] text-white"
      }`}
    >
      <div className="w-full flex justify-between items-center">
        <button
          onClick={() => {
            navigate(
              `/student-dashboard/lessons/${(
                quizLessonContent.domain ||
                quizDetails.payload.domain ||
                ""
              ).toLowerCase()}`,
              {
                replace: true,
              }
            );
          }}
          className={`flex gap-2 items-center ${
            lightTheme
              ? "text-gray-800 hover:text-blue-600"
              : "text-gray-300 hover:text-blue-300"
          }  w-fit`}
        >
          <ArrowLeftIcon /> Back to Dashboard
        </button>
        <button
          onClick={() => setLightTheme(!lightTheme)}
          className="flex items-center justify-center p-2 border-2 border-blue-700 rounded-xl"
        >
          <MoonStarIcon className="text-blue-700" />
        </button>
      </div>
      <div className="flex justify-between w-full gap-20">
        <div className="w-[70%]">
          <div className="flex flex-col justify-between gap-6 w-full">
            <div className="flex justify-between">
              <h4>{`Question ${
                quizProgressDetails.current_question_index + 1
              } of ${quizDetails.payload.total}`}</h4>
              <h4
                className={`${lightTheme ? "text-gray-600" : "text-gray-300"}`}
              >
                {completionPercent}%
              </h4>
            </div>
            <div className="w-full">
              <ProgressBarWrapper value={completionPercent} />
            </div>
          </div>
          <div className="flex gap-10 mt-5">
            <div className="flex flex-col w-full gap-6">
              <div className={`${lightTheme ? "bg-white" : "bg-gray-800"} p-5`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {quizDetails.payload.questions[questionIndex].question}
                </ReactMarkdown>
              </div>
              <div className="flex flex-col gap-3">
                {Object.entries(
                  quizDetails.payload.questions[questionIndex].options
                ).map(([key, val]) => {
                  return (
                    <button
                      key={key}
                      onClick={() => handleOptionClick(key)}
                      className={`rounded-lg text-start border ${buttonBase} ${
                        chosen?.[String(questionIndex)] === key
                          ? lightTheme
                            ? buttonLight
                            : buttonDark
                          : lightTheme
                          ? "bg-white text-black hover:bg-blue-100"
                          : "bg-gray-800 text-white hover:bg-blue-900"
                      }`}
                    >
                      <strong>{key}.</strong> {val}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between">
                <div className="w-[25%]">
                  {questionIndex !== 0 && (
                    <button
                      disabled={questionIndex === 0}
                      onClick={handleBackQuestion}
                      className={`${buttonBase} ${
                        lightTheme ? buttonLight : buttonDark
                      } flex gap-3 items-center font-bold`}
                    >
                      <ArrowLeft /> Back
                    </button>
                  )}
                </div>
                <div className="w-[25%]">
                  {questionIndex < quizDetails.payload.total - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className={`${buttonBase} ${
                        lightTheme ? buttonLight : buttonDark
                      } flex gap-3 items-center font-bold`}
                    >
                      Next <ArrowRight />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinish}
                      className={`${greenButtonBase} ${
                        lightTheme ? greenButtonLight : greenButtonDark
                      } flex gap-3 items-center font-bold`}
                    >
                      Finish Attempt <ArrowRight />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`w-[30%]`}>
          <div
            className={`flex flex-col ${
              lightTheme ? "bg-white" : "bg-gray-800"
            } p-5 gap-5`}
          >
            <h3 className="font-bold">Question Explorer</h3>
            <div className="grid grid-cols-3 gap-6">
              {quizDetails.payload.questions.map((val, index) => {
                return (
                  <button
                    onClick={() => questionNoNavigate(index)}
                    key={val.id}
                    value={val.id}
                    className={`border ${
                      lightTheme
                        ? "border-gray-700 hover:bg-gray-300"
                        : "border-gray-300 hover:bg-gray-900"
                    } ${
                      val.id - 1 in chosen
                        ? lightTheme
                          ? "bg-slate-300"
                          : "bg-gray-700"
                        : ""
                    } ${
                      questionIndex + 1 === val.id
                        ? "border-none ring-4 ring-blue-500"
                        : ""
                    } rounded-full text-xl w-16 h-16 transition-all duration-150`}
                  >
                    {val.id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizSection;
