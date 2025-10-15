import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import getGeminiResponse from "./api/getGeminiResponse.js";
import chatResponse from "./api/chatResponse.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5174; // Changed from 5174 to 3001
app.use(cors());
app.use(express.json());

// --- API Route for Gemini (test) ---
app.use("/api/getGeminiResponse", getGeminiResponse);
app.use("/api/chatResponse", chatResponse);

// Serve built files in production and always listen
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  console.log("🚀 Running in production mode — serving built files");
} else {
  console.log("⚙️ Running in dev mode — use Vite dev server for frontend");
}

app.listen(PORT, () => {
  console.log(`✅ Server running on PORT: ${PORT}`);
});

export default app;
