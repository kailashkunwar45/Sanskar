import { memo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import fonts from "../theme/fonts";
import { useAuth } from "../contexts/AuthContext";

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
import VendorDashboardScreen from "../screens/main/VendorDashboardScreen";
import EventDetailScreen from "../screens/main/EventDetailScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProductsStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const RitualsStack = createNativeStackNavigator();
const CalendarStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

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
      <HomeStack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "Event Detail" }} />
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

function CalendarStackScreen() {
  const { theme } = useTheme();
  return (
    <CalendarStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: fonts.weights.semibold },
      }}
    >
      <CalendarStack.Screen
        name="CalendarMain"
        component={CalendarScreen}
        options={{ headerShown: false }}
      />
      <CalendarStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: "Event Detail" }}
      />
    </CalendarStack.Navigator>
  );
}

// Shared Stack for Profile
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
    </ProfileStack.Navigator>
  );
}

// 1. CUSTOMER TABS (Standard Shop + Rituals)
function CustomerTabs() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return (
    <Tab.Navigator screenOptions={tabOptions(theme)}>
      {isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminStackScreen}
          options={{
            title: "Admin",
            tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark-outline" size={22} color={color} />,
          }}
        />
      )}
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStackScreen}
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => <Ionicons name="storefront-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStackScreen}
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="RitualsTab"
        component={RitualsStackScreen}
        options={{
          title: "Rituals",
          tabBarIcon: ({ color }) => <Ionicons name="book-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackScreen}
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="BookingTab"
        component={BookingScreen}
        options={{
          title: "Booking",
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// 2. ADMIN STACK (System Control)
function AdminStackScreen() {
  const { theme } = useTheme();
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: fonts.weights.semibold },
      }}
    >
      <AdminStack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{ title: "Article Detail" }}
      />
      <AdminStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Product Detail" }}
      />
      <AdminStack.Screen
        name="RitualDetail"
        component={RitualDetailScreen}
        options={{ title: "Ritual Detail" }}
      />
      <AdminStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: "Event Detail" }}
      />
    </AdminStack.Navigator>
  );
}

// 3. VENDOR TABS (Seller Central)
function VendorTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator screenOptions={tabOptions(theme)}>
      <Tab.Screen name="VendorDash" component={VendorDashboardScreen} options={{ title: "Seller Central", tabBarIcon: ({ color }) => <Ionicons name="business-outline" size={22} color={color} /> }} />
      <Tab.Screen name="RitualsTab" component={RitualsStackScreen} options={{ title: "Rituals" }} />
      <Tab.Screen name="BookingTab" component={BookingScreen} options={{ title: "Book Service" }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

// 4. PANDIT / LAMA TABS (Service Provider)
function PanditTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator screenOptions={tabOptions(theme)}>
      <Tab.Screen name="PanditDash" component={PanditDashboardScreen} options={{ title: "My Workspace", tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} /> }} />
      <Tab.Screen name="ProductsTab" component={ProductsStackScreen} options={{ title: "Shop" }} />
      <Tab.Screen name="RitualsTab" component={RitualsStackScreen} options={{ title: "Rituals" }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

const tabOptions = (theme) => ({
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
    // Default fallback icon selection logic
    return <Ionicons name="ellipse-outline" size={22} color={color} />;
  },
});

// Main Tab Dispatcher
function MainTabNavigator() {
  const { user } = useAuth();
  
  if (user?.role === "admin" || user?.role === "superadmin") return <CustomerTabs />;
  if (user?.role === "vendor") return <VendorTabs />;
  if (user?.role === "pandit" || user?.role === "lama") return <PanditTabs />;
  
  return <CustomerTabs />;
}

export default memo(MainTabNavigator);
