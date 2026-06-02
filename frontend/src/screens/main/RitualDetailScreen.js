import { memo, useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import fonts from "../../theme/fonts";
import { fetchRitualById, bulkAddToCart } from "../../services/api";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import AppCard from "../../components/common/AppCard";
import AppButton from "../../components/common/AppButton";

function RitualDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { isGuest, logout } = useAuth();
  const { ritualId } = route.params;
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchRitualById(ritualId);
        setRitual(res.data || res.ritual || res);
      } catch {
        Alert.alert("Error", "Unable to load ritual details right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, [ritualId]);

  const handleBuyAllItems = useCallback(async () => {
    if (isGuest) {
      Alert.alert(
        "Sign In Required",
        "You need to be signed in to purchase items.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: logout },
        ]
      );
      return;
    }
    if (!ritual?.linkedProducts || ritual.linkedProducts.length === 0) {
      Alert.alert("Notice", "No purchasable items linked to this ritual yet.");
      return;
    }

    setCheckingOut(true);
    try {
      const productIds = ritual.linkedProducts.map((p) =>
        typeof p === "object" ? p._id : p
      );
      await bulkAddToCart(productIds);
      Alert.alert(
        "Added to Cart",
        "All available items have been added to your cart.",
        [
          { text: "Go to Cart", onPress: () => navigation.navigate("CartTab") },
          { text: "Continue", style: "cancel" },
        ]
      );
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to add items to cart.");
    } finally {
      setCheckingOut(false);
    }
  }, [navigation, ritual, isGuest, logout]);

  const handleBookPanditLama = useCallback(() => {
    if (isGuest) {
      Alert.alert(
        "Sign In Required",
        "You need to be signed in to book a Pandit or Lama.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: logout },
        ]
      );
      return;
    }
    setBooking(true);
    navigation.navigate("BookingTab");
    setBooking(false);
  }, [navigation, isGuest, logout]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ListSkeleton count={4} />
      </View>
    );
  }

  if (!ritual) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          Ritual not found
        </Text>
      </View>
    );
  }

  const steps = ritual.steps || ritual.procedure || [];
  const items = ritual.items || ritual.requiredItems || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title + meta */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.primaryLight + "30" },
            ]}
          >
            <Ionicons name="flame-outline" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {ritual.title || ritual.name}
          </Text>
          {ritual.shortDescription ? (
            <Text
              style={[styles.subtitle, { color: theme.textSecondary }]}
              numberOfLines={3}
            >
              {ritual.shortDescription}
            </Text>
          ) : null}
        </View>

        {/* Meaning / description */}
        {ritual.description ? (
          <AppCard elevation={2}>
            <Text
              style={[styles.sectionTitle, { color: theme.textPrimary }]}
            >
              Meaning
            </Text>
            <Text
              style={[styles.description, { color: theme.textSecondary }]}
            >
              {ritual.description}
            </Text>
          </AppCard>
        ) : null}

        {/* Required items */}
        {items.length > 0 && (
          <AppCard elevation={2}>
            <Text
              style={[styles.sectionTitle, { color: theme.textPrimary }]}
            >
              Required Items
            </Text>
            {items.map((item, idx) => (
              <View key={idx} style={styles.checkRow}>
                <Ionicons
                  name="checkbox-outline"
                  size={18}
                  color={theme.primary}
                />
                <Text
                  style={[styles.checkLabel, { color: theme.textPrimary }]}
                >
                  {typeof item === "string" ? item : item.name || item.label}
                </Text>
              </View>
            ))}
          </AppCard>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <AppCard elevation={2}>
            <Text
              style={[styles.sectionTitle, { color: theme.textPrimary }]}
            >
              Step-by-step Guide
            </Text>
            {steps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepIndex,
                    { backgroundColor: theme.primaryLight + "40" },
                  ]}
                >
                  <Text
                    style={[styles.stepIndexText, { color: theme.primary }]}
                  >
                    {idx + 1}
                  </Text>
                </View>
                <Text
                  style={[styles.stepText, { color: theme.textSecondary }]}
                >
                  {typeof step === "string" ? step : step.text || step.title}
                </Text>
              </View>
            ))}
          </AppCard>
        )}
      </ScrollView>

      {/* CTA buttons */}
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ]}
      >
        <AppButton
          title="Buy All Items"
          onPress={handleBuyAllItems}
          loading={checkingOut}
          size="md"
          style={{ flex: 1, marginRight: 8 }}
        />
        <AppButton
          title="Book Pandit / Lama"
          onPress={handleBookPanditLama}
          loading={booking}
          size="md"
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 16 },
  header: { alignItems: "center", marginBottom: 16 },
  iconCircle: {
    alignItems: "center",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    marginBottom: 12,
    width: 80,
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: fonts.sizes.sm,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    marginBottom: 8,
  },
  description: {
    fontSize: fonts.sizes.md,
    lineHeight: 22,
  },
  checkRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 6,
  },
  checkLabel: {
    fontSize: fonts.sizes.sm,
    marginLeft: 8,
  },
  stepRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  stepIndex: {
    alignItems: "center",
    borderRadius: 999,
    height: 26,
    justifyContent: "center",
    marginRight: 10,
    width: 26,
  },
  stepIndexText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
  },
  stepText: {
    flex: 1,
    fontSize: fonts.sizes.sm,
    lineHeight: 20,
  },
  footer: {
    alignItems: "center",
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "absolute",
    right: 0,
  },
  errorText: { fontSize: fonts.sizes.lg },
});

export default memo(RitualDetailScreen);

