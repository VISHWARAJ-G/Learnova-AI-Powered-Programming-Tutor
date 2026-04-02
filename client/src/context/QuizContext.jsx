import { createContext, useContext, useState } from "react";

const QuizContext = createContext(null);

export const useQuiz = () => useContext(QuizContext);

export const QuizProvider = ({ children }) => {
  const [currentQuizDetails, setCurrentQuizDetails] = useState(null);
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState(null);
  return (
    <QuizContext.Provider
      value={{
        currentQuizAnswers,
        setCurrentQuizAnswers,
        currentQuizDetails,
        setCurrentQuizDetails,
        selectedAnswers,
        setSelectedAnswers,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
