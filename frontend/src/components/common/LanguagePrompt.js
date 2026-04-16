import { memo } from "react";
import { StyleSheet, Text, View, Pressable, Modal, SafeAreaView } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { useLocalization } from "../../contexts/LocalizationContext";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";

function LanguagePrompt() {
  const { theme } = useTheme();
  const { showPrompt, setLanguage } = useLocalization();

  if (!showPrompt) return null;

  return (
    <Modal transparent animationType="slide" visible={showPrompt}>
      <SafeAreaView style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Ionicons name="language" size={24} color={theme.primary} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>Select Language / भाषा छान्नुहोस्</Text>
          </View>
          <View style={styles.options}>
            <Pressable
              style={({ pressed }) => [
                styles.optionBtn,
                { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => setLanguage("en")}
            >
              <Text style={styles.optionText}>English</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.optionBtn,
                { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => setLanguage("np")}
            >
              <Text style={styles.optionText}>नेपाली</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
  },
  options: {
    flexDirection: "row",
    gap: 16,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
  },
});

export default memo(LanguagePrompt);
