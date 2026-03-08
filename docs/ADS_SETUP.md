# Faceology AdMob Setup Guide

- Updated: 2026-02-15
- Scope: `client` 상단/하단 배너 광고

## 변경 파일

- `client/App.js`: 상단/하단 `BannerAd` 렌더링
- `client/src/config/adMobConfig.js`: 광고 모듈 로딩/유닛 ID/요청 옵션 관리
- `client/app.config.js`: Expo config plugin으로 AdMob App ID 주입
- `client/.env.example`: 환경 변수 템플릿

## 1) AdMob 식별자 준비

Google AdMob 콘솔에서 아래 값을 발급받습니다.

- App ID (Android)
- App ID (iOS)
- Banner Ad Unit ID (TOP)
- Banner Ad Unit ID (BOTTOM)

## 2) 환경 변수 설정

```bash
cp client/.env.example client/.env
```

`client/.env` 값을 실제 발급값으로 교체합니다.

```env
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-xxxx~xxxx
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-xxxx~xxxx
EXPO_PUBLIC_ADMOB_TOP_BANNER_UNIT_ID=ca-app-pub-xxxx/yyyy
EXPO_PUBLIC_ADMOB_BOTTOM_BANNER_UNIT_ID=ca-app-pub-xxxx/zzzz
```

## 3) 빌드/실행

AdMob는 네이티브 모듈이므로 Development Build가 필요합니다.

```bash
npm install --prefix client
npm run native:prebuild --prefix client
npm run native:ios --prefix client
```

참고:
- `Expo Go`에서는 광고 SDK가 없어 배너가 표시되지 않습니다.
- 개발 모드(`__DEV__`)에서는 테스트 배너 ID가 자동 적용됩니다.

## 4) 동작 방식

- 상단 배너: 화면 콘텐츠 상단
- 하단 배너: 화면 콘텐츠 하단
- 실패 처리: 광고 로드 실패 시 해당 슬롯 숨김
- 개인정보: `requestNonPersonalizedAdsOnly: true` 기본 적용

## 5) 릴리스 체크리스트

1. `client/.env`에 실제 App ID / Unit ID가 입력되었는지 확인
2. 테스트 광고 대신 실제 광고가 노출되는지 TestFlight/내부 배포에서 검증
3. `app-ads.txt` 적용 여부 확인
4. 앱 스토어 심사 메타데이터에 광고 사용 사실 반영
