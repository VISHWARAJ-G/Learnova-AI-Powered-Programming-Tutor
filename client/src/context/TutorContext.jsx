import { createContext, useContext, useState } from "react";

export const TutorContext = createContext();

export const useTutor = () => useContext(TutorContext);

export const TutorProvider = ({ children }) => {
  const [lessonContent, setLessonContent] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [domain, setDomain] = useState("");
  const [resources, setResources] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  return (
    <TutorContext.Provider
      value={{
        lessonContent,
        lessonTitle,
        lessonId,
        domain,
        resources,
        chatMessages,
        setLessonContent,
        setLessonTitle,
        setLessonId,
        setDomain,
        setResources,
        setChatMessages,
      }}
    >
      {children}
    </TutorContext.Provider>
  );
};
