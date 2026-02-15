import crypto from "node:crypto";

const TTL_MS = 24 * 60 * 60 * 1000;
const records = new Map();

export function saveAnalysis({ imageHash, quality, result, variation }) {
  const id = `anl_${crypto.randomUUID()}`;

  records.set(id, {
    id,
    imageHash,
    quality,
    result,
    variation,
    createdAt: Date.now()
  });

  return id;
}

export function getAnalysis(id) {
  return records.get(id) ?? null;
}

export function deleteAnalysis(id) {
  return records.delete(id);
}

export function cleanupExpiredAnalyses() {
  const now = Date.now();

  for (const [id, record] of records.entries()) {
    if (now - record.createdAt > TTL_MS) {
      records.delete(id);
    }
  }
}

const timer = setInterval(cleanupExpiredAnalyses, 30 * 60 * 1000);
if (typeof timer.unref === "function") {
  timer.unref();
}
