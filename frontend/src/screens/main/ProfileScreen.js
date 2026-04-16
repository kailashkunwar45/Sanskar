import { memo, useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import AppButton from "../../components/common/AppButton";
import AppCard from "../../components/common/AppCard";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { fetchOrders } from "../../services/api";

function ProfileScreen({ navigation }) {
  const { theme, themeName, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchOrders(1, 5);
        setOrders(res.orders || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      logout();
    } else {
      Alert.alert("Logout", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout },
      ]);
    }
  }, [logout]);

  const statusIcons = {
    placed: "time-outline",
    processing: "reload-outline",
    shipped: "airplane-outline",
    delivered: "checkmark-circle-outline",
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scroll}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: theme.primaryLight + "40" },
          ]}
        >
          <Ionicons name="person" size={36} color={theme.primary} />
        </View>
        <Text style={[styles.userName, { color: theme.textPrimary }]}>
          {user?.name || "Guest"}
        </Text>
        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
          {user?.email || "Not signed in"}
        </Text>
        <View
          style={[styles.roleBadge, { backgroundColor: theme.primary + "15" }]}
        >
          <Text style={[styles.roleText, { color: theme.primary }]}>
            {user?.role || "customer"}
          </Text>
        </View>
      </View>

      {/* Theme Toggle Radio Buttons */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 0 }]}>
        App Theme
      </Text>
      <AppCard style={styles.radioCard}>
        <Pressable
          style={[
            styles.radioRow,
            { borderBottomWidth: 1, borderBottomColor: theme.borderLight },
          ]}
          onPress={() => toggleTheme()}
        >
          <Text style={[styles.radioLabel, { color: theme.textPrimary }]}>
            🙏 Hindu (Orange/Gold)
          </Text>
          <View
            style={[
              styles.radioOuter,
              { borderColor: themeName === "hindu" ? theme.primary : theme.border },
            ]}
          >
            {themeName === "hindu" && (
              <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
            )}
          </View>
        </Pressable>
        <Pressable
          style={styles.radioRow}
          onPress={() => toggleTheme()}
        >
          <Text style={[styles.radioLabel, { color: theme.textPrimary }]}>
            ☸️ Buddhist (Blood Red)
          </Text>
          <View
            style={[
              styles.radioOuter,
              { borderColor: themeName === "buddhist" ? theme.primary : theme.border },
            ]}
          >
            {themeName === "buddhist" && (
              <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
            )}
          </View>
        </Pressable>
      </AppCard>

      {/* Quick Menu */}
      <AppCard style={styles.menuCard}>
        {(user?.role === "admin" || user?.role === "superadmin") && (
          <Pressable
            style={[styles.menuRow, { borderBottomColor: theme.borderLight }]}
            onPress={() => navigation.navigate("AdminDashboard")}
          >
            <Ionicons name="stats-chart-outline" size={20} color={theme.primary} />
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
              Admin Dashboard
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </Pressable>
        )}
        {user?.role === "pandit" && (
          <Pressable
            style={[styles.menuRow, { borderBottomColor: theme.borderLight }]}
            onPress={() => navigation.navigate("PanditDashboard")}
          >
            <Ionicons name="briefcase-outline" size={20} color={theme.primary} />
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
              My Assignments
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </Pressable>
        )}
        <Pressable
          style={[styles.menuRow, { borderBottomColor: theme.borderLight }]}
          onPress={() => navigation.navigate("CartTab")}
        >
          <Ionicons name="cart-outline" size={20} color={theme.primary} />
          <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
            My Cart
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </Pressable>
        <Pressable
          style={[styles.menuRow, { borderBottomColor: theme.borderLight }]}
          onPress={() => navigation.navigate("BookingTab")}
        >
          <Ionicons name="calendar-outline" size={20} color={theme.primary} />
          <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
            My Bookings
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </Pressable>
        <Pressable
          style={styles.menuRow}
          onPress={() => navigation.navigate("Chat")}
        >
          <Ionicons name="chatbubbles-outline" size={20} color={theme.primary} />
          <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
            Chat with Support
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </Pressable>
      </AppCard>

      {/* Recent Orders */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        Recent Orders
      </Text>
      {orders.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          No orders yet
        </Text>
      ) : (
        orders.map((order) => (
          <AppCard key={order._id} elevation={1}>
            <View style={styles.orderRow}>
              <Ionicons
                name={statusIcons[order.status] || "ellipse-outline"}
                size={22}
                color={theme.primary}
              />
              <View style={styles.orderInfo}>
                <Text style={[styles.orderId, { color: theme.textPrimary }]}>
                  #{order._id?.slice(-6).toUpperCase()}
                </Text>
                <Text style={[styles.orderStatus, { color: theme.textSecondary }]}>
                  {order.status} • Rs. {order.totalPrice}
                </Text>
              </View>
            </View>
          </AppCard>
        ))
      )}

      {/* Logout */}
      <AppButton
        title="Sign Out"
        variant="outline"
        onPress={handleLogout}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 },
  profileHeader: { alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    alignItems: "center",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    marginBottom: 12,
    width: 80,
  },
  userName: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold },
  userEmail: { fontSize: fonts.sizes.md, marginTop: 2 },
  roleBadge: { borderRadius: 12, marginTop: 8, paddingHorizontal: 14, paddingVertical: 4 },
  roleText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    textTransform: "capitalize",
  },
  radioCard: { paddingHorizontal: 0, paddingVertical: 0, marginBottom: 20 },
  radioRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  radioLabel: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.medium },
  radioOuter: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  radioInner: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  menuCard: { paddingHorizontal: 0, paddingVertical: 0 },
  menuRow: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuLabel: { flex: 1, fontSize: fonts.sizes.md, marginLeft: 12 },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    marginBottom: 10,
    marginTop: 20,
  },
  emptyText: { fontSize: fonts.sizes.md, textAlign: "center" },
  orderRow: { alignItems: "center", flexDirection: "row" },
  orderInfo: { flex: 1, marginLeft: 12 },
  orderId: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.semibold },
  orderStatus: { fontSize: fonts.sizes.sm, marginTop: 2, textTransform: "capitalize" },
});

export default memo(ProfileScreen);
