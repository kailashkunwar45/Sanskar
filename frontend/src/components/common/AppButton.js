import { memo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import fonts from "../../theme/fonts";

function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary", // primary | outline | ghost
  size = "md",         // sm | md | lg
  style,
}) {
  const { theme } = useTheme();

  const bgColor =
    variant === "primary"
      ? theme.primary
      : variant === "outline"
      ? "transparent"
      : "transparent";

  const textColor =
    variant === "primary" ? theme.textOnPrimary : theme.primary;

  const borderColor = variant === "outline" ? theme.primary : "transparent";

  const heightMap = { sm: 36, md: 46, lg: 54 };
  const fontMap = { sm: fonts.sizes.sm, md: fonts.sizes.md, lg: fonts.sizes.lg };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bgColor,
          borderColor,
          height: heightMap[size],
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize: fontMap[size] }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: {
    fontWeight: fonts.weights.semibold,
  },
});

export default memo(AppButton);
