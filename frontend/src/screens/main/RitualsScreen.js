import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import AppCard from "../../components/common/AppCard";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { searchRituals } from "../../services/api";

const CATEGORIES = [
  { key: null, label: "All" },
  { key: "daily", label: "Daily" },
  { key: "festival", label: "Festival" },
  { key: "ceremony", label: "Ceremony" },
  { key: "wedding", label: "Wedding" },
  { key: "funeral", label: "Funeral" },
  { key: "other", label: "Other" },
];

const RELIGIONS = [
  { key: null, label: "All" },
  { key: "hindu", label: "Hindu" },
  { key: "buddhist", label: "Buddhist" },
];

function RitualsScreen({ navigation }) {
  const { theme } = useTheme();
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeReligion, setActiveReligion] = useState(null);
  const searchTimeout = useRef(null);

  const loadRituals = useCallback(
    async (p = 1, reset = false) => {
      try {
        const res = await searchRituals({
          search: searchText || undefined,
          category: activeCategory || undefined,
          religion: activeReligion || undefined,
          page: p,
          limit: 10,
        });
        const list = res.rituals || res.data || [];
        setRituals((prev) => (reset ? list : [...prev, ...list]));
        setHasMore(list.length === 10);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchText, activeCategory, activeReligion]
  );

  // Reload whenever filters change
  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadRituals(1, true);
  }, [loadRituals]);

  // Debounced search
  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      // The useEffect on loadRituals will trigger automatically
    }, 400);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadRituals(1, true);
  }, [loadRituals]);

  const onEndReached = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    loadRituals(next, false);
  }, [hasMore, loading, page, loadRituals]);

  const getCategoryIcon = (category) => {
    const icons = {
      daily: "sunny-outline",
      festival: "sparkles-outline",
      ceremony: "ribbon-outline",
      wedding: "heart-outline",
      funeral: "flower-outline",
      other: "ellipsis-horizontal-outline",
    };
    return icons[category] || "flame-outline";
  };

  const renderRitual = useCallback(
    ({ item }) => (
      <AppCard
        onPress={() =>
          navigation.navigate("RitualDetail", { ritualId: item._id })
        }
        elevation={2}
        style={styles.ritualCard}
      >
        <View style={styles.ritualRow}>
          <View
            style={[
              styles.ritualIcon,
              { backgroundColor: theme.primaryLight + "30" },
            ]}
          >
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={24}
              color={theme.primary}
            />
          </View>
          <View style={styles.ritualInfo}>
            <Text
              style={[styles.ritualTitle, { color: theme.textPrimary }]}
              numberOfLines={2}
            >
              {item.title || item.name}
            </Text>
            <Text
              style={[styles.ritualDesc, { color: theme.textSecondary }]}
              numberOfLines={2}
            >
              {item.description || item.meaning || "Explore this sacred ritual"}
            </Text>
            <View style={styles.tagRow}>
              {item.category ? (
                <View
                  style={[styles.tag, { backgroundColor: theme.primary + "18" }]}
                >
                  <Text style={[styles.tagText, { color: theme.primary }]}>
                    {item.category}
                  </Text>
                </View>
              ) : null}
              {item.religion ? (
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: theme.accent + "18", marginLeft: 6 },
                  ]}
                >
                  <Text style={[styles.tagText, { color: theme.accent }]}>
                    {item.religion}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </View>
      </AppCard>
    ),
    [theme, navigation]
  );

  const ListHeader = (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search rituals..."
          placeholderTextColor={theme.textMuted}
          value={searchText}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.textMuted}
            />
          </Pressable>
        )}
      </View>

      {/* Religion Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipScrollContent}
      >
        {RELIGIONS.map((r) => {
          const active = activeReligion === r.key;
          return (
            <Pressable
              key={r.label}
              onPress={() => setActiveReligion(r.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? theme.primary
                    : theme.surface,
                  borderColor: active ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? theme.textOnPrimary : theme.textSecondary },
                ]}
              >
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipScrollContent}
      >
        {CATEGORIES.map((c) => {
          const active = activeCategory === c.key;
          return (
            <Pressable
              key={c.label}
              onPress={() => setActiveCategory(c.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? theme.accent
                    : theme.surface,
                  borderColor: active ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? theme.textOnPrimary : theme.textSecondary },
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  if (loading && rituals.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {ListHeader}
        <ListSkeleton count={6} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.listContent}
      data={rituals}
      renderItem={renderRitual}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons
            name="search-outline"
            size={48}
            color={theme.textMuted}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.empty, { color: theme.textMuted }]}>
            {searchText || activeCategory || activeReligion
              ? "No rituals match your filters"
              : "No rituals found"}
          </Text>
        </View>
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
      initialNumToRender={8}
      maxToRenderPerBatch={6}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  headerContainer: { paddingTop: 12, marginBottom: 4 },

  // Search
  searchBar: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: fonts.sizes.md, padding: 0 },

  // Chips
  chipScroll: { marginTop: 10 },
  chipScrollContent: { gap: 8, paddingRight: 8 },
  chip: {
    borderRadius: 20,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
  },

  // Ritual list items
  ritualCard: { paddingVertical: 12 },
  ritualRow: { alignItems: "center", flexDirection: "row" },
  ritualIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  ritualInfo: { flex: 1, marginLeft: 14 },
  ritualTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    marginBottom: 3,
  },
  ritualDesc: { fontSize: fonts.sizes.sm, lineHeight: 18, marginBottom: 4 },
  tagRow: { flexDirection: "row", alignItems: "center" },
  tag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: fonts.sizes.xs, fontWeight: fonts.weights.medium, textTransform: "capitalize" },

  // Empty state
  emptyContainer: { alignItems: "center", marginTop: 60 },
  empty: { fontSize: fonts.sizes.md, textAlign: "center" },
});

export default memo(RitualsScreen);
