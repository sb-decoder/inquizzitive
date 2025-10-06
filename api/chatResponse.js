// api/chatResponse.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { question, context } = req.body || {};
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Missing required field: question" });
    }

    const apiKey = process.env.GEMINI_API_KEY || null;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in server environment" });
    }
    // Detect if user asked for suggested questions like "suggest 10"
    const suggestMatch = question.match(/suggest\s+(\d+)/i) || question.match(/\bsuggest\b.*?(\d+)/i);

    let prompt;
    let responseType = "mentor";

    if (suggestMatch) {
      const count = parseInt(suggestMatch[1], 10) || 10;
      // Check whether the original question already mentions level/topics
      const hasLevelOrTopic = /level|topic|topics|school|college|competitive|primary|high school|secondary|upsc|ssc|bank|exam/i.test(question);

      if (!hasLevelOrTopic) {
        // Ask the user to clarify exam level and topics in a formatted way
        responseType = "clarify";
        const reply = `Please provide two details so I can suggest appropriate questions:\n\n1) *What is the level of the exam?* (e.g., primary school, high school, college, competitive exam like UPSC/SSC/Bank)\n2) *What topics should be covered?* (e.g., physical geography, climate, population, economy, agriculture, regions, current affairs related to geography of India)\n\nExample answer: \n- Level: Competitive exam (SSC)\n- Topics: Indian physical geography, current affairs (last 2 years).`;

        return res.status(200).json({ type: responseType, reply });
      }

  responseType = "questions";
      // Ask the model to return a strict JSON array of MCQs
      prompt = `Generate ${count} multiple-choice questions focused on Indian government exam style (e.g., UPSC, SSC). Respond strictly as a JSON array where each item has {\n  "question": string,\n  "options": ["opt1","opt2","opt3","opt4"],\n  "answer": "the correct option text",\n  "explanation": "short explanation"\n}. Do not include any extra text or markdown.`;
    } else {
      // Build a focused prompt for a helpful quiz mentor answer
      prompt = `You are an AI quiz mentor. The user asks: "${question}". ` +
        (context ? `Context: ${context}. ` : "") +
        `Answer concisely (1-3 sentences) explaining why the alternative is incorrect and provide the correct reason or pointer to the correct source. Keep the answer factual and educational.`;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ type: responseType, reply: text });
  } catch (error) {
    console.error("Error in chatResponse:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch AI response" });
  }
}
