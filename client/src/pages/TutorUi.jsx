import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useTutor } from "@/context/TutorContext";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ArrowUp, PauseCircle } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function TutorUi() {
  const { lightTheme } = useTheme();
  const modelBubbleStyle = lightTheme
    ? "bg-blue-200 text-black"
    : "bg-gray-700 text-gray-100";

  const userBubbleStyle = "bg-blue-600 text-white";

  const ChatMessage = React.memo(
    ({ message, userDetails, lightTheme, activeLight, activeDark }) => {
      const isModel = message.sender === "model";

      return (
        <div
          className={`flex gap-3 px-5 py-3 ${
            !isModel ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div className="flex items-end">
            <div
              className={`rounded-full bg-blue-900/80 p-2 flex items-center justify-center ${
                lightTheme ? activeLight : activeDark
              }`}
            >
              {isModel ? (
                <img
                  src="/Learnova-Logo-Dark.png"
                  alt="Learnova"
                  className="w-7 h-7"
                />
              ) : (
                <Avatar className="flex items-center justify-center shadow-sm">
                  <AvatarImage
                    src={`/avatars/avatar${userDetails?.avatar_number}.png`}
                    alt={userDetails?.full_name || "?"}
                    className="object-cover h-7 w-7"
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="text-white h-7 w-7 flex items-center justify-center text-xl font-semibold p-2 rounded-full">
                    {userDetails?.full_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          <div
            className={`${
              isModel ? modelBubbleStyle : userBubbleStyle
            } p-3 max-w-[50%] rounded-2xl break-words whitespace-pre-wrap`}
          >
            {isModel ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ul: ({ children }) => (
                    <ul className="list-disc ml-5 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-5 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match?.[1] || "javascript"}
                        PreTag="div"
                        className="rounded-lg p-3"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className={`${
                          lightTheme
                            ? "bg-gray-300 text-black"
                            : "bg-gray-800 text-gray-200"
                        } px-1 rounded`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.message}
              </ReactMarkdown>
            ) : (
              message.message
            )}
          </div>
        </div>
      );
    }
  );
  const activeLight =
    "text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600";
  const learnovaLight =
    "text-white bg-gradient-to-r from-cyan-100 via-cyan-200 to-cyan-100";
  const activeDark =
    "text-cyan-200 bg-cyan-950 border border-cyan-700 shadow-lg shadow-cyan-900/80";

  const { user } = useAuth();
  const userDetails = user.profile || {};

  const [isTyping, setIsTyping] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [streamingText, setStreamingText] = useState("");

  const { chatMessages, setChatMessages } = useTutor();

  const TypingAnimation = () => (
    <div className="flex gap-1 items-center">
      <span className="h-2 w-2 mt-1 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="h-2 w-2 mt-1 bg-gray-400 rounded-full animate-bounce delay-150"></span>
      <span className="h-2 w-2 mt-1 bg-gray-400 rounded-full animate-bounce delay-300"></span>
    </div>
  );

  function extractTextFromRaw(raw) {
    try {
      if (!raw) return "";
      if (raw?.candidates?.[0]?.content?.[0]?.text)
        return raw.candidates[0].content[0].text;
      if (raw?.candidates?.[0]?.content?.parts?.[0]?.text)
        return raw.candidates[0].content.parts[0].text;
      if (raw?.output?.[0]?.content?.[0]?.text)
        return raw.output[0].content[0].text;
      if (raw?.text) return raw.text;
      return JSON.stringify(raw);
    } catch (e) {
      return "";
    }
  }

  useEffect(() => {
    if (!user || !user.id) return;

    async function loadChat() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/tutor/load-history",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          }
        );

        const data = await response.json();
        if (data.success) {
          setChatMessages(data.messages);
        }
      } catch (error) {
        console.error("Failed to load chat", error);
      }
    }

    loadChat();
  }, [user]);

  const handleUserPrompt = async (e) => {
    e.preventDefault();

    if (isTyping || streamingText) return;

    if (!prompt.trim()) return;

    const userPrompt = prompt;

    setChatMessages((prevMsg) => [
      ...prevMsg,
      { id: crypto.randomUUID(), sender: "user", message: userPrompt },
    ]);
    setPrompt("");
    setIsTyping(true);

    const updatedHistory = [
      ...chatMessages,
      { sender: "user", message: userPrompt },
    ].slice(-10);

    try {
      await fetch("http://localhost:5000/api/tutor/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          sender: "user",
          message: userPrompt,
        }),
      });

      const response = await fetch("http://localhost:5000/api/tutor/teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userPrompt,
          history: updatedHistory,
        }),
      });
      const data = await response.json();

      const aiFullText =
        data?.reply?.trim() ||
        extractTextFromRaw(data?.raw)?.trim() ||
        "I couldn't understand that. Can you rephrase?";

      setIsTyping(false);

      if (!aiFullText) return;

      await fetch("http://localhost:5000/api/tutor/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          sender: "model",
          message: aiFullText,
        }),
      });

      let words = aiFullText.split(" ");
      let i = 0;
      setStreamingText("");

      const interval = setInterval(() => {
        setStreamingText(words.slice(0, i + 1).join(" "));
        i++;

        if (i >= words.length) {
          clearInterval(interval);
          setChatMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), sender: "model", message: aiFullText },
          ]);
          setStreamingText("");
        }
      }, 60);
    } catch (err) {
      setIsTyping(false);
      setStreamingText("");
      setChatMessages((prevMsg) => [
        ...prevMsg,
        {
          id: crypto.randomUUID(),
          sender: "model",
          message: "Sorry, something went wrong.",
        },
      ]);
      console.error(err);
    }
  };

  return (
    <section className="my-20 flex mx-5">
      <div
        className={`relative w-full flex flex-col h-[calc(100vh-7rem)] ${
          lightTheme ? "bg-white text-black" : "bg-gray-800 text-white"
        } ${chatMessages.length > 0 ? "" : "justify-center items-center"}`}
      >
        <div
          className={`flex flex-col px-5 py-3 pb-24 ${
            chatMessages.length > 0
              ? "overflow-y-auto"
              : "items-center justify-center"
          }`}
        >
          {chatMessages.length > 0 ? (
            chatMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                userDetails={userDetails}
                lightTheme={lightTheme}
                activeLight={activeLight}
                activeDark={activeDark}
              />
            ))
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <div className=" flex items-center justify-center">
                <div
                  className={`${
                    lightTheme ? learnovaLight : activeDark
                  } rounded-full p-2`}
                >
                  <img
                    src={
                      lightTheme
                        ? "/Learnova-Logo.png"
                        : "/Learnova-Logo-Dark.png"
                    }
                    alt="Learnova"
                    className="h-12 w-12"
                  />
                </div>
              </div>
              <div className="text-3xl font-bold">
                Welcome to{" "}
                <span
                  className={`${
                    lightTheme
                      ? "bg-gradient-to-r from-cyan-700 via-cyan-800 to-cyan-700 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-300 bg-clip-text text-transparent"
                  }`}
                >
                  Learnova AI Tutor
                </span>
              </div>
              <div
                className={`text-sm text-center w-[75%] ${
                  lightTheme ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Your Personal AI Tutor. Ask Me Anything about Computer Networks,
                Operating Systems, Programming Languages, Data Structures and
                Algorithms, Database Management Systems, Software Engineering,
                Web Development and System Design
              </div>
            </div>
          )}

          {isTyping && (
            <div className="flex gap-3 px-5 py-3">
              <div className="flex items-end">
                <div
                  className={`rounded-full p-2 ${
                    lightTheme ? activeLight : activeDark
                  }`}
                >
                  <img
                    src="/Learnova-Logo-Dark.png"
                    className="w-7 h-7"
                    alt="Logo"
                  />
                </div>
              </div>
              <div
                className={`${modelBubbleStyle} p-3 max-w-[50%] rounded-2xl`}
              >
                <TypingAnimation />
              </div>
            </div>
          )}

          {streamingText && (
            <div className="flex gap-3 px-5 py-3">
              <div className="flex items-end">
                <div
                  className={`rounded-full p-2 ${
                    lightTheme ? activeLight : activeDark
                  }`}
                >
                  <img
                    src="/Learnova-Logo-Dark.png"
                    className="w-7 h-7"
                    alt="Logo"
                  />
                </div>
              </div>
              <div
                className={`
                  ${modelBubbleStyle}
                 p-3 max-w-[50%] rounded-2xl`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingText}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleUserPrompt}
          className={`absolute bottom-0 left-0 w-full flex items-center gap-3 p-3 ${
            lightTheme ? "bg-gray-100" : "bg-gray-900"
          }`}
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            disabled={isTyping || streamingText}
            placeholder={
              isTyping || streamingText
                ? "Learnova is replying..."
                : "Ask something..."
            }
            className={`flex-1 rounded-full p-4 outline-none ${
              lightTheme ? "bg-gray-400" : "bg-gray-800 text-white"
            } ${
              isTyping || streamingText ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />

          {!isTyping && !streamingText ? (
            <button
              type="submit"
              className={`p-3 rounded-full ${
                lightTheme ? activeLight : activeDark
              }`}
            >
              <ArrowUp />
            </button>
          ) : (
            <div className="p-3 bg-gray-400 rounded-full animate-pulse">
              <PauseCircle />
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default TutorUi;
