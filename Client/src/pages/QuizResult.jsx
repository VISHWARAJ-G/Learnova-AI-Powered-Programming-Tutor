import { useAuth } from "@/context/AuthContext";
import { useLesson } from "@/context/LessonsContext";
import { useQuiz } from "@/context/QuizContext";
import { useTheme } from "@/context/ThemeContext";
import {
  CircleCheckBig,
  CircleDot,
  CircleX,
  CircleXIcon,
  Lightbulb,
  RotateCcw,
  SquareCheckBig,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { useNavigate, useParams } from "react-router-dom";

function QuizResult({ quizLessonContent }) {
  const {
    currentQuizDetails,
    setCurrentQuizDetails,
    currentQuizAnswers,
    setCurrentQuizAnswers,
    selectedAnswers,
    setSelectedAnswers,
  } = useQuiz();
  const {
    setLessonsWithStatus,
    lessonsWithStatus,
    domain,
    domainProgress,
    setDomainProgress,
  } = useLesson();
  const navigate = useNavigate();
  const { lightTheme } = useTheme();
  const { quizId, lessonId } = useParams();
  const finalLessonId = lessonId;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const correctCount = React.useMemo(() => {
    if (!currentQuizAnswers || !selectedAnswers) return 0;

    return Object.keys(currentQuizAnswers).reduce((count, index) => {
      return selectedAnswers[index] === currentQuizAnswers[index]
        ? count + 1
        : count;
    }, 0);
  }, [currentQuizAnswers, selectedAnswers]);
  const correctAnswersMap = React.useMemo(() => {
    if (!currentQuizAnswers || !selectedAnswers) return {};

    return Object.keys(currentQuizAnswers).reduce((acc, index) => {
      acc[index] = selectedAnswers[index] === currentQuizAnswers[index];
      return acc;
    }, {});
  }, [currentQuizAnswers, selectedAnswers]);
  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const quizDataResponse = await fetch(
          "http://localhost:5000/api/quiz/quiz-details",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quiz_id: quizId, user_id: user.id }),
          }
        );
        const quizData = await quizDataResponse.json();

        setCurrentQuizDetails(quizData.quizDetails.payload);
        setSelectedAnswers(quizData.quizSelectedAnswers.selected_answers);
        setCurrentQuizAnswers(
          quizData.quizDetails.payload.questions.reduce((acc, q, index) => {
            acc[index] = q.correct_answer;
            return acc;
          }, {})
        );
      } catch (err) {
        console.log("ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetails();
  }, [quizId, user.id]);
  useEffect(() => {
    if (loading || !currentQuizDetails || !finalLessonId) return;

    const updateQuizDetails = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/quizCount/updateFinal",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quiz_id: quizId,
              user_id: user.id,
              correctCount,
              lesson_id: finalLessonId,
            }),
          }
        );

        const result = await res.json();
        console.log("Final quiz update:", result);
        console.log("FINISH", currentQuizDetails);

        const domainProgressObj = result.lessonProgress.reduce((acc, item) => {
          acc[item.domain] = item.progress_percentage ?? 0;
          return acc;
        }, {});
        console.log("HELLO",domainProgressObj);
        setDomainProgress(domainProgressObj);

        setLessonsWithStatus((prev) =>
          prev.map((lesson) =>
            lesson.id === finalLessonId
              ? { ...lesson, status: "Completed" }
              : lesson
          )
        );
      } catch (err) {
        console.error("Final quiz update failed:", err);
      }
    };

    updateQuizDetails();
  }, [loading, correctCount, quizId, user.id, finalLessonId]);
  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <RotatingLines strokeColor="#0284C7" width="40" height="40" />
      </div>
    );
  }
  const greenButtonLight =
    "text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:ring-green-300 shadow-lg shadow-green-500/50 font-medium rounded-xl text-sm px-4 py-2.5 text-center leading-5";
  const greenButtonDark =
    "text-green-200 bg-green-950 border border-green-700 hover:bg-green-900 focus:ring-4 focus:ring-green-800 shadow-lg shadow-green-800/80 font-medium rounded-xl text-sm px-4 py-2.5 text-center leading-5";
  const redButtonLight =
    "text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:ring-red-300 shadow-lg shadow-red-500/50 font-medium rounded-xl text-sm px-4 py-2.5 text-center leading-5";
  const redButtonDark =
    "text-red-200 bg-red-950 border border-red-700 hover:bg-red-900 focus:ring-4 focus:ring-red-800 shadow-lg shadow-red-800/80 font-medium rounded-xl text-sm px-4 py-2.5 text-center leading-5";

  const totalQuestions = currentQuizDetails.questions.length;
  console.log(lessonsWithStatus);
  const handleRetryQuiz = async () => {
    await fetch("http://localhost:5000/api/quiz/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        quiz_id: quizId,
        lesson_id: lessonId,
      }),
    });
    navigate(`/student-dashboard/quiz/${lessonId}`, { replace: true });
  };
  console.log("DOMAIN PROGRESS", domainProgress);
  console.log("DOMAIN", domain);
  return (
    <main className="px-7 py-24 w-full flex flex-col items-center justify-center gap-5">
      <div className="w-3/4 flex flex-col gap-8 items-center justify-center">
        <h1
          className={`text-4xl font-bold ${
            lightTheme ? "text-black" : "text-white"
          }`}
        >
          Quiz Review
        </h1>
        <div className="flex justify-between w-full">
          <div
            className={`${
              lightTheme ? "bg-white text-black" : "bg-gray-800 text-white"
            } px-4 py-2 rounded-2xl flex items-center gap-3`}
          >
            <CircleDot
              size={36}
              className={`${
                correctCount >= 5
                  ? `${lightTheme ? "text-green-900" : "text-green-500"}`
                  : `${lightTheme ? "text-red-900" : "text-red-500"}`
              }`}
            />{" "}
            <span className="font-bold text-xl">
              Score: {(correctCount / totalQuestions) * 100}%
            </span>
          </div>
          <div
            className={`${
              lightTheme ? "bg-white text-black" : "bg-gray-800 text-white"
            } px-4 py-2 rounded-2xl flex items-center gap-3`}
          >
            <SquareCheckBig
              size={36}
              className={`${
                correctCount >= 5
                  ? `${lightTheme ? "text-green-900" : "text-green-500"}`
                  : `${lightTheme ? "text-red-900" : "text-red-500"}`
              }`}
            />
            <span className="font-bold text-xl">
              {correctCount}/{totalQuestions} Correct
            </span>
          </div>
          <div
            className={`${
              lightTheme ? "bg-white text-black" : "bg-gray-800 text-white"
            } px-4 py-2 rounded-2xl flex items-center gap-3`}
          >
            {correctCount >= 5 ? (
              <CircleCheckBig
                size={36}
                className={`${
                  lightTheme ? "text-green-900" : "text-green-500"
                }`}
              />
            ) : (
              <CircleXIcon
                size={36}
                className={`${lightTheme ? "text-red-900" : "text-red-500"}`}
              />
            )}
            <span className="font-bold text-xl">
              {correctCount >= 5 ? "Pass" : "Fail"}
            </span>
          </div>
          <button
            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/60 hover:scale-[1.03] active:scale-[0.97]  transition-all duration-200"
            onClick={handleRetryQuiz}
          >
            <RotateCcw
              size={18}
              className="transition-transform duration-300 group-hover:-rotate-180"
            />
            Retry Attempt
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-10 w-3/4">
        {currentQuizDetails.questions.map((obj, index) => {
          const correctAnswer = correctAnswersMap[index] === true;
          return (
            <div
              key={obj.id ?? index}
              className={`relative rounded-lg overflow-hidden p-5 flex flex-col gap-8 ${
                lightTheme ? "bg-white text-black" : "bg-gray-800 text-white"
              } before:absolute before:left-0 before:top-0 before:h-full before:w-2 ${
                correctAnswer
                  ? "before:bg-gradient-to-b before:from-green-400 before:via-green-500 before:to-green-600"
                  : "before:bg-gradient-to-b before:from-red-400 before:via-red-500 before:to-red-600"
              }`}
            >
              <div className="flex w-full justify-between items-center gap-8">
                <div>
                  <h5 className="text-sm font-bold">{`${obj.id}. ${obj.question}`}</h5>
                </div>
                <div
                  className={`${
                    correctAnswer
                      ? lightTheme
                        ? greenButtonLight
                        : greenButtonDark
                      : lightTheme
                      ? redButtonLight
                      : redButtonDark
                  }`}
                >
                  {correctAnswer ? "Correct" : "Incorrect"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`${
                    correctAnswer
                      ? lightTheme
                        ? greenButtonLight
                        : greenButtonDark
                      : lightTheme
                      ? redButtonLight
                      : redButtonDark
                  } flex gap-6`}
                >
                  <div className="flex-shrink-0">
                    {correctAnswer ? (
                      <CircleCheckBig size={28} />
                    ) : (
                      <CircleX size={28} />
                    )}
                  </div>
                  <div className="flex flex-col items-start justify-start text-left">
                    <h1 className="font-semibold">Your Answer</h1>
                    <h1 className="text-sm leading-relaxed">
                      {`${
                        selectedAnswers[index] !== undefined
                          ? `${`${selectedAnswers[index]}. ${
                              currentQuizDetails.questions[index].options[
                                selectedAnswers[index]
                              ]
                            }`}`
                          : "NOT SELECTED"
                      }`}
                    </h1>
                  </div>
                </div>

                <div>
                  <div
                    className={`${
                      lightTheme ? greenButtonLight : greenButtonDark
                    } flex gap-6`}
                  >
                    <div className="flex-shrink-0">
                      <CircleCheckBig size={28} />
                    </div>
                    <div className="flex flex-col items-start justify-start text-left">
                      <h1 className="font-semibold">Correct Answer</h1>
                      <h1 className="text-sm leading-relaxed">
                        {`${currentQuizAnswers[index]}. ${
                          currentQuizDetails.questions[index].options[
                            currentQuizAnswers[index]
                          ]
                        }`}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full border-2 border-blue-900 flex gap-5 p-5 rounded-2xl">
                <div className="flex items-center justify-center">
                  <Lightbulb size={28} className="text-blue-900" />{" "}
                </div>
                {obj.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default QuizResult;
