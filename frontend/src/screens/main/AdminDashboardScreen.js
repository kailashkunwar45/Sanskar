import { memo, useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import AppCard from "../../components/common/AppCard";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { fetchBookings, fetchPendingProviders, verifyProvider } from "../../services/api";
import AppButton from "../../components/common/AppButton";

function AdminDashboardScreen() {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBookings: 0, pending: 0, confirmed: 0 });

  const loadAllData = useCallback(async () => {
    try {
      const res = await fetchBookings();
      const provRes = await fetchPendingProviders();
      const data = res.data || res.bookings || [];
      setBookings(data);
      setPendingProviders(provRes.data || []);
      
      // Calculate simple stats
      setStats({
        totalBookings: data.length,
        pending: data.filter(b => b.status === 'pending').length,
        confirmed: data.filter(b => b.status === 'confirmed').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleVerify = async (id) => {
    try {
      await verifyProvider(id);
      loadAllData(); // Refresh list after verification
    } catch {
      // Handle error gracefully
    }
  };

  if (loading) return <ListSkeleton count={5} />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Platform Overview</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Admin View (All Bookings)</Text>
      </View>

      <View style={styles.statsGrid}>
        <AppCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{stats.totalBookings}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Bookings</Text>
        </AppCard>
        <AppCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.warning }]}>{stats.pending}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Pending</Text>
        </AppCard>
      </View>

      {/* Pending Providers Section */}
      {pendingProviders.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Pending Approvals ({pendingProviders.length})
          </Text>
          {pendingProviders.map(provider => (
            <AppCard key={provider._id} style={[styles.bookingItem, { borderColor: theme.warning }]}>
              <View style={styles.row}>
                <Ionicons name="shield-checkmark" size={24} color={theme.warning} />
                <View style={styles.info}>
                  <Text style={[styles.userText, { color: theme.textPrimary }]}>{provider.name}</Text>
                  <Text style={[styles.panditText, { color: theme.textSecondary, textTransform: 'capitalize' }]}>
                    Role: {provider.role} | Religion: {provider.religionPreference}
                  </Text>
                </View>
                <AppButton 
                  title="Approve" 
                  size="sm" 
                  onPress={() => handleVerify(provider._id)}
                  style={{ paddingHorizontal: 12, borderRadius: 6 }} 
                />
              </View>
            </AppCard>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Activity</Text>
      {bookings.length === 0 ? (
        <Text style={styles.empty}>No bookings on platform</Text>
      ) : (
        bookings.map(item => (
          <AppCard key={item._id} style={styles.bookingItem}>
            <View style={styles.row}>
              <Ionicons name="calendar" size={20} color={theme.primary} />
              <View style={styles.info}>
                <Text style={[styles.userText, { color: theme.textPrimary }]}>
                  Customer: {item.user?.name || 'Unknown'}
                </Text>
                <Text style={[styles.panditText, { color: theme.textSecondary }]}>
                  Pandit: {item.panditOrLama?.name || 'Unassigned'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={{ color: theme.primary, fontSize: 10 }}>{item.status}</Text>
              </View>
            </View>
          </AppCard>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  bookingItem: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  userText: { fontSize: 14, fontWeight: '600' },
  panditText: { fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' }
});

export default memo(AdminDashboardScreen);
