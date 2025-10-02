import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface QuizRequest {
  category: string;
  difficulty: string;
  numQuestions: number;
}

export async function POST(request: NextRequest) {
  try {
    const { category, difficulty, numQuestions }: QuizRequest =
      await request.json();

    // Validate input
    if (!category || !difficulty || !numQuestions) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (numQuestions < 1 || numQuestions > 50) {
      return NextResponse.json(
        { error: "Number of questions must be between 1 and 50" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Generate ${numQuestions} multiple choice questions on ${category} for ${difficulty} difficulty level.

    IMPORTANT: The "answer" field must contain the EXACT same text as one of the options.

    Respond strictly in JSON format like:
    [
      {
        "question": "Who is the current Prime Minister of India?",
        "options": ["Narendra Modi", "Rahul Gandhi", "Amit Shah", "Yogi Adityanath"],
        "answer": "Narendra Modi",
        "explanation": "Narendra Modi has been the Prime Minister of India since 2014."
      }
    ]

    Make sure the answer field exactly matches one of the options (including capitalization and spacing).`;

    const result = await model.generateContent(prompt);
    let text = await result.response.text();
    text = text.replace(/```json|```/g, "").trim();

    const questions: QuizQuestion[] = JSON.parse(text);

    // Validate and clean the data
    const cleanedQuestions = questions.map((q) => ({
      ...q,
      answer: q.answer?.trim(),
      options: q.options?.map((opt) => opt?.trim()),
    }));

    // Validate that each answer exists in the options
    const validQuestions = cleanedQuestions.filter((q) => {
      return q.options && q.options.includes(q.answer);
    });

    if (validQuestions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate valid questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: validQuestions });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
