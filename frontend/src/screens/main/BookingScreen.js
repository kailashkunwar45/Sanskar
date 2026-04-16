import { memo, useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import AppCard from "../../components/common/AppCard";
import AppButton from "../../components/common/AppButton";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { fetchBookings } from "../../services/api";

function BookingScreen({ navigation }) {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const res = await fetchBookings();
      setBookings(res.data || res.bookings || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings();
  }, [loadBookings]);

  const statusColors = {
    pending: theme.warning,
    confirmed: theme.success,
    completed: theme.info,
    cancelled: theme.danger,
  };

  const renderBooking = useCallback(
    ({ item }) => (
      <AppCard elevation={2}>
        <View style={styles.bookingRow}>
          <View
            style={[
              styles.bookingIcon,
              { backgroundColor: theme.primaryLight + "30" },
            ]}
          >
            <Ionicons name="person-outline" size={24} color={theme.primary} />
          </View>
          <View style={styles.bookingInfo}>
            <Text style={[styles.bookingTitle, { color: theme.textPrimary }]}>
              Pandit/Lama Booking
            </Text>
            <Text style={[styles.bookingDate, { color: theme.textSecondary }]}>
              {new Date(item.dateTime).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: (statusColors[item.status] || theme.textMuted) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusColors[item.status] || theme.textMuted },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </AppCard>
    ),
    [theme, statusColors]
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ListSkeleton count={5} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <AppButton
            title="+ Book a Pandit / Lama"
            onPress={() =>
              Alert.alert(
                "Booking Setup",
                "Provider selection UI is coming next. You can already view booking status here."
              )
            }
            size="lg"
            style={{ marginBottom: 16 }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={56} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No bookings yet
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 16 },
  bookingRow: { alignItems: "center", flexDirection: "row" },
  bookingIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  bookingInfo: { flex: 1, marginLeft: 14 },
  bookingTitle: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.semibold },
  bookingDate: { fontSize: fonts.sizes.sm, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.semibold,
    textTransform: "capitalize",
  },
  emptyWrap: { alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: fonts.sizes.lg, marginTop: 12 },
});

export default memo(BookingScreen);
