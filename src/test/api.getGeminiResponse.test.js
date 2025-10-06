import { describe, it, expect, vi } from "vitest";
import handler from "../../api/getGeminiResponse.js";
import dotenv from "dotenv";

dotenv.config();

// Mock the GoogleGenerativeAI
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () =>
            '[{"question": "Test question", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "Test explanation"}]',
        },
      }),
    }),
  })),
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
      error: "Method not allowed. Use GET.",
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
      send: vi.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      '[{"question": "Test question", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "Test explanation"}]',
    );

    delete process.env.GEMINI_API_KEY;
  });
});
