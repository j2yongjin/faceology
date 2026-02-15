import crypto from "node:crypto";
import sharp from "sharp";

const ISSUE_MESSAGES = {
  low_resolution: "해상도가 낮습니다. 얼굴이 더 크게 보이도록 촬영해 주세요.",
  too_dark: "사진이 어둡습니다. 조명을 밝게 해주세요.",
  too_bright: "사진이 너무 밝습니다. 빛을 줄여서 다시 촬영해 주세요.",
  low_contrast: "얼굴 윤곽이 흐립니다. 정면에서 선명하게 촬영해 주세요.",
  poor_framing: "얼굴이 중앙에 오도록 다시 촬영해 주세요.",
  multiple_faces_suspected: "한 명만 촬영해 주세요.",
  face_not_clear: "얼굴 인식이 어렵습니다. 정면 사진으로 다시 시도해 주세요."
};

const TENDENCY_TEMPLATES = [
  "균형감이 좋아 주변 상황을 빠르게 읽는 편입니다.",
  "호기심이 강하고 새로운 시도를 즐기는 성향입니다.",
  "신중하게 판단한 뒤 실행하는 안정형 성향입니다.",
  "직관이 좋아 초반 방향 설정을 잘 잡는 편입니다.",
  "꾸준함이 강점이라 장기 과제에서 힘을 발휘합니다."
];

const RELATIONSHIP_TEMPLATES = [
  "상대의 반응을 세심하게 살피며 대화를 이어가는 편입니다.",
  "첫인상이 부드러워 협업 관계를 편하게 만듭니다.",
  "핵심을 간결하게 전달해 신뢰를 쌓는 타입입니다.",
  "분위기를 읽고 역할을 조율하는 능력이 돋보입니다.",
  "친한 관계일수록 솔직한 피드백을 잘 주는 편입니다."
];

const CAREER_TEMPLATES = [
  "목표를 작은 단계로 쪼개면 성과가 빠르게 올라갑니다.",
  "기획과 실행 사이 균형을 잡는 업무에서 강점을 보입니다.",
  "반복 개선이 필요한 프로젝트에 특히 잘 맞습니다.",
  "협업 과정에서 기준을 세우는 역할에 어울립니다.",
  "데이터와 감각을 함께 쓰는 업무에서 성과가 좋습니다."
];

const FORTUNE_TEMPLATES = [
  "오늘의 포인트는 '타이밍'입니다. 중요한 제안은 오전에 시작해 보세요.",
  "오늘은 작은 정리가 큰 효율로 돌아오는 날입니다.",
  "주변 도움을 요청하면 생각보다 빠르게 해결됩니다.",
  "과감한 결정보다 검증된 선택이 이득인 흐름입니다.",
  "지출은 계획형으로, 투자는 정보 확인 후 접근해 보세요."
];

const TODAY_LINE_TEMPLATES = [
  "오늘의 한 줄: 속도보다 방향이 좋은 결과를 만듭니다.",
  "오늘의 한 줄: 작은 습관 하나가 컨디션을 바꿉니다.",
  "오늘의 한 줄: 단정 대신 관찰이 기회를 키웁니다.",
  "오늘의 한 줄: 반복한 만큼 신뢰가 쌓입니다.",
  "오늘의 한 줄: 쉬운 선택이 꼭 최선은 아닙니다."
];

function pickByHash(hash, salt, size, variation) {
  const start = salt * 6;
  const seedHex = hash.slice(start, start + 8).padEnd(8, "0");
  const seed = Number.parseInt(seedHex, 16) + variation * 131 + salt * 17;
  return Math.abs(seed) % size;
}

function calculateStats(pixelBuffer) {
  let sum = 0;
  for (const value of pixelBuffer) {
    sum += value;
  }

  const mean = sum / pixelBuffer.length;

  let varianceAcc = 0;
  for (const value of pixelBuffer) {
    const delta = value - mean;
    varianceAcc += delta * delta;
  }

  const variance = varianceAcc / pixelBuffer.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    stdDev
  };
}

export async function analyzeImageQuality(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const { data: grayscalePixels } = await sharp(imageBuffer)
    .rotate()
    .resize(96, 96, { fit: "inside" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { mean, stdDev } = calculateStats(grayscalePixels);
  const aspectRatio = height === 0 ? 0 : width / height;

  const issues = new Set();

  if (width < 480 || height < 480) {
    issues.add("low_resolution");
  }
  if (mean < 65) {
    issues.add("too_dark");
  }
  if (mean > 210) {
    issues.add("too_bright");
  }
  if (stdDev < 22) {
    issues.add("low_contrast");
  }
  if (aspectRatio < 0.65 || aspectRatio > 1.6) {
    issues.add("poor_framing");
  }

  if (aspectRatio > 1.45) {
    issues.add("multiple_faces_suspected");
  }

  if (mean < 58 || mean > 218 || stdDev < 18) {
    issues.add("face_not_clear");
  }

  const blockingIssues = [
    "low_resolution",
    "poor_framing",
    "multiple_faces_suspected",
    "face_not_clear"
  ];

  const issueList = [...issues];
  const passed = !issueList.some((issue) => blockingIssues.includes(issue));

  return {
    passed,
    brightness: Number(mean.toFixed(2)),
    contrast: Number(stdDev.toFixed(2)),
    width,
    height,
    aspectRatio: Number(aspectRatio.toFixed(3)),
    issues: issueList,
    issueMessages: issueList.map((issue) => ISSUE_MESSAGES[issue])
  };
}

export function hashImage(imageBuffer) {
  return crypto.createHash("sha256").update(imageBuffer).digest("hex");
}

export function generateInterpretation(imageHash, variation = 0) {
  const safeVariation = Math.min(Math.max(Number(variation) || 0, 0), 2);

  return {
    tendency:
      TENDENCY_TEMPLATES[
        pickByHash(imageHash, 0, TENDENCY_TEMPLATES.length, safeVariation)
      ],
    relationship:
      RELATIONSHIP_TEMPLATES[
        pickByHash(imageHash, 1, RELATIONSHIP_TEMPLATES.length, safeVariation)
      ],
    career:
      CAREER_TEMPLATES[
        pickByHash(imageHash, 2, CAREER_TEMPLATES.length, safeVariation)
      ],
    fortune:
      FORTUNE_TEMPLATES[
        pickByHash(imageHash, 3, FORTUNE_TEMPLATES.length, safeVariation)
      ],
    todayLine:
      TODAY_LINE_TEMPLATES[
        pickByHash(imageHash, 4, TODAY_LINE_TEMPLATES.length, safeVariation)
      ]
  };
}

export function pickUserFacingError(quality) {
  if (!quality.issues.length) {
    return "이미지를 분석할 수 없습니다. 다시 시도해 주세요.";
  }

  return quality.issueMessages[0] ?? "얼굴 인식에 실패했습니다. 다시 시도해 주세요.";
}
