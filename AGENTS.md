# AGENTS.md (Root)

## Scope
이 파일은 저장소 전체(`client`, `server`, `docs`)에 적용됩니다.

## Project Goal
- Faceology MVP(오락용 관상 앱) 개발 및 유지보수
- 개인정보 최소 수집/즉시 삭제 원칙 반영

## Directory Ownership
- `server`: 분석 API, 품질 검증, 결과 생성, 삭제 API
- `client`: iPhone 실행용 Expo 앱(동의/촬영/업로드/결과/공유 UI)
- `docs`: 요구사항, 아키텍처, API 문서

## Engineering Rules
- API 스펙이 바뀌면 `docs/API.md`를 반드시 함께 갱신합니다.
- 결과 텍스트는 차별/혐오/공포 조장 표현을 포함하지 않도록 유지합니다.
- 원본 얼굴 이미지는 서버 영구 저장 금지(해시/요약 정보만 저장).
- 기능 추가 시 오락용 면책 문구 노출 여부를 확인합니다.

## Runbook
- 전체 실행: `npm run dev`
- 서버만: `npm run dev:server`
- 클라이언트만: `npm run dev:client`
- 테스트: `npm test`
