# AGENTS.md (Client)

## Scope
이 파일은 `client/` 하위에 적용됩니다.

## Purpose
- iPhone 실행 가능한 Expo(React Native) 앱 유지
- 동의 체크 기반 분석 플로우 UI 제공
- 카메라/앨범 업로드/결과/공유/삭제 액션 제공

## UX Rules
- 동의 미체크 상태에서는 분석 요청 버튼을 비활성화합니다.
- 분석 실패 시 재촬영/재업로드 가이드를 명확히 노출합니다.
- 결과 화면에 오락용 면책 문구를 항상 표시합니다.
- iPhone 세로 화면 기준 UI 가독성을 우선합니다.

## Integration Rules
- API 기본 주소는 앱 내 입력값을 사용하며, 실기기에서는 `localhost` 대신 서버 Mac의 로컬 IP를 사용합니다.
- variation 요청은 최대 3회(0,1,2)로 제한합니다.
- 삭제 요청 성공 시 로컬 상태를 초기화합니다.
