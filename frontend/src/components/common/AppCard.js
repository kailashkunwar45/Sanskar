import { memo } from "react";
import { Pressable, StyleSheet, View, Platform } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

function AppCard({ children, onPress, style, elevation = 1 }) {
  const { theme } = useTheme();

  const Wrapper = onPress ? Pressable : View;
  const pressProps = onPress
    ? {
        onPress,
        style: ({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.borderLight,
            elevation: elevation * 2,
            opacity: pressed ? 0.92 : 1,
            ...(Platform.OS === "web"
              ? { boxShadow: `0px 2px 6px ${theme.shadow}` }
              : {
                  shadowColor: theme.shadow,
                  shadowOpacity: elevation * 0.04,
                }),
          },
          style,
        ],
      }
    : {};

  if (onPress) {
    return <Wrapper {...pressProps}>{children}</Wrapper>;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
          elevation: elevation * 2,
          ...(Platform.OS === "web"
            ? { boxShadow: `0px 2px 6px ${theme.shadow}` }
            : {
                shadowColor: theme.shadow,
                shadowOpacity: elevation * 0.04,
              }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    padding: 14,
    ...(Platform.OS !== "web" && {
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
    }),
  },
});

export default memo(AppCard);
