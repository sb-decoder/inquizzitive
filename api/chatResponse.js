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
  // Detect if user asked to explain a specific question like "explain q9" or "explain question 9"
  const explainMatch = question.match(/\bexplain\s+(?:q|question)?\s*\.?\s*(\d+)\b/i);

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
      // If user asked to explain a particular question number, try to fetch it from the provided context
      if (explainMatch) {
        const qnum = parseInt(explainMatch[1], 10);
        let sourceQuestions = null;

        // Try common context shapes: { questions: [...] } or { quiz: { questions: [...] } }
        if (context && Array.isArray(context.questions)) {
          sourceQuestions = context.questions;
        } else if (context && context.quiz && Array.isArray(context.quiz.questions)) {
          sourceQuestions = context.quiz.questions;
        }

        if (sourceQuestions && sourceQuestions.length >= qnum && qnum > 0) {
          const qObj = sourceQuestions[qnum - 1];
          const qText = qObj.question || qObj.prompt || JSON.stringify(qObj);
          const qOptions = Array.isArray(qObj.options) ? qObj.options.join(" | ") : (qObj.options || "");
          const correct = qObj.answer || qObj.correct || "";

          prompt = `You are an expert exam mentor. Provide a detailed, pedagogical explanation for the following multiple-choice question. ` +
            `Question: ${qText}\nOptions: ${qOptions}\nCorrect answer (if known): ${correct}\n\n` +
            `Please include:\n1) A clear statement of the correct answer.\n2) Step-by-step reasoning that leads to the correct choice.\n3) Why each incorrect option is wrong (briefly).\n4) Short memory tips or mnemonics, and a reference or pointer for further reading if applicable.\nMake the explanation thorough but focused (aim for 3-6 concise paragraphs).`;
        } else {
          // No question data found in context — ask for clarification with an example
          responseType = "clarify";
          const reply = `I can explain question ${qnum}, but I don't have the quiz data here. Please either:
\n- Paste the full text of question ${qnum} (including options), or
- Provide the quiz context when asking (e.g., send { context: { questions: [...] } } ),
\nExample: \nexplain q9 \n- then include in the same request body: context: { questions: [ { question: '...', options: ['a','b','c','d'], answer: '...' }, ... ] }`;

          return res.status(200).json({ type: responseType, reply });
        }
      } else {
        // Build a focused prompt for a helpful quiz mentor answer
        prompt = `You are an AI quiz mentor. The user asks: "${question}". ` +
          (context ? `Context: ${context}. ` : "") +
          `Answer concisely (1-3 sentences) explaining why the alternative is incorrect and provide the correct reason or pointer to the correct source. Keep the answer factual and educational.`;
      }
    }

    // Create the Gemini client and include prior messages (if any) so the model behaves like a chat mentor
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // If the client sent conversation messages, serialize them into the prompt
    let finalPrompt = prompt;
    if (context && Array.isArray(context.messages) && context.messages.length > 0) {
      const systemHeader = `You are an AI Quiz Mentor. Maintain context across the conversation, be helpful, pedagogical, and concise when asked.`;
      const convo = context.messages
        .map((m) => {
          const role = (m.role || m.from || "user").toString().toLowerCase();
          const label = role.startsWith("user") ? "User" : "Assistant";
          const text = (m.text || m.message || m).toString();
          return `${label}: ${text}`;
        })
        .join("\n");

      finalPrompt = `${systemHeader}\n\nConversation so far:\n${convo}\n\nLatest user query: ${question}\n\nPlease respond as the Mentor. ${prompt}`;
    }

    const result = await model.generateContent(finalPrompt);
    const text = result.response.text();

    return res.status(200).json({ type: responseType, reply: text });
  } catch (error) {
    console.error("Error in chatResponse:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch AI response" });
  }
}
