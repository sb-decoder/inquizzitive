import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getGeminiResponse } from "./api/getGeminiResponse.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5174;
app.use(cors(process.env.VITE_API_BASE_URL));
app.use(express.json());

// --- API Route for Gemini (test) ---
app.get("/api/gemini", getGeminiResponse);

// Serve built files in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
} else {
  console.log("⚙️ Running in dev mode — use Vite dev server for frontend");
  app.listen(PORT, () => {
    console.log(`✅ Server running on PORT: ${PORT}`);
  });
}

export default app;

