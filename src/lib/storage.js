import fs from "fs";
import path from "path";
import os from "os";
import { DEFAULT_EQUIPMENT } from "./constants.js";

export { DEFAULT_EQUIPMENT };

const originalFilePath = path.join(process.cwd(), "data", "db.json");
const tmpFilePath = path.join(os.tmpdir(), "lab_equipment_db.json");

function getStoragePath() {
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
            JSON.stringify(
              { reservations: [], equipment: DEFAULT_EQUIPMENT },
              null,
              2
            )
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

function normalizeDb(data) {
  if (!data || typeof data !== "object") {
    data = {};
  }
  if (!Array.isArray(data.reservations)) {
    data.reservations = [];
  }
  if (!Array.isArray(data.equipment) || data.equipment.length === 0) {
    data.equipment = [...DEFAULT_EQUIPMENT];
  }
  return data;
}

export function readDatabase() {
  if (globalThis.__labDbCache) {
    return normalizeDb(globalThis.__labDbCache);
  }

  const activePath = getStoragePath();

  try {
    if (fs.existsSync(activePath)) {
      const content = fs.readFileSync(activePath, "utf8");
      const parsed = normalizeDb(JSON.parse(content));
      globalThis.__labDbCache = parsed;
      return parsed;
    }

    if (fs.existsSync(originalFilePath)) {
      const content = fs.readFileSync(originalFilePath, "utf8");
      const parsed = normalizeDb(JSON.parse(content));
      globalThis.__labDbCache = parsed;
      return parsed;
    }
  } catch (error) {
    console.error("Error reading database:", error);
  }

  const fallback = normalizeDb({ reservations: [], equipment: DEFAULT_EQUIPMENT });
  globalThis.__labDbCache = fallback;
  return fallback;
}

export function writeDatabase(db) {
  const normalized = normalizeDb(db);
  globalThis.__labDbCache = normalized;

  const activePath = getStoragePath();

  try {
    fs.writeFileSync(activePath, JSON.stringify(normalized, null, 2));
  } catch (err) {
    console.warn(`Write to ${activePath} failed, falling back to tmpdir:`, err);
    try {
      fs.writeFileSync(tmpFilePath, JSON.stringify(normalized, null, 2));
    } catch (tmpErr) {
      console.error("Critical error saving to tmp database:", tmpErr);
      throw tmpErr;
    }
  }
}