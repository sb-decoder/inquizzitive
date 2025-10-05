// api/studyBuddy.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { message, userId, context } = req.body;
    
    if (!message || !userId) {
      return res.status(400).json({ error: "Missing required fields: message, userId" });
    }

    const apiKey = process.env.GEMINI_API_KEY || null;
    if (!apiKey) {
      console.error("GEMINI API key not found in process.env");
      return res.status(500).json({
        error: "Missing Gemini API key on server. Please set GEMINI_API_KEY in the server environment.",
      });
    }

    // Create comprehensive study buddy prompt
    const systemPrompt = `
      You are an AI Study Buddy designed specifically for Indian government exam preparation (UPSC, SSC, Banking, Railway, Defence, etc.). Your role is to be a helpful, encouraging, and knowledgeable study companion.

      Your core responsibilities:
      1. **Educational Support**: Explain concepts clearly with examples relevant to Indian competitive exams
      2. **Memory Techniques**: Provide mnemonics, acronyms, and memory tricks for complex information
      3. **Study Strategies**: Suggest effective preparation methods and time management techniques
      4. **Motivation**: Encourage and motivate students during their preparation journey
      5. **Contextual Help**: Provide explanations for quiz questions and help with specific topics

      Guidelines for responses:
      - Keep responses concise but comprehensive (2-4 paragraphs maximum)
      - Use simple, clear language that's easy to understand
      - Include relevant examples from Indian context when possible
      - Provide actionable study tips and memory techniques
      - Be encouraging and supportive in tone
      - If explaining concepts, break them down into digestible parts
      - Include relevant facts, dates, or figures when helpful
      - Suggest practice methods or related topics to explore

      Focus areas for Indian government exams:
      - General Knowledge & Current Affairs (up to 2025)
      - Indian History, Geography, and Polity
      - Economics and Finance
      - Science and Technology
      - Environment and Ecology
      - Defence and Security
      - International Relations
      - Constitutional and Legal Knowledge

      Student Context: ${context || 'General study assistance requested'}

      Student Question: "${message}"

      Provide a helpful, educational response as their AI Study Buddy:
    `;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      }
    });

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();

    // Clean up response and ensure it's helpful
    const cleanedResponse = response
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '•') // Convert asterisks to bullet points
      .trim();

    res.status(200).json({
      response: cleanedResponse,
      timestamp: new Date().toISOString(),
      userId: userId
    });

  } catch (error) {
    console.error("Error in study buddy API:", error);
    return res.status(500).json({
      error: "Failed to get study buddy response",
      details: error.message,
    });
  }
}