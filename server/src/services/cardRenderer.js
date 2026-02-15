function escapeXml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function renderResultCardSvg(result) {
  const tendency = escapeXml(result.tendency);
  const relationship = escapeXml(result.relationship);
  const career = escapeXml(result.career);
  const fortune = escapeXml(result.fortune);
  const todayLine = escapeXml(result.todayLine);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)" />
  <rect x="60" y="60" width="960" height="960" rx="36" fill="rgba(255, 255, 255, 0.1)" />
  <text x="120" y="170" fill="#ffffff" font-size="56" font-family="Pretendard, Apple SD Gothic Neo, sans-serif" font-weight="700">Faceology 결과 카드</text>

  <text x="120" y="270" fill="#bfdbfe" font-size="34" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">성향</text>
  <text x="120" y="320" fill="#ffffff" font-size="32" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">${tendency}</text>

  <text x="120" y="430" fill="#bfdbfe" font-size="34" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">대인관계</text>
  <text x="120" y="480" fill="#ffffff" font-size="32" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">${relationship}</text>

  <text x="120" y="590" fill="#bfdbfe" font-size="34" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">일/커리어</text>
  <text x="120" y="640" fill="#ffffff" font-size="32" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">${career}</text>

  <text x="120" y="750" fill="#bfdbfe" font-size="34" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">금전/행운 포인트</text>
  <text x="120" y="800" fill="#ffffff" font-size="32" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">${fortune}</text>

  <text x="120" y="900" fill="#dbeafe" font-size="30" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">${todayLine}</text>
  <text x="120" y="970" fill="#93c5fd" font-size="24" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">본 결과는 오락용 해석 콘텐츠입니다.</text>
</svg>`;
}
