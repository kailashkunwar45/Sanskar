import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import RootNavigator from "../navigation/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";

import { LocalizationProvider } from "../contexts/LocalizationContext";
import LanguagePrompt from "../components/common/LanguagePrompt";

export default function AppRoot() {
  const [fontsLoaded] = useFonts({
    Ionicons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <LocalizationProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
            <LanguagePrompt />
            <StatusBar style="dark" />
          </AuthProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D0D0D",
  },
});

