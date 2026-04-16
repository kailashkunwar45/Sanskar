import { memo, useCallback, useEffect, useState } from "react";
import {
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
import AppCard from "../../components/common/AppCard";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { fetchDailyQuote, fetchQuickLinks, fetchTodaySpecial } from "../../services/api";

function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [quote, setQuote] = useState(null);
  const [special, setSpecial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const quickLinks = [
    { id: "articles", icon: "document-text-outline", label: "Articles", screen: "Articles" },
    { id: "products", icon: "storefront-outline", label: "Products", screen: "ProductsTab" },
    { id: "rituals", icon: "book-outline", label: "Rituals", screen: "RitualsTab" },
    { id: "booking", icon: "people-outline", label: "Booking", screen: "BookingTab" },
    { id: "calendar", icon: "calendar-outline", label: "Calendar", screen: "Calendar" },
  ];

  const loadHomeData = useCallback(async () => {
    try {
      const [quoteRes, specialRes] = await Promise.allSettled([
        fetchDailyQuote(),
        fetchTodaySpecial(),
      ]);
      if (quoteRes.status === "fulfilled") setQuote(quoteRes.value);
      if (specialRes.status === "fulfilled") setSpecial(specialRes.value);
    } catch {
      // silent — data is optional
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHomeData();
  }, [loadHomeData]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ListSkeleton count={6} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <View>
          <Text style={[styles.greetLabel, { color: theme.textSecondary }]}>
            卐 Namaste 🙏
          </Text>
          <Text style={[styles.greetName, { color: theme.textPrimary }]}>
            {user?.name || "Guest"}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("ProfileTab")}
          style={[styles.avatar, { backgroundColor: theme.primaryLight + "40" }]}
        >
          <Ionicons name="person" size={22} color={theme.primary} />
        </Pressable>
      </View>

      {/* Daily Quote Card */}
      {quote?.quote ? (
        <AppCard style={[styles.quoteCard, { backgroundColor: theme.primary + "12" }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.primary} />
          <Text style={[styles.quoteText, { color: theme.textPrimary }]}>
            "{quote.quote.text || quote.quote}"
          </Text>
          {quote.quote.author ? (
            <Text style={[styles.quoteAuthor, { color: theme.textSecondary }]}>
              — {quote.quote.author}
            </Text>
          ) : null}
        </AppCard>
      ) : null}

      {/* Quick Navigation */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        Quick Access
      </Text>
      <View style={styles.quickGrid}>
        {quickLinks.map((link) => (
          <Pressable
            key={link.id}
            onPress={() => navigation.navigate(link.screen)}
            style={({ pressed }) => [
              styles.quickItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderLight,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.quickIcon,
                { backgroundColor: theme.primaryLight + "30" },
              ]}
            >
              <Ionicons name={link.icon} size={24} color={theme.primary} />
            </View>
            <Text style={[styles.quickLabel, { color: theme.textPrimary }]}>
              {link.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Today's Special */}
      {special?.special ? (
        <>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Today's Special
          </Text>
          <AppCard elevation={2}>
            <Text style={[styles.specialTitle, { color: theme.primary }]}>
              {special.special.title || "Religious Highlight"}
            </Text>
            <Text style={[styles.specialDesc, { color: theme.textSecondary }]}>
              {special.special.description || "Discover today's religious significance."}
            </Text>
          </AppCard>
        </>
      ) : null}

      {/* Explore Cards */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        Explore
      </Text>
      <AppCard
        onPress={() => navigation.navigate("ProductsTab")}
        elevation={2}
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <Ionicons name="bag-handle-outline" size={28} color={theme.primary} />
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={[styles.exploreTitle, { color: theme.textPrimary }]}>
            Sacred Shop
          </Text>
          <Text style={[styles.exploreDesc, { color: theme.textSecondary }]}>
            Browse pooja items, statues & more
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </AppCard>
      <AppCard
        onPress={() => navigation.navigate("RitualsTab")}
        elevation={2}
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <Ionicons name="flame-outline" size={28} color={theme.primary} />
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={[styles.exploreTitle, { color: theme.textPrimary }]}>
            Rituals & Guides
          </Text>
          <Text style={[styles.exploreDesc, { color: theme.textSecondary }]}>
            Step-by-step for every ceremony
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16 },
  greeting: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greetLabel: { fontSize: fonts.sizes.md },
  greetName: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold },
  avatar: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  quoteCard: { paddingVertical: 16 },
  quoteText: {
    fontSize: fonts.sizes.md,
    fontStyle: "italic",
    lineHeight: 22,
    marginTop: 8,
  },
  quoteAuthor: { fontSize: fonts.sizes.sm, marginTop: 6, textAlign: "right" },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    marginBottom: 12,
    marginTop: 20,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickItem: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
    width: "47%",
  },
  quickIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    marginBottom: 8,
    width: 48,
  },
  quickLabel: { fontSize: fonts.sizes.sm, fontWeight: fonts.weights.semibold },
  specialTitle: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold, marginBottom: 4 },
  specialDesc: { fontSize: fonts.sizes.sm, lineHeight: 20 },
  exploreTitle: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.semibold },
  exploreDesc: { fontSize: fonts.sizes.sm },
});

export default memo(HomeScreen);
