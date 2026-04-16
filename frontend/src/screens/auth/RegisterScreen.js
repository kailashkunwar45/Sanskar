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

function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("customer");
  const [religion, setReligion] = useState("hindu");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = useCallback(async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const userReligion = role === "lama" ? "buddhist" : religion;
      await register(name.trim(), email.trim().toLowerCase(), password, role, userReligion, phone.trim(), address.trim(), location.trim());
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }, [name, email, password, confirmPassword, religion, phone, address, location, register]);

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
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Join the Sanskar community
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
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          autoCapitalize="words"
        />
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
          placeholder="Min 8 characters"
          secureTextEntry
        />
        <AppInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry
        />
        <AppInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="Your contact number"
          keyboardType="phone-pad"
        />
        <AppInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Street address"
        />
        <AppInput
          label="Location/City"
          value={location}
          onChangeText={setLocation}
          placeholder="Your city"
        />

        {/* Role Selection */}
        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 10 }]}>Account Type</Text>
        <View style={styles.toggleRow}>
          {["customer", "pandit", "lama"].map((r) => (
            <Pressable
              key={r}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: role === r ? theme.primary : theme.surface,
                  borderColor: role === r ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setRole(r)}
            >
              <Text
                style={{
                  color: role === r ? theme.textOnPrimary : theme.textSecondary,
                  fontWeight: fonts.weights.semibold,
                  fontSize: fonts.sizes.sm,
                  textTransform: "capitalize",
                }}
              >
                {r}
              </Text>
            </Pressable>
          ))}
        </View>
        
        {(role === "pandit" || role === "lama") && (
          <View style={[styles.infoBox, { backgroundColor: theme.info + "20" }]}>
            <Ionicons name="information-circle" size={16} color={theme.info} />
            <Text style={[styles.infoText, { color: theme.info }]}>
              {role === "pandit" ? "Pandit" : "Lama"} accounts require manual verification by an Admin before taking bookings.
            </Text>
          </View>
        )}

        {/* Religion Preference Toggle (Hidden for Lamas as they are inherently Buddhist) */}
        {role !== "lama" && (
          <>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Religion Preference</Text>
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleBtn,
              {
                backgroundColor:
                  religion === "hindu" ? theme.primary : theme.surface,
                borderColor:
                  religion === "hindu" ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setReligion("hindu")}
          >
            <Text
              style={{
                color:
                  religion === "hindu"
                    ? theme.textOnPrimary
                    : theme.textSecondary,
                fontWeight: fonts.weights.semibold,
                fontSize: fonts.sizes.md,
              }}
            >
              🙏 Hindu
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              {
                backgroundColor:
                  religion === "buddhist" ? theme.primary : theme.surface,
                borderColor:
                  religion === "buddhist" ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setReligion("buddhist")}
          >
            <Text
              style={{
                color:
                  religion === "buddhist"
                    ? theme.textOnPrimary
                    : theme.textSecondary,
                fontWeight: fonts.weights.semibold,
                fontSize: fonts.sizes.md,
              }}
            >
              ☸️ Buddhist
            </Text>
          </Pressable>
        </View>

        <AppButton
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          size="lg"
          style={{ marginTop: 12 }}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Already have an account?
          </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[styles.linkText, { color: theme.primary }]}>
              {" "}
              Sign In
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
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  header: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    marginBottom: 6,
  },
  subtitle: { fontSize: fonts.sizes.md },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  toggleBtn: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    flex: 1,
    paddingVertical: 12,
  },
  errorBox: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoBox: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoText: {
    fontSize: fonts.sizes.sm,
    flex: 1,
    marginLeft: 8,
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
    marginTop: 20,
  },
  footerText: { fontSize: fonts.sizes.md },
  linkText: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.semibold },
});

export default memo(RegisterScreen);
