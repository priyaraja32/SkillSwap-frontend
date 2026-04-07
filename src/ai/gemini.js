import { GoogleGenAI } from "@google/genai";

// Initialize AI client
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

// ── aiMatchUsers — search based matching ──
export async function aiMatchUsers(search, users) {
  if (!search || !Array.isArray(users) || users.length === 0) {
    return [];
  }

  const normalizedSearch = search.toLowerCase().trim();

  const prompt = `
You are a PROFESSIONAL skill matching engine.

Search skill:
"${normalizedSearch}"

SCORING RULES:
1. Exact match in OFFERS → 80-100
2. Exact match in NEEDS → 40-70
3. Partial match → 20-40
4. No match → 0

IMPORTANT:
- Return EVERY user
- Output ONLY valid JSON
- userId MUST be string

Users:
${users
  .map(
    (u) => `
UserId: "${u.id}"
Offers: ${u.offers.join(", ")}
Needs: ${u.needs.join(", ")}
`
  )
  .join("\n")}

Output:
[
  { "userId": "string", "match": number }
]
`;

  try {
    const res = await ai.models.generateContent({
      //
      model: "gemini-2.0-flash", 
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
      },
    });

    const text = res?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed = [];
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = [];
    }

    return users.map((user) => {
      const aiResult = parsed.find(
        (p) => String(p.userId) === String(user.id)
      );

      let match = Number(aiResult?.match ?? 0);
      if (isNaN(match)) match = 0;

      match = Math.max(0, Math.min(100, match));

      // fallback logic
      if (
        match === 0 &&
        hasPartialLetterMatch(normalizedSearch, [
          ...user.offers,
          ...user.needs,
        ])
      ) {
        match = random(20, 40);
      }

      return {
        userId: user.id,
        match,
        reason: "",
      };
    });
  } catch (err) {
    console.error("AI Match Error:", err);
    return users.map((u) => ({
      userId: u.id,
      match: 0,
      reason: "",
    }));
  }
}

//aiPersonalizedMatch — personalized matching based on user's profile
export async function aiPersonalizedMatch(currentUser, otherUsers) {
  if (!currentUser || !Array.isArray(otherUsers) || otherUsers.length === 0) {
    return [];
  }

  const prompt = `
You are an AI matchmaker for a skill exchange platform.

Current user:
Offers: ${currentUser.offers?.join(", ") || "none"}
Needs: ${currentUser.needs?.join(", ") || "none"}
Availability: ${
    currentUser.availability
      ?.map((a) => `${a.day} ${a.startTime}-${a.endTime}`)
      .join(", ") || "flexible"
  }

Match based on:
1. Skill complement
2. Availability overlap
3. Similar domain

Users:
${otherUsers
  .map(
    (u) => `
UserId: "${u.id}"
Offers: ${u.offers?.join(", ") || "none"}
Needs: ${u.needs?.join(", ") || "none"}
Availability: ${
      u.availability
        ?.map((a) => `${a.day} ${a.startTime}-${a.endTime}`)
        .join(", ") || "flexible"
    }
`
  )
  .join("\n")}

Output JSON ONLY:
[{"userId": "id", "match": 85, "reason": "short reason"}]
`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    });

    const text = res?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed = [];
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = [];
    }

    return parsed.map((p) => ({
      userId: String(p.userId),
      match: Number(p.match) || 0,
      reason: p.reason || "",
    }));
  } catch (err) {
    console.error("AI Personalized Match Error:", err);
    return otherUsers.map((u) => ({
      userId: u.id,
      match: 0,
      reason: "",
    }));
  }
}

//getAISuggestions — generate AI-based reply suggestions for chat
export async function getAISuggestions(recentMessages, otherUserName) {
  if (!recentMessages || recentMessages.length === 0) return [];

  const context = recentMessages
    .map((m) => `${m.role === "me" ? "Me" : otherUserName}: ${m.text}`)
    .join("\n");

  const prompt = `
Suggest 3 short replies.

Conversation:
${context}

Rules:
- Max 10 words
- Friendly
- Output JSON array

["msg1", "msg2", "msg3"]
`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash", // ✅ FIXED
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });

    const text = res?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleaned = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI Suggestions Error:", err);
    return [];
  }
}

// ── helpers ──
function hasPartialLetterMatch(search, skills) {
  const letters = new Set(search.split(""));
  return skills.some((skill) => {
    const s = skill.toLowerCase();
    let count = 0;
    letters.forEach((l) => s.includes(l) && count++);
    return count >= 2;
  });
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}