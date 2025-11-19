import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data/db.json");

export function readDB() {
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data);
}

export function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
