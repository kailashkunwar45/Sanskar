import { memo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import fonts from "../../theme/fonts";

function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  style,
  multiline = false,
}) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: error
              ? theme.danger
              : focused
              ? theme.primary
              : theme.border,
            color: theme.textPrimary,
          },
          multiline && { minHeight: 80, textAlignVertical: "top" },
        ]}
      />
      {error ? (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: fonts.sizes.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    fontSize: fonts.sizes.xs,
    marginTop: 4,
  },
});

export default memo(AppInput);
