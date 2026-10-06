import fs from "fs";
import path from "path";
import os from "os";

const originalFilePath = path.join(process.cwd(), "data", "db.json");
const tmpFilePath = path.join(os.tmpdir(), "lab_equipment_db.json");

function getStoragePath() {
  // In serverless environments (e.g. Vercel), process.cwd() is read-only.
  // Use os.tmpdir() which is writable.
  if (
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === "production"
  ) {
    if (!fs.existsSync(tmpFilePath)) {
      try {
        if (fs.existsSync(originalFilePath)) {
          fs.copyFileSync(originalFilePath, tmpFilePath);
        } else {
          fs.writeFileSync(
            tmpFilePath,
            JSON.stringify({ reservations: [] }, null, 2)
          );
        }
      } catch (err) {
        console.error("Failed to seed temporary database:", err);
      }
    }
    return tmpFilePath;
  }

  return originalFilePath;
}

export function readDatabase() {
  // Return in-memory cache if available
  if (globalThis.__labDbCache) {
    return globalThis.__labDbCache;
  }

  const activePath = getStoragePath();

  try {
    if (fs.existsSync(activePath)) {
      const content = fs.readFileSync(activePath, "utf8");
      const parsed = JSON.parse(content);
      globalThis.__labDbCache = parsed;
      return parsed;
    }

    if (fs.existsSync(originalFilePath)) {
      const content = fs.readFileSync(originalFilePath, "utf8");
      const parsed = JSON.parse(content);
      globalThis.__labDbCache = parsed;
      return parsed;
    }
  } catch (error) {
    console.error("Error reading database:", error);
  }

  const fallback = { reservations: [] };
  globalThis.__labDbCache = fallback;
  return fallback;
}

export function writeDatabase(db) {
  // Update in-memory cache immediately
  globalThis.__labDbCache = db;

  const activePath = getStoragePath();

  try {
    fs.writeFileSync(activePath, JSON.stringify(db, null, 2));
  } catch (err) {
    console.warn(`Write to ${activePath} failed, falling back to tmpdir:`, err);
    try {
      fs.writeFileSync(tmpFilePath, JSON.stringify(db, null, 2));
    } catch (tmpErr) {
      console.error("Critical error saving to tmp database:", tmpErr);
      throw tmpErr;
    }
  }
}