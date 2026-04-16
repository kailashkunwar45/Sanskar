import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function RootNavigator() {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated || isGuest ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
