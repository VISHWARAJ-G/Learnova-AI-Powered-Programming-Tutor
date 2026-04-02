import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not set.");
}

const LEARNOVA_DOMAINS = [
  "Computer Networks",
  "Operating Systems",
  "Database Management Systems",
  "Data Structures and Algorithms",
  "Programming Languages",
  "Software Engineering",
  "Web Development",
  "System Design",
];

function isNonCSQuery(message) {
  return /(history|geography|politics|biology|chemistry|physics|math|art|music|sports|economics|philosophy|literature|war|civilization)/i.test(
    message
  );
}

const attemptStore = new Map();

function getAttemptKey(userId, lessonId) {
  return `${userId}_${lessonId}`;
}

function incrementAttempt(userId, lessonId) {
  const key = getAttemptKey(userId, lessonId);
  const current = attemptStore.get(key) || 0;
  const updated = current + 1;
  attemptStore.set(key, updated);
  return updated;
}

function adjustStrategyByAttempts(strategy, attemptCount) {
  if (attemptCount === 1) return strategy;

  if (attemptCount === 2) return "SOCRATIC_HINTS";

  if (attemptCount >= 3) return "FEEDBACK_MODE";

  return strategy;
}

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

function detectIntent(message) {
  const msg = message.toLowerCase();

  if (/(solution|full answer|entire code|direct answer)/.test(msg))
    return "ASK_FOR_ANSWER";

  if (/(hint|clue|help me think|guide me)/.test(msg)) return "ASK_FOR_HINT";

  if (/(what is|explain|define|meaning|concept of)/.test(msg))
    return "EXPLAIN_CONCEPT";

  if (/(is this correct|am i right|check my answer)/.test(msg))
    return "CONFIRM_UNDERSTANDING";

  return "UNKNOWN";
}

function selectPedagogicalStrategy(intent) {
  switch (intent) {
    case "ASK_FOR_ANSWER":
      return "REFUSE_DIRECT_ANSWER";

    case "ASK_FOR_HINT":
      return "SOCRATIC_HINTS";

    case "EXPLAIN_CONCEPT":
      return "STRUCTURED_EXPLANATION";

    case "CONFIRM_UNDERSTANDING":
      return "FEEDBACK_MODE";

    default:
      return "SAFE_REDIRECT";
  }
}

function buildSystemInstruction(strategy, lessonContext = "") {
  const base = `You are Learnova, a pedagogically guided AI tutor.
Current Lesson Context:
${lessonContext}

GLOBAL RULES:
- Use 3–6 bullet points only
- Simple English
- No fluff
- Friendly tutor tone
`;

  const strategies = {
    STRUCTURED_EXPLANATION: `
Explain the concept step-by-step.
- Start from basics
- Use one simple example
- Avoid advanced or future topics
`,

    SOCRATIC_HINTS: `
Do NOT give the direct answer.
- Ask guiding questions
- Provide hints only
- Encourage learner thinking
`,

    REFUSE_DIRECT_ANSWER: `
Politely refuse to give the direct answer.
- Explain why giving answers is not helpful
- Offer hints instead
`,

    FEEDBACK_MODE: `
Evaluate the learner's understanding.
- Say whether the idea is correct or not
- Give corrective guidance if needed
`,

    SAFE_REDIRECT: `
If the question is NOT related to Computer Science:
- Politely refuse
- Say Learnova focuses only on core CS subjects
- Suggest one relevant CS topic to start with
`,
  };

  return base + strategies[strategy];
}

const lessonMetadata = {
  recursion: {
    objectives: [
      "Understand what recursion is",
      "Identify base case",
      "Understand recursive calls",
    ],
    allowed: [
      "Base case",
      "Recursive function call",
      "Simple call stack explanation",
    ],
    forbidden: [
      "Dynamic programming",
      "Tail recursion optimization",
      "Advanced recursion patterns",
    ],
  },

  arrays: {
    objectives: ["Understand arrays", "Access elements", "Traverse arrays"],
    allowed: ["Indexing", "Traversal", "Basic operations"],
    forbidden: ["Advanced algorithms", "Complex data structures"],
  },
};

function getLessonContext(lessonId) {
  const lesson = lessonMetadata[lessonId];

  if (!lesson) {
    return `
Allowed Topics:
- Basic concepts only

Forbidden:
- Advanced or unrelated topics
`;
  }

  return `
Lesson Objectives:
${lesson.objectives.map((o) => `- ${o}`).join("\n")}

Allowed Topics:
${lesson.allowed.map((a) => `- ${a}`).join("\n")}

Forbidden Topics:
${lesson.forbidden.map((f) => `- ${f}`).join("\n")}
`;
}

const TUTOR_MODE = {
  GENERAL: "GENERAL",
  LESSON: "LESSON",
};

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const DEFAULT_MODEL = "gemini-flash-latest";

const TIMEOUT_MS = 60_000;

async function geminiRequest(model = DEFAULT_MODEL, body = {}, retries = 3) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

  const cleanModel = model.trim();

  const url = `${BASE_URL}/${encodeURIComponent(
    cleanModel
  )}:generateContent?key=${GEMINI_API_KEY}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(id);

      if (res.ok) {
        return await res.json();
      }

      if (res.status === 429) {
        console.warn(`⚠️ Quota Hit. Retrying in 5s... (${attempt}/${retries})`);
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      if (res.status === 404) {
        throw new Error(
          `Model '${cleanModel}' not found. Make sure BASE_URL is 'v1beta'.`
        );
      }

      const text = await res.text().catch(() => "");
      throw new Error(
        `Gemini API Error: ${res.status} ${res.statusText} - ${text}`
      );
    } catch (err) {
      clearTimeout(id);
      if (attempt === retries || err.message.includes("404")) throw err;
      console.warn(`⚠️ Retrying... (${attempt}/${retries})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

export async function generate({
  messages,
  model = DEFAULT_MODEL,
  config = {},
}) {
  const systemMessage = messages.find((m) => m.role === "system");
  const conversation = messages.filter((m) => m.role !== "system");

  const body = {
    contents: conversation.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    systemInstruction: systemMessage
      ? { parts: [{ text: systemMessage.content }] }
      : undefined,
    generationConfig: {
      temperature: config.temperature ?? 0.1,
      maxOutputTokens: config.maxOutputTokens ?? 4000,
      responseMimeType: config.responseMimeType ?? "text/plain",
    },
  };

  const raw = await geminiRequest(model, body);
  const text = extractTextFromRaw(raw);
  return { text, raw };
}

export async function teach({
  history = [],
  message,
  userId = "anonymous",
  lessonId = null,
}) {
  if (!lessonId && isNonCSQuery(message)) {
    return {
      text: `I’m designed to help only with Computer Science subjects like CN, OS, DBMS, DSA, and Programming Languages.

What would you like to learn in CS?`,
    };
  }

  const tutorMode = lessonId ? TUTOR_MODE.LESSON : TUTOR_MODE.GENERAL;

  const attemptCount =
    tutorMode === TUTOR_MODE.LESSON ? incrementAttempt(userId, lessonId) : 1;

  const intent = detectIntent(message);
  const baseStrategy = selectPedagogicalStrategy(intent);

  const finalStrategy =
    tutorMode === TUTOR_MODE.LESSON
      ? adjustStrategyByAttempts(baseStrategy, attemptCount)
      : "STRUCTURED_EXPLANATION";

  const lessonContext =
    tutorMode === TUTOR_MODE.LESSON
      ? getLessonContext(lessonId)
      : `Learnova General Tutor Mode:
You are a STRICTLY COMPUTER SCIENCE tutor.

Allowed Domains:
- Computer Networks
- Operating Systems
- Database Management Systems
- Data Structures and Algorithms
- Programming Languages
- Software Engineering
- Web Technologies

Rules:
- DO NOT answer questions outside computer science
- If user asks about non-technical subjects (history, science, arts, politics, etc):
  - Politely refuse
  - Explain Learnova focuses on core CS subjects
  - Offer relevant CS topics instead
`;

  const systemInstruction = buildSystemInstruction(
    finalStrategy,
    lessonContext
  );

  const formattedHistory = history.map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    content: msg.message,
  }));

  const messages = [
    { role: "system", content: systemInstruction },
    ...formattedHistory.slice(-10),
    { role: "user", content: message },
  ];

  return await generate({ messages });
}

export async function generateQuizOrCode({ domain, lessonTitle, description }) {
  try {
    const prompt = `You are Learnova’s Task Decision & Task Generation AI.

You will analyze:
- Domain: ${domain}
- Lesson Title: ${lessonTitle}
- Lesson Description: ${description}

Your responsibilities:

1. **Analyze the topic & decide task type**:
   - Choose "MCQ" for theory, conceptual, syntax, definitions, rules.
   - Choose "CODE" for problem-solving, algorithms, data structures, loops, arrays, recursion, strings, functions, etc.

2. **If task_type = "MCQ":**
   Generate exactly **10 professional MCQs**, with difficulty distribution:
     - 4 Easy
     - 3 Medium
     - 3 Hard

   All questions must be:
     - Strictly aligned to the given domain & lesson
     - Precise, professional, unambiguous
     - 4 options (A, B, C, D)
     - Include correct answer + explanation

   Output Format:
   {
     "task_type": "MCQ",
     "total": 10,
     "lesson": "${lessonTitle}",
     "domain": "${domain}",
     "questions": [
       {
         "id": 1,
         "difficulty": "easy",
         "question": "",
         "options": { "A": "", "B": "", "C": "", "D": "" },
         "correct_answer": "",
         "explanation": ""
       }
     ]
   }

3. **If task_type = "CODE":**
   Generate **one coding problem** similar to Easy–Medium questions.
   
   Output Format:
   {
     "task_type": "CODE",
     "lesson": "${lessonTitle}",
     "domain": "${domain}",
     "problem": {
       "title": "",
       "problem_statement": "",
       "input_format": "",
       "output_format": "",
       "constraints": "",
       "sample_test_cases": [
         { "input": "", "output": "" }
       ],
       "explanation": "",
       "recommended_approach": "",
       "hidden_test_cases_count": 5
     }
   }

IMPORTANT — OUTPUT FORMAT (STRICT JSON MODE):
You MUST return ONLY valid JSON.
`;

    const { text } = await generate({
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: "Generate task according to the instructions.",
        },
      ],
      model: DEFAULT_MODEL,
      config: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(text);
  } catch (error) {
    console.error("❌ Task Generation Error:", error);
    throw new Error("Failed to generate task");
  }
}

export default {
  generate,
  teach,
  generateQuizOrCode,
};
