# Faceology API

- Version: v0.1
- Updated: 2026-02-15
- Base URL: `http://localhost:4000`

## 1) Health

### `GET /api/health`
서비스 상태 확인.

#### Response `200`
```json
{
  "status": "ok",
  "service": "faceology-server",
  "time": "2026-02-15T00:00:00.000Z"
}
```

## 2) Analyze

### `POST /api/analyze`
얼굴 이미지 품질 점검 + 관상 결과 생성.

#### Content-Type
`multipart/form-data`

#### Form Fields
- `image`: 파일(JPG/PNG/WebP, 최대 10MB)
- `consent`: `true` 필수
- `variation`: `0|1|2` (같은 이미지 기준 결과 재생성)

#### Response `200`
```json
{
  "analysisId": "anl_...",
  "disclaimer": "본 결과는 오락용 해석 콘텐츠이며 의학/법률/채용/신용 판단 근거가 아닙니다.",
  "quality": {
    "passed": true,
    "brightness": 128.4,
    "contrast": 46.2,
    "width": 1080,
    "height": 1080,
    "aspectRatio": 1,
    "issues": [],
    "issueMessages": []
  },
  "variationInfo": {
    "current": 1,
    "max": 3,
    "canRegenerate": true
  },
  "result": {
    "tendency": "...",
    "relationship": "...",
    "career": "...",
    "fortune": "...",
    "todayLine": "..."
  },
  "generatedAt": "2026-02-15T00:00:00.000Z"
}
```

#### Response `422` (품질 실패)
```json
{
  "error": "얼굴 인식이 어렵습니다. 정면 사진으로 다시 시도해 주세요.",
  "code": "QUALITY_CHECK_FAILED",
  "quality": {
    "passed": false,
    "issues": ["face_not_clear"],
    "issueMessages": ["얼굴 인식이 어렵습니다. 정면 사진으로 다시 시도해 주세요."]
  }
}
```

## 3) Result Card

### `GET /api/result-card/:analysisId`
분석 결과 카드 SVG 반환.

#### Response `200`
- `Content-Type: image/svg+xml`

#### Response `404`
```json
{
  "error": "결과를 찾을 수 없습니다. 다시 분석해 주세요.",
  "code": "ANALYSIS_NOT_FOUND"
}
```

## 4) Delete Analysis

### `POST /api/delete`
분석 결과 데이터 삭제.

#### Request Body
```json
{
  "analysisId": "anl_..."
}
```

#### Response `200`
```json
{
  "status": "deleted",
  "analysisId": "anl_...",
  "deletedAt": "2026-02-15T00:00:00.000Z"
}
```

## 오류 코드
- `CONSENT_REQUIRED`
- `IMAGE_REQUIRED`
- `INVALID_VARIATION`
- `QUALITY_CHECK_FAILED`
- `FILE_TOO_LARGE`
- `UNSUPPORTED_FILE_TYPE`
- `ANALYSIS_ID_REQUIRED`
- `ANALYSIS_NOT_FOUND`
- `INTERNAL_SERVER_ERROR`
