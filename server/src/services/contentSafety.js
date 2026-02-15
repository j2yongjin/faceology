const BANNED_TERMS = [
  "차별",
  "혐오",
  "멸시",
  "저주",
  "파멸",
  "인종",
  "외모 비하"
];

function sanitizeText(text) {
  let result = text;
  for (const term of BANNED_TERMS) {
    const pattern = new RegExp(term, "gi");
    result = result.replace(pattern, "***");
  }
  return result;
}

export function applyContentSafety(result) {
  return {
    ...result,
    tendency: sanitizeText(result.tendency),
    relationship: sanitizeText(result.relationship),
    career: sanitizeText(result.career),
    fortune: sanitizeText(result.fortune),
    todayLine: sanitizeText(result.todayLine)
  };
}
