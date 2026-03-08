# Faceology

관상(엔터테인먼트) 분석용 프로토타입 앱입니다.

- `client`: iPhone 실행용 Expo(React Native) 앱
- `server`: Node/Express API 서버
- `docs`: PRD, API/아키텍처 문서

## 빠른 시작

1. 의존성 설치
```bash
npm install
npm run install:all
```

2. 서버 실행
```bash
npm run dev:server
```

3. 클라이언트(Expo) 실행
```bash
npm run dev:client
```

## 서버 실행 방법

1. 의존성 설치
```bash
npm install --prefix server
```

2. 서버 실행
```bash
npm run dev:server
```

3. 상태 확인
```bash
curl http://localhost:4000/api/health
```

## iPhone 클라이언트 실행 방법 (광고 포함 Development Build)

1. 의존성 설치
```bash
npm install --prefix client
```

2. 광고 설정 파일 준비
```bash
cp client/.env.example client/.env
```

3. AdMob App ID / 배너 Unit ID를 `client/.env`에 입력
- `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`
- `EXPO_PUBLIC_ADMOB_IOS_APP_ID`
- `EXPO_PUBLIC_ADMOB_TOP_BANNER_UNIT_ID`
- `EXPO_PUBLIC_ADMOB_BOTTOM_BANNER_UNIT_ID`

4. 네이티브 프로젝트 생성 및 iOS 실행
```bash
npm run native:prebuild --prefix client
npm run native:ios --prefix client
```

5. 앱 상단 `서버 주소 설정` 입력
- iOS 시뮬레이터: `http://localhost:4000`
- iPhone 실기기: `http://<서버가 실행 중인 Mac의 로컬 IP>:4000`
  - 예: `http://192.168.0.10:4000`

6. 서버/아이폰이 같은 Wi-Fi에 있어야 정상 통신됩니다.

참고:
- `Expo Go`에서는 AdMob 네이티브 모듈이 없어 광고가 노출되지 않습니다.
- 개발 모드에서는 테스트 배너가 표시되며, 릴리스 전 실제 Ad Unit ID로 교체해야 합니다.
- 상세 설정 가이드는 `docs/ADS_SETUP.md`를 참고하세요.

## 테스트/빌드

```bash
npm test
npm run build
```

- `npm run build`는 iOS용 Expo export(`client/dist-ios`)를 생성합니다.

## 주의

- 이 프로젝트의 결과는 **오락용**입니다.
- 의학/법률/채용/신용 판단에 사용하면 안 됩니다.
