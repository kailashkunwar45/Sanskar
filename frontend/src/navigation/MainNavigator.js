import { memo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import fonts from "../theme/fonts";

// Screens
import HomeScreen from "../screens/main/HomeScreen";
import ArticlesScreen from "../screens/main/ArticlesScreen";
import ArticleDetailScreen from "../screens/main/ArticleDetailScreen";
import ProductsScreen from "../screens/main/ProductsScreen";
import ProductDetailScreen from "../screens/main/ProductDetailScreen";
import RitualsScreen from "../screens/main/RitualsScreen";
import RitualDetailScreen from "../screens/main/RitualDetailScreen";
import CartScreen from "../screens/main/CartScreen";
import CheckoutScreen from "../screens/main/CheckoutScreen";
import BookingScreen from "../screens/main/BookingScreen";
import CalendarScreen from "../screens/main/CalendarScreen";
import ChatScreen from "../screens/main/ChatScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import AdminDashboardScreen from "../screens/main/AdminDashboardScreen";
import PanditDashboardScreen from "../screens/main/PanditDashboardScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProductsStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const RitualsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeStackScreen() {
  const { theme } = useTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: fonts.weights.semibold },
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen name="Articles" component={ArticlesScreen} />
      <HomeStack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{ title: "Article" }}
      />
      <HomeStack.Screen name="Calendar" component={CalendarScreen} />
      <HomeStack.Screen name="Chat" component={ChatScreen} />
    </HomeStack.Navigator>
  );
}

function ProductsStackScreen() {
  const { theme } = useTheme();
  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: fonts.weights.semibold },
      }}
    >
      <ProductsStack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: "Sacred Shop" }}
      />
      <ProductsStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Product" }}
      />
    </ProductsStack.Navigator>
  );
}

function CartStackScreen() {
  const { theme } = useTheme();
  return (
    <CartStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: fonts.weights.semibold },
      }}
    >
      <CartStack.Screen name="Cart" component={CartScreen} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} />
    </CartStack.Navigator>
  );
}

function RitualsStackScreen() {
  const { theme } = useTheme();
  return (
    <RitualsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: fonts.weights.semibold },
      }}
    >
      <RitualsStack.Screen
        name="Rituals"
        component={RitualsScreen}
        options={{ title: "Rituals" }}
      />
      <RitualsStack.Screen
        name="RitualDetail"
        component={RitualDetailScreen}
        options={{ title: "Ritual Detail" }}
      />
    </RitualsStack.Navigator>
  );
}

function ProfileStackScreen() {
  const { theme } = useTheme();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: fonts.weights.semibold },
      }}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: "Admin Overview" }}
      />
      <ProfileStack.Screen
        name="PanditDashboard"
        component={PanditDashboardScreen}
        options={{ title: "My Assignments" }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: fonts.sizes.xs,
          fontWeight: fonts.weights.medium,
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            HomeTab: "home-outline",
            ProductsTab: "storefront-outline",
            RitualsTab: "book-outline",
            CartTab: "cart-outline",
            BookingTab: "people-outline",
            ProfileTab: "person-outline",
          };
          return (
            <Ionicons
              name={icons[route.name] || "ellipse-outline"}
              size={22}
              color={color}
            />
          );
        },
        animation: "shift",
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: "Home" }} />
      <Tab.Screen name="ProductsTab" component={ProductsStackScreen} options={{ title: "Shop" }} />
      <Tab.Screen name="RitualsTab" component={RitualsStackScreen} options={{ title: "Rituals" }} />
      <Tab.Screen name="CartTab" component={CartStackScreen} options={{ title: "Cart" }} />
      <Tab.Screen name="BookingTab" component={BookingScreen} options={{ title: "Booking" }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

export default memo(MainTabNavigator);
