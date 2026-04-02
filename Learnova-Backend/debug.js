// debug-gemini.js
import dotenv from "dotenv";
dotenv.config();

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log("🔍 Testing Gemini Connection...");
console.log(`🔑 Key ends with: ...${key.slice(-4)}`);

async function check() {
  // 1. Check Available Models
  console.log("\n📋 Fetching available models...");
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    console.error("❌ CRITICAL ERROR:");
    console.error(JSON.stringify(data, null, 2)); // THIS will show the real reason
    return;
  }

  const models = data.models.map(m => m.name.replace("models/", ""));
  console.log("✅ API is Working! Available Models:");
  console.log(models.filter(m => m.includes("flash"))); // Show only flash models

  // 2. Try a generation with a specific safe model
  const safeModel = "gemini-1.5-flash-001"; // Specific version
  console.log(`\n🧪 Testing generation with: ${safeModel}...`);
  
  const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent?key=${key}`;
  const genRes = await fetch(genUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
  });
  
  const genData = await genRes.json();
  if (genRes.ok) {
    console.log("🎉 SUCCESS! Response:", genData.candidates[0].content.parts[0].text);
  } else {
    console.error("❌ GENERATION FAILED:");
    console.error(JSON.stringify(genData, null, 2));
  }
}

check();