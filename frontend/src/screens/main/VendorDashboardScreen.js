import { memo } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import AppCard from "../../components/common/AppCard";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";

function VendorDashboardScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Seller Central</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Vendor Dashboard</Text>
      </View>

      <View style={styles.statsGrid}>
        <AppCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Products</Text>
        </AppCard>
        <AppCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.success }]}>Rs. 0</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Sales</Text>
        </AppCard>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Orders</Text>
      <AppCard style={styles.emptyCard}>
        <Ionicons name="cart-outline" size={40} color={theme.textMuted} />
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No orders yet</Text>
      </AppCard>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Inventory Alerts</Text>
      <AppCard style={styles.emptyCard}>
        <Ionicons name="alert-circle-outline" size={40} color={theme.textMuted} />
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>Stock levels are healthy</Text>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: fonts.weights.bold },
  subtitle: { fontSize: 14, marginTop: 4 },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 20 },
  statValue: { fontSize: 22, fontWeight: fonts.weights.bold },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: fonts.weights.bold, marginBottom: 12, marginTop: 10 },
  emptyCard: { alignItems: "center", paddingVertical: 40, borderStyle: "dashed", borderWidth: 1 },
  emptyText: { marginTop: 12, fontSize: 14 },
});

export default memo(VendorDashboardScreen);
