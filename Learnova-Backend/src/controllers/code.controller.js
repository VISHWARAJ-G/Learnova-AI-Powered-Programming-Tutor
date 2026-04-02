import aiService from "../services/gemini.service.js";

export async function debugCode(req, res) {
  try {
    const { code, language = "c" } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required for debugging",
      });
    }

    const prompt = `You are Learnova’s ${language} language Code Debugger.

Given the student’s code below:
    \`\`\`${language}
    ${code}
    \`\`\`

Task:
- Identify syntax errors
- Identify logical mistakes
- Explain why each issue happens
- Suggest fix steps
- DO NOT rewrite entire code unless necessary
- Keep explanations medium difficulty
`;

    const ai = await aiService.generate({
      prompt,
      config: { temperature: 0.1, maxOutputTokens: 10000 },
    });

    res.json({
      success: true,
      debug: ai.text,
    });
  } catch (err) {
    console.error("❌ Debug Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to debug code",
    });
  }
}

export async function explainCode(req, res) {
  try {
    const { code, language = "c" } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required for explanation",
      });
    }

    const prompt = `You are Learnova’s ${language} language Code Explanation Tutor.

Please explain the following code:
    \`\`\`${language}
    ${code}
    \`\`\`

Instructions:
- line-by-line
- using simple language
- with clarity and structure
- with small bullet points
- with a final summary
`;

    const ai = await aiService.generate({
      prompt,
      config: { temperature: 0.1, maxOutputTokens: 10000 },
    });

    res.json({
      success: true,
      explanation: ai.text,
    });
  } catch (err) {
    console.error("❌ Explain Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to explain code",
    });
  }
}

export async function generateCode(req, res) {
  try {
    const { lessonTitle, domain = "Programming" } = req.body;

    const prompt = `You are Learnova’s Interview Coding Task Creator.

    Context: The student has just finished a lesson on "${lessonTitle}" in the domain of "${domain}".

Generate ONE ORIGINAL coding problem that:
- is directly based on the concepts of "${lessonTitle}"
- matches the difficulty and style of LeetCode Easy/Medium
- focuses on the same patterns companies test:
  arrays, strings, hashing, pointers, loops, numbers, recursion, simple data structures
- is concise (2–4 lines)
- not copied from any platform
- must prepare the learner for product-based company interviews (Google, Amazon, Microsoft, etc.)
- must be solvable in 15–20 minutes
- no solution included

Output: Only the problem statement.
`;

    const ai = await aiService.generate({
      prompt,
      config: { temperature: 0.2, maxOutputTokens: 10000 },
    });

    res.json({
      success: true,
      question: ai.text,
    });
  } catch (err) {
    console.error("❌ Code Task Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate code task",
    });
  }
}

export default {
  debugCode,
  explainCode,
  generateCode,
};
