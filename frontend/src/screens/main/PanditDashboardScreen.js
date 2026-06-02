import { memo, useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import AppCard from "../../components/common/AppCard";
import AppButton from "../../components/common/AppButton";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { fetchBookings, updateBooking } from "../../services/api";

function PanditDashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyBookings = useCallback(async () => {
    try {
      const res = await fetchBookings();
      setBookings(res.data || res.bookings || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyBookings();
  }, [loadMyBookings]);

  if (loading) return <ListSkeleton count={5} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Ionicons name="briefcase-outline" size={32} color={theme.primary} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>My Assignments</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Pandit POV (Assigned to Me)</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <AppCard elevation={2} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={[styles.userText, { color: theme.textPrimary }]}>
                  Ritual for: {item.user?.name || 'Customer'}
                </Text>
                <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                  {new Date(item.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: theme.success + '20' }]}>
                <Text style={{ color: theme.success, fontSize: 11, fontWeight: 'bold' }}>{item.status}</Text>
              </View>
            </View>
            <AppButton 
              title="Update Status" 
              size="sm" 
              variant="outline" 
              style={styles.actionBtn}
            />
          </AppCard>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.textMuted }}>No assignments yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  subtitle: { fontSize: 14 },
  card: { marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1 },
  userText: { fontSize: 16, fontWeight: 'bold' },
  dateText: { fontSize: 13, marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  actionBtn: { marginTop: 12, alignSelf: 'flex-start' },
  empty: { alignItems: 'center', marginTop: 40 }
});

export default memo(PanditDashboardScreen);
