// db_Setup.js
import dotenv from "dotenv";
import { execSync } from "child_process";

// Load .env for DB_URI
dotenv.config();

const dbUri = process.env.DB_URI;
if (!dbUri) {
  console.error("❌ Missing DB_URI in .env file.");
  process.exit(1);
}

// Check if DB is already initialized
function isDbInitialized() {
  // Check for a specific table that indicates initialization
  // Might required in future
  return false;
}

// Main function
function initializeDB() {
  try {
    if (isDbInitialized()) {
      console.log("✅ Database already initialized. Skipping migration.");
      return;
    }

    console.log("####################################################");
    console.log("Applying migration from local schema to remote DB...\n");

    execSync(`npx supabase db push --db-url "${dbUri}"`, {
      encoding: "utf-8",
      stdio: "inherit",
    });
    console.log("####################################################");
    console.log("✅ Migration applied successfully.");
  } catch (err) {
    console.error("❌ Error during migration:", err.message);
    process.exit(1);
  }
}

initializeDB();
