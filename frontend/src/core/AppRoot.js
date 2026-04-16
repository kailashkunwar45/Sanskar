import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import RootNavigator from "../navigation/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import { LocalizationProvider } from "../contexts/LocalizationContext";
import LanguagePrompt from "../components/common/LanguagePrompt";

export default function AppRoot() {
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
});
