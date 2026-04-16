import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../../../components/common/ScreenContainer";
import { checkApiHealth } from "../services/healthService";
import colors from "../../../theme/colors";
import { logError, logInfo } from "../../../utils/logger";

export default function HealthCheckScreen() {
  const [statusText, setStatusText] = useState("Tap button to test backend connection");
  const [isLoading, setIsLoading] = useState(false);

  const onCheckHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await checkApiHealth();
      const message = result?.message || "API connected";
      logInfo("Health check success", result);
      setStatusText(message);
    } catch (error) {
      logError("Health check failed", error?.message);
      setStatusText(error?.message || "Failed to connect API");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>Sanskar Client Foundation Ready</Text>
        <Text style={styles.subtitle}>{statusText}</Text>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
          disabled={isLoading}
          onPress={onCheckHealth}
        >
          <Text style={styles.buttonText}>{isLoading ? "Checking..." : "Check API Health"}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    padding: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
