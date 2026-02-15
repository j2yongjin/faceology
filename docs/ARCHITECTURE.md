# Faceology Architecture

- Updated: 2026-02-15
- Goal: 오락용 관상 해석 MVP

## 구성

1. `client` (Expo + React Native, iPhone 실행)
- 사용자 동의 체크
- iOS 카메라/사진 앨범 업로드
- 분석 요청 및 결과 표시
- 결과 공유/결과 카드 열기/삭제 요청
- 앱 내 서버 주소 입력(실기기 로컬 IP 연결)

2. `server` (Node + Express)
- 이미지 업로드 처리(`multer` 메모리 저장)
- 품질 체크(`sharp` 기반 밝기/대비/해상도/프레이밍)
- 결과 생성(해시 기반 deterministic 템플릿)
- 콘텐츠 안전 필터
- 결과 카드 SVG 렌더링

3. In-memory Store
- `analysisId` 기준 결과/품질 메타 보관
- TTL 24시간 정리
- 원본 이미지 미보관(해시만 유지)

## 요청 흐름

1. 사용자 동의 + 이미지 선택
2. `POST /api/analyze`
3. 서버 품질 검사
4. 통과 시 결과 생성 후 `analysisId` 반환
5. 클라이언트가 결과 표시
6. 필요 시
- `GET /api/result-card/:analysisId` (카드 보기)
- `POST /api/delete` (데이터 삭제)

## 보안/정책 포인트

- 원본 이미지 영구 저장 금지
- 파일 형식/크기 제한(10MB)
- 오락용 면책 문구 응답 포함
- 동의 없이는 분석 거부
