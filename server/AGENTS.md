# AGENTS.md (Server)

## Scope
이 파일은 `server/` 하위에 적용됩니다.

## Purpose
- 이미지 기반 품질 점검
- 관상 결과 생성 API 제공
- 데이터 삭제 요청 처리

## API Guardrails
- 모든 분석 API는 동의(`consent=true`) 없으면 거부합니다.
- 업로드 파일은 JPG/PNG/WebP, 최대 10MB로 제한합니다.
- 원본 이미지 영구 저장 금지. 해시/품질 메타만 보관합니다.
- 응답에는 오락용 면책 문구를 포함합니다.

## Code Conventions
- 라우트는 `src/index.js`, 도메인 로직은 `src/services/*`에 둡니다.
- 결과 생성 로직은 deterministic 하게 유지합니다(같은 입력 + variation = 같은 결과).
- 품질 기준 변경 시 테스트(`server/test/*`)를 함께 업데이트합니다.
