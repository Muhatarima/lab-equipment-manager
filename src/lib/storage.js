import fs from "fs";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "data",
  "db.json"
);

export function readDatabase() {
  const file = fs.readFileSync(
    filePath,
    "utf8"
  );

  return JSON.parse(file);
}

export function writeDatabase(db) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(db, null, 2)
  );
}