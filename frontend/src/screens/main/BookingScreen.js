import { memo, useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
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
import { fetchBookings, fetchProviders, createBooking } from "../../services/api";

function BookingScreen({ navigation }) {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Booking Modal State
  const [showProviders, setShowProviders] = useState(false);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

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

  const loadProvidersList = useCallback(async () => {
    setLoadingProviders(true);
    try {
      const res = await fetchProviders();
      setProviders(res.data || []);
    } catch {
      Alert.alert("Error", "Could not load providers.");
      setShowProviders(false);
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  const openBookModal = () => {
    setShowProviders(true);
    loadProvidersList();
  };

  const submitBooking = async (providerId) => {
    try {
      // For now, book them for tomorrow at 10 AM default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      await createBooking({
        panditOrLama: providerId,
        dateTime: tomorrow.toISOString(),
      });
      setShowProviders(false);
      Alert.alert("Success", "Booking placed successfully!");
      loadBookings();
    } catch (e) {
      Alert.alert("Error", e.message || "Could not place booking.");
    }
  };

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
            onPress={openBookModal}
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

      <Modal
        visible={showProviders}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProviders(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.borderLight }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Available Providers</Text>
            <Pressable onPress={() => setShowProviders(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </Pressable>
          </View>
          
          {loadingProviders ? (
            <View style={{ padding: 16, flex: 1 }}><ListSkeleton count={4} /></View>
          ) : (
            <FlatList
              data={providers}
              keyExtractor={(p) => p._id}
              contentContainerStyle={{ padding: 16, gap: 12 }}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", marginTop: 40, color: theme.textSecondary }}>
                  No verified providers available right now.
                </Text>
              }
              renderItem={({ item }) => (
                <View style={[styles.providerCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                  <View style={styles.providerInfo}>
                    <Text style={[styles.providerName, { color: theme.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.providerRole, { color: theme.textSecondary }]}>
                      {item.role} • {item.religionPreference}
                    </Text>
                    {item.specialization ? (
                      <Text style={[styles.providerSpec, { color: theme.textMuted }]}>{item.specialization}</Text>
                    ) : null}
                  </View>
                  <AppButton 
                    title="Book" 
                    size="sm" 
                    onPress={() => submitBooking(item._id)} 
                  />
                </View>
              )}
            />
          )}
        </View>
      </Modal>
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
  modalContainer: { flex: 1 },
  modalHeader: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  closeBtn: { position: "absolute", right: 16 },
  providerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  providerInfo: { flex: 1, paddingRight: 10 },
  providerName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  providerRole: { fontSize: 13, textTransform: "capitalize" },
  providerSpec: { fontSize: 12, marginTop: 4, fontStyle: "italic" },
});

export default memo(BookingScreen);
