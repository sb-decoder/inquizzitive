import "dotenv/config";
import { describe, it, expect, vi } from "vitest";
import handler from "../../api/quiz.js";

const quizData = [
  {
    question:
      "Which organization recently released the 'Global Gender Gap Report 2025', highlighting progress and challenges in gender equality?",
    options: [
      "United Nations Development Programme (UNDP)",
      "World Bank",
      "World Economic Forum (WEF)",
      "International Monetary Fund (IMF)",
    ],
    answer: "World Economic Forum (WEF)",
    explanation:
      "The World Economic Forum (WEF) publishes the Global Gender Gap Report annually, measuring gender disparities across various indicators like economic participation, education, health, and political empowerment. The other organizations listed are involved in global development and finance, but the WEF is specifically known for this gender gap assessment.",
  },
];

// Mock the GoogleGenerativeAI
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => {
            const str = JSON.stringify(quizData);
            return "```json\n" + str + "\n```";
          },
        },
      }),
    }),
  })),
}));

// Mock the supabase server
vi.mock("../../src/lib/supabase.server.js", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { quiz_id: "quiz-id-****************" },
            error: null,
          }),
        }),
      }),
    }),
  },
}));

describe("API Handler - getGeminiResponse", () => {
  it("should return 405 for non-GET methods", async () => {
    const req = { method: "POST" };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      error: "Method Not Allowed",
    });
  });

  it("should return 400 for missing query parameters", async () => {
    const req = { method: "GET", query: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required query parameters: qcount, category, difficulty",
    });
  });

  it("should return 500 if GEMINI_API_KEY is not set", async () => {
    const originalEnv = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const req = {
      method: "GET",
      query: { qcount: "5", category: "History", difficulty: "Easy" },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Missing Gemini API key on server. Please set GEMINI_API_KEY in the server environment.",
    });

    process.env.GEMINI_API_KEY = originalEnv;
  });

  it("should return generated questions on success", async () => {
    process.env.GEMINI_API_KEY = "test-key";

    const req = {
      method: "GET",
      query: { qcount: "1", category: "History", difficulty: "Easy" },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      quiz_id: "quiz-id-****************",
      quizQs: quizData.map((item) => ({
        question: item.question,
        options: item.options.map((opt) => opt.trim()),
      })),
    });

    delete process.env.GEMINI_API_KEY;
  });
});
