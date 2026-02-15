import cors from "cors";
import express from "express";
import multer from "multer";

import {
  analyzeImageQuality,
  generateInterpretation,
  hashImage,
  pickUserFacingError
} from "./services/analyzer.js";
import { applyContentSafety } from "./services/contentSafety.js";
import { renderResultCardSvg } from "./services/cardRenderer.js";
import { deleteAnalysis, getAnalysis, saveAnalysis } from "./store.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      const error = new Error("이미지 파일(JPG/PNG/WebP)만 업로드할 수 있습니다.");
      error.code = "UNSUPPORTED_FILE_TYPE";
      cb(error);
      return;
    }
    cb(null, true);
  }
});

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "faceology-server",
    time: new Date().toISOString()
  });
});

app.post("/api/analyze", upload.single("image"), async (req, res, next) => {
  try {
    const consent = String(req.body?.consent).toLowerCase() === "true";
    if (!consent) {
      res.status(400).json({
        error: "동의가 필요합니다.",
        code: "CONSENT_REQUIRED"
      });
      return;
    }

    const variation = Number.parseInt(String(req.body?.variation ?? "0"), 10);
    if (!Number.isInteger(variation) || variation < 0 || variation > 2) {
      res.status(400).json({
        error: "variation은 0~2 범위여야 합니다.",
        code: "INVALID_VARIATION"
      });
      return;
    }

    if (!req.file?.buffer) {
      res.status(400).json({
        error: "이미지 파일이 필요합니다.",
        code: "IMAGE_REQUIRED"
      });
      return;
    }

    const quality = await analyzeImageQuality(req.file.buffer);

    if (!quality.passed) {
      res.status(422).json({
        error: pickUserFacingError(quality),
        code: "QUALITY_CHECK_FAILED",
        quality
      });
      return;
    }

    const imageHash = hashImage(req.file.buffer);
    const interpretation = generateInterpretation(imageHash, variation);
    const safeResult = applyContentSafety(interpretation);

    const analysisId = saveAnalysis({
      imageHash,
      quality,
      result: safeResult,
      variation
    });

    res.json({
      analysisId,
      disclaimer:
        "본 결과는 오락용 해석 콘텐츠이며 의학/법률/채용/신용 판단 근거가 아닙니다.",
      quality,
      variationInfo: {
        current: variation + 1,
        max: 3,
        canRegenerate: variation < 2
      },
      result: safeResult,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/result-card/:analysisId", (req, res) => {
  const { analysisId } = req.params;
  const record = getAnalysis(analysisId);

  if (!record) {
    res.status(404).json({
      error: "결과를 찾을 수 없습니다. 다시 분석해 주세요.",
      code: "ANALYSIS_NOT_FOUND"
    });
    return;
  }

  const cardSvg = renderResultCardSvg(record.result);
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.send(cardSvg);
});

app.post("/api/delete", (req, res) => {
  const { analysisId } = req.body ?? {};

  if (!analysisId) {
    res.status(400).json({
      error: "analysisId가 필요합니다.",
      code: "ANALYSIS_ID_REQUIRED"
    });
    return;
  }

  const deleted = deleteAnalysis(analysisId);

  if (!deleted) {
    res.status(404).json({
      error: "삭제할 데이터가 없습니다.",
      code: "ANALYSIS_NOT_FOUND"
    });
    return;
  }

  res.json({
    status: "deleted",
    analysisId,
    deletedAt: new Date().toISOString()
  });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      error: "파일 크기는 10MB 이하여야 합니다.",
      code: "FILE_TOO_LARGE"
    });
    return;
  }

  if (error?.code === "UNSUPPORTED_FILE_TYPE") {
    res.status(400).json({
      error: error.message,
      code: "UNSUPPORTED_FILE_TYPE"
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    error: "서버 오류가 발생했습니다.",
    code: "INTERNAL_SERVER_ERROR"
  });
});
