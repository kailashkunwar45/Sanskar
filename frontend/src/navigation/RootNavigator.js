import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const linking = {
  prefixes: [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://localhost:5173",
    "sanskar://",
  ],
  config: {
    screens: {
      Onboarding: "onboarding",
      Login: "login",
      Register: "register",
      HomeTab: {
        path: "home",
        screens: {
          Home: "",
          Articles: "articles",
          ArticleDetail: "articles/:id",
          Calendar: "calendar-stack",
          Chat: "chat",
          EventDetail: "event/:id",
        },
      },
      ProductsTab: {
        path: "products",
        screens: {
          Products: "",
          ProductDetail: ":id",
        },
      },
      CalendarTab: {
        path: "calendar",
        screens: {
          CalendarMain: "",
          EventDetail: "event/:id",
        },
      },
      RitualsTab: {
        path: "rituals",
        screens: {
          Rituals: "",
          RitualDetail: ":id",
        },
      },
      CartTab: {
        path: "cart",
        screens: {
          Cart: "",
          Checkout: "checkout",
        },
      },
      BookingTab: "booking",
      ProfileTab: {
        path: "profile",
        screens: {
          Profile: "",
        },
      },
      AdminTab: {
        path: "admin",
        screens: {
          AdminDashboard: "",
          ArticleDetail: "articles/:id",
          ProductDetail: "products/:id",
          RitualDetail: "rituals/:id",
          EventDetail: "event/:id",
        },
      },
    },
  },
};

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
    <NavigationContainer linking={linking}>
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
