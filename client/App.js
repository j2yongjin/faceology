import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ADS_CONFIG, ADS_MODULE } from "./src/config/adMobConfig";

const DEFAULT_API_BASE_URL = "http://localhost:4000";
const MAX_VARIATION = 2;

function guessMimeType(uri) {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function buildShareText(result) {
  return [
    `성향: ${result.tendency}`,
    `대인관계: ${result.relationship}`,
    `일/커리어: ${result.career}`,
    `금전/행운 포인트: ${result.fortune}`,
    `${result.todayLine}`,
    "본 결과는 오락용 해석 콘텐츠입니다."
  ].join("\n");
}

async function pickImage(fromCamera) {
  if (fromCamera) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error("카메라 권한이 필요합니다.");
    }

    return ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1]
    });
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("사진 접근 권한이 필요합니다.");
  }

  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1]
  });
}

function AdBanner({ unitId }) {
  const [hidden, setHidden] = useState(false);
  const BannerAd = ADS_MODULE.BannerAd;
  const BannerAdSize = ADS_MODULE.BannerAdSize;

  if (!ADS_CONFIG.enabled || hidden || !unitId || !BannerAd || !BannerAdSize) {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={ADS_CONFIG.requestOptions}
        onAdFailedToLoad={() => {
          setHidden(true);
        }}
      />
    </View>
  );
}

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL);
  const [consent, setConsent] = useState(false);
  const [imageAsset, setImageAsset] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [variation, setVariation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const cardUrl = useMemo(() => {
    if (!analysis?.analysisId) {
      return "";
    }

    return `${apiBaseUrl}/api/result-card/${analysis.analysisId}`;
  }, [analysis, apiBaseUrl]);

  const canAnalyze = Boolean(consent && imageAsset && !loading);
  const canRegenerate =
    Boolean(analysis?.variationInfo?.canRegenerate) && variation < MAX_VARIATION && !loading;

  const resetResult = () => {
    setAnalysis(null);
    setVariation(0);
    setError("");
    setStatus("");
  };

  const handlePickImage = async (fromCamera) => {
    try {
      setError("");
      setStatus("");
      const result = await pickImage(fromCamera);
      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        setError("이미지를 불러오지 못했습니다.");
        return;
      }

      setImageAsset(asset);
      resetResult();
    } catch (pickError) {
      setError(pickError.message || "이미지를 선택할 수 없습니다.");
    }
  };

  const runAnalyze = async (nextVariation) => {
    if (!imageAsset?.uri) {
      setError("이미지를 먼저 선택해 주세요.");
      return;
    }

    if (!consent) {
      setError("동의 체크 후 이용할 수 있습니다.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("consent", String(true));
      formData.append("variation", String(nextVariation));
      formData.append("image", {
        uri: imageAsset.uri,
        name: imageAsset.fileName || `faceology-${Date.now()}.jpg`,
        type: imageAsset.mimeType || guessMimeType(imageAsset.uri)
      });

      const response = await fetch(`${apiBaseUrl}/api/analyze`, {
        method: "POST",
        body: formData
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const issueMessage = payload?.quality?.issueMessages?.join(" ");
        setError(issueMessage || payload?.error || "분석에 실패했습니다.");
        return;
      }

      setVariation(nextVariation);
      setAnalysis(payload);
      setStatus(`분석 완료 (변형 ${payload.variationInfo.current}/3)`);
    } catch (requestError) {
      setError(
        "서버 통신에 실패했습니다. iPhone 실기기에서는 API 주소를 Mac의 로컬 IP로 설정하세요."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async () => {
    if (!analysis?.analysisId) {
      setStatus("삭제할 데이터가 없습니다.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ analysisId: analysis.analysisId })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload?.error || "삭제 요청에 실패했습니다.");
        return;
      }

      resetResult();
      setStatus("분석 데이터를 삭제했습니다.");
    } catch (deleteError) {
      setError("삭제 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const shareResult = async () => {
    if (!analysis?.result) return;

    try {
      await Share.share({ message: buildShareText(analysis.result) });
      setStatus("공유 시트를 열었습니다.");
    } catch (shareError) {
      setStatus("공유가 취소되었거나 실패했습니다.");
    }
  };

  const openResultCard = async () => {
    if (!cardUrl) return;

    const canOpen = await Linking.canOpenURL(cardUrl);
    if (!canOpen) {
      setError("결과 카드 URL을 열 수 없습니다.");
      return;
    }

    await Linking.openURL(cardUrl);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <AdBanner unitId={ADS_CONFIG.topBannerUnitId} />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.eyebrow}>ENTERTAINMENT ONLY</Text>
          <Text style={styles.title}>Faceology iPhone App</Text>
          <Text style={styles.description}>
            오락용 관상 해석 앱입니다. 결과는 재미를 위한 정보이며 의학/법률/채용/신용 판단 근거로
            사용할 수 없습니다.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>서버 주소 설정</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              value={apiBaseUrl}
              onChangeText={setApiBaseUrl}
              placeholder="http://192.168.0.10:4000"
            />
            <Text style={styles.helpText}>
              iPhone 실기기에서는 `localhost` 대신 서버가 실행 중인 Mac의 로컬 IP 주소를 입력하세요.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>1) 동의 및 이미지 선택</Text>
            <View style={styles.switchRow}>
              <Switch value={consent} onValueChange={setConsent} />
              <Text style={styles.switchText}>
                얼굴 이미지는 분석 처리 후 삭제되며 오락용 결과 제공에 동의합니다.
              </Text>
            </View>

            <View style={styles.row}>
              <Pressable style={styles.primaryButton} onPress={() => handlePickImage(true)}>
                <Text style={styles.buttonText}>카메라 촬영</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => handlePickImage(false)}>
                <Text style={styles.buttonText}>사진 앨범 선택</Text>
              </Pressable>
            </View>

            {imageAsset?.uri ? <Image source={{ uri: imageAsset.uri }} style={styles.preview} /> : null}

            <View style={styles.row}>
              <Pressable
                style={[styles.primaryButton, !canAnalyze && styles.disabledButton]}
                disabled={!canAnalyze}
                onPress={() => runAnalyze(0)}
              >
                <Text style={styles.buttonText}>분석 시작</Text>
              </Pressable>
              <Pressable
                style={[styles.secondaryButton, !canRegenerate && styles.disabledButton]}
                disabled={!canRegenerate}
                onPress={() => runAnalyze(variation + 1)}
              >
                <Text style={styles.buttonText}>같은 사진 재생성</Text>
              </Pressable>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#0b5fff" />
              <Text style={styles.loadingText}>분석/요청 처리 중...</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {status ? (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : null}

          {analysis?.result ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>2) 분석 결과</Text>
              <Text style={styles.disclaimer}>{analysis.disclaimer}</Text>

              <View style={styles.resultItem}>
                <Text style={styles.resultTitle}>성향</Text>
                <Text style={styles.resultBody}>{analysis.result.tendency}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultTitle}>대인관계</Text>
                <Text style={styles.resultBody}>{analysis.result.relationship}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultTitle}>일/커리어</Text>
                <Text style={styles.resultBody}>{analysis.result.career}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultTitle}>금전/행운 포인트</Text>
                <Text style={styles.resultBody}>{analysis.result.fortune}</Text>
              </View>

              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>{analysis.result.todayLine}</Text>
              </View>

              <View style={styles.row}>
                <Pressable style={styles.primaryButton} onPress={shareResult}>
                  <Text style={styles.buttonText}>결과 공유</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={openResultCard}>
                  <Text style={styles.buttonText}>결과 카드 열기</Text>
                </Pressable>
              </View>

              <Pressable style={styles.deleteButton} onPress={deleteAnalysis}>
                <Text style={styles.buttonText}>분석 데이터 삭제</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
        <AdBanner unitId={ADS_CONFIG.bottomBannerUnitId} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f9ff"
  },
  screen: {
    flex: 1
  },
  bannerContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  container: {
    padding: 16,
    paddingBottom: 24
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
    letterSpacing: 1
  },
  title: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: "800",
    color: "#0f172a"
  },
  description: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#334155"
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dbeafe"
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0f172a"
  },
  helpText: {
    marginTop: 6,
    color: "#475569",
    fontSize: 13,
    lineHeight: 19
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 12
  },
  switchText: {
    flex: 1,
    color: "#334155",
    fontSize: 14,
    lineHeight: 20
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8
  },
  primaryButton: {
    minWidth: 140,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#0b5fff"
  },
  secondaryButton: {
    minWidth: 140,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#0e7490"
  },
  deleteButton: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#4b5563"
  },
  disabledButton: {
    opacity: 0.4
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  },
  preview: {
    width: "100%",
    height: 260,
    marginTop: 10,
    borderRadius: 12
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e0e7ff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },
  loadingText: {
    color: "#1e3a8a",
    fontWeight: "600"
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },
  errorText: {
    color: "#991b1b",
    fontSize: 14,
    lineHeight: 20
  },
  statusBox: {
    backgroundColor: "#dbeafe",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },
  statusText: {
    color: "#1e3a8a",
    fontSize: 14,
    lineHeight: 20
  },
  disclaimer: {
    marginBottom: 10,
    color: "#334155",
    fontSize: 13,
    lineHeight: 19
  },
  resultItem: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbeafe",
    marginBottom: 8,
    backgroundColor: "#f8fbff"
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4
  },
  resultBody: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20
  },
  quoteBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#93c5fd",
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    backgroundColor: "#eff6ff"
  },
  quoteText: {
    color: "#1e3a8a",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 20
  }
});
