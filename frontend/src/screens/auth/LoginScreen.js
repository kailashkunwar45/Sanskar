import { memo, useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";

function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const { login, skipLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.primaryLight + "30" },
            ]}
          >
            <Ionicons name="flower" size={48} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in to continue your spiritual journey
          </Text>
        </View>

        {error ? (
          <View
            style={[styles.errorBox, { backgroundColor: theme.danger + "15" }]}
          >
            <Ionicons name="alert-circle" size={18} color={theme.danger} />
            <Text style={[styles.errorText, { color: theme.danger }]}>
              {error}
            </Text>
          </View>
        ) : null}

        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />
        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />

        <AppButton
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          size="lg"
          style={{ marginTop: 8 }}
        />

        <Pressable 
          onPress={skipLogin} 
          style={styles.skipLink}
        >
          <Text style={[styles.skipLinkText, { color: theme.textSecondary }]}>
            Skip for now
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Don't have an account?
          </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={[styles.linkText, { color: theme.primary }]}>
              {" "}
              Sign Up
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: { alignItems: "center", marginBottom: 32 },
  iconCircle: {
    alignItems: "center",
    borderRadius: 44,
    height: 88,
    justifyContent: "center",
    marginBottom: 20,
    width: 88,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    textAlign: "center",
  },
  errorBox: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: { fontSize: fonts.sizes.md },
  linkText: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.semibold },
  skipLink: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 8,
  },
  skipLinkText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
  },
});

export default memo(LoginScreen);
