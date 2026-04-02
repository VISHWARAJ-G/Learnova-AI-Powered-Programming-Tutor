import { supabaseAdmin } from "../supabase.js";
import aiService from "../services/gemini.service.js";

export const fetchResource = async (req, res) => {
  try {
    const { lessonId, lessonTitle, domain, description } = req.body;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "lessonId is required",
      });
    }

    const { data: resourceData, error: resourceError } = await supabaseAdmin
      .from("lesson_resources")
      .select("*")
      .eq("lesson_id", lessonId);

    if (resourceError) throw resourceError;

    if (resourceData?.length > 0) {
      return res.json({
        success: true,
        source: "db",
        resources: resourceData,
      });
    }

    const aiPrompt = `You are Learnova’s Resource Recommendation Engine.

Given a lesson title, domain, and description:
generate 5 REAL, TRUSTED, LEARNING RESOURCES.

STRICT RULES:
- OUTPUT = JSON ARRAY ONLY
- No markdown, no code fences, no explanation
- Each item format:
  {
    "title": "",
    "url": "",
    "type": "article" | "video" | "practice" | "documentation"
  }
- You should check all the resources before giving and check whether they are live or not. (THIS IS THE MOST IMPORTANT STEP.. AVOID GIVING NON-EXISTING OR DELETED CONTENT..)
- Since this is for students, check whether each url has content in it and make sure everything is working or not
- Use ONLY well-known, stable URLs from the allowed domains.
- NEVER generate random or made-up URLs.
- NEVER output shortened links.
- Use ONLY homepage-level or topic-level URLs that always remain live.
- Prefer general reference pages over specific deep links.

Examples of safe URLs:
- https://www.geeksforgeeks.org/binary-search/
- https://leetcode.com/problems/two-sum/
- https://developer.mozilla.org/en-US/docs/Web/JavaScript
- https://www.youtube.com/c/freecodecamp


ALLOWED DOMAINS:
- GeeksforGeeks
- HackerRank / LeetCode
- YouTube (RECOMMEND EDUCATIONAL CHANNELS ALONE RELATED TO DOMAIN. THE EXACT VIDEO LINK VIDEO IS NOT REQUIRED)
- MDN / W3Schools
- TutorialsPoint
- Official Docs

Do NOT invent URLs.

Input:
Lesson: ${lessonTitle}
Domain: ${domain}
Description: ${description}

Output: JSON array ONLY.
`;

    const aiResponse = await aiService.generate({
      messages: [{ role: "user", content: aiPrompt }],
      config: { temperature: 0.1, maxOutputTokens: 3000 },
    });

    let rawText =
      aiResponse.raw?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    rawText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    if (!rawText) {
      return res.status(500).json({
        success: false,
        message: "AI returned empty text",
        raw: aiResponse.raw,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);

      if (parsed.resources) parsed = parsed.resources;
      if (!Array.isArray(parsed)) parsed = [parsed];
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
        raw: aiResponse.text,
      });
    }

    const allowedTypes = ["article", "video", "practice", "documentation"];

    const cleanRows = parsed
      .filter((item) => item.url && item.title)
      .map((item) => ({
        lesson_id: lessonId,
        title: item.title.trim(),
        url: item.url.trim(),
        type: allowedTypes.includes(item.type) ? item.type : "article",
      }));

    if (cleanRows.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI returned empty or invalid resources",
        raw: aiResponse.text,
      });
    }

    const { error: insertError } = await supabaseAdmin
      .from("lesson_resources")
      .insert(cleanRows);

    if (insertError) throw insertError;

    return res.json({
      success: true,
      source: "ai",
      resources: cleanRows,
    });
  } catch (err) {
    console.error("❌ Resource Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lesson resources",
    });
  }
};
