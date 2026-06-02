import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import AppCard from "../../components/common/AppCard";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import { fetchArticles, searchRituals } from "../../services/api";
import fonts from "../../theme/fonts";

const LIFECYCLE_FILTERS = [
  "all",
  "birth",
  "education",
  "marriage",
  "death",
  "festival",
  "wellness",
];

const RITUAL_CATEGORIES = [
  { key: "festival", label: "Festival", icon: "sparkles-outline" },
  { key: "daily", label: "Daily", icon: "sunny-outline" },
  { key: "ceremony", label: "Ceremony", icon: "ribbon-outline" },
  { key: "wedding", label: "Wedding", icon: "heart-outline" },
  { key: "funeral", label: "Funeral", icon: "flower-outline" },
  { key: "other", label: "Other", icon: "ellipsis-horizontal-outline" },
];

const CULTURES = [
  {
    key: "hindu",
    label: "Hindu Rituals",
    subtitle: "सनातन धर्म",
    icon: "flame-outline",
    color: "#FF6B35",
    gradientBg: "#FFF3EE",
  },
  {
    key: "buddhist",
    label: "Buddhist Rituals",
    subtitle: "बौद्ध धर्म",
    icon: "leaf-outline",
    color: "#7B4EAB",
    gradientBg: "#F5EEFF",
  },
];

function detectLifecycle(article) {
  const text = `${article?.title || ""} ${article?.content || ""}`.toLowerCase();
  if (/(janma|birth|naming|baby|bratabandha|mundan)/.test(text)) return "birth";
  if (/(study|education|vidya|saraswati|exam)/.test(text)) return "education";
  if (/(marriage|wedding|bihe|vivah)/.test(text)) return "marriage";
  if (/(death|funeral|shraddha|antyeshti|memorial)/.test(text)) return "death";
  if (article?.category === "festival") return "festival";
  if (article?.category === "wellness") return "wellness";
  return "other";
}

function normalizeArticlesResponse(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.articles)) return res.articles;
  if (Array.isArray(res)) return res;
  return [];
}

function ArticlesScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  // Ritual browser state
  const [selectedCulture, setSelectedCulture] = useState(null); // 'hindu' | 'buddhist' | null
  const [previewRituals, setPreviewRituals] = useState([]);
  const [ritualsLoading, setRitualsLoading] = useState(false);

  const loadArticles = useCallback(async () => {
    try {
      const response = await fetchArticles(1, 200);
      const list = normalizeArticlesResponse(response);
      setAllArticles(list);
    } catch {
      // silent fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Load preview rituals when culture is selected
  useEffect(() => {
    if (!selectedCulture) {
      setPreviewRituals([]);
      return;
    }
    setRitualsLoading(true);
    searchRituals({ religion: selectedCulture, limit: 4 })
      .then((res) => {
        setPreviewRituals(res.rituals || res.data || []);
      })
      .catch(() => setPreviewRituals([]))
      .finally(() => setRitualsLoading(false));
  }, [selectedCulture]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadArticles();
  }, [loadArticles]);

  const visibleArticles = useMemo(() => {
    if (filter === "all") return allArticles;
    return allArticles.filter((a) => detectLifecycle(a) === filter);
  }, [allArticles, filter]);

  const handleCultureSelect = useCallback((cultureKey) => {
    setSelectedCulture((prev) => (prev === cultureKey ? null : cultureKey));
  }, []);

  const handleCategoryPress = useCallback(
    (categoryKey) => {
      navigation.navigate("Rituals", {
        religion: selectedCulture,
        category: categoryKey,
      });
    },
    [navigation, selectedCulture]
  );

  const renderArticleItem = useCallback(
    ({ item }) => (
      <AppCard
        onPress={() => navigation.navigate("ArticleDetail", { articleId: item._id })}
        elevation={2}
      >
        <View style={styles.articleRow}>
          <View
            style={[
              styles.articleIcon,
              { backgroundColor: theme.primaryLight + "30" },
            ]}
          >
            <Ionicons name="document-text-outline" size={22} color={theme.primary} />
          </View>
          <View style={styles.articleInfo}>
            <Text
              style={[styles.articleTitle, { color: theme.textPrimary }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.articleSnippet, { color: theme.textSecondary }]}
              numberOfLines={2}
            >
              {item.content || "Tap to read complete ritual guidance."}
            </Text>
            <Text style={[styles.articleMeta, { color: theme.primary }]}>
              {detectLifecycle(item)} - {item.religion || "general"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </View>
      </AppCard>
    ),
    [navigation, theme]
  );

  // ── Rituals Section ──────────────────────────────────────────────
  const renderRitualsSection = useCallback(
    () => (
      <View style={styles.ritualSection}>
        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              🕉️ Explore Rituals
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Browse sacred practices by tradition
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("Rituals")}
            style={[styles.viewAllBtn, { borderColor: theme.primary }]}
          >
            <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
          </Pressable>
        </View>

        {/* Culture Cards */}
        <View style={styles.cultureRow}>
          {CULTURES.map((culture) => {
            const isActive = selectedCulture === culture.key;
            return (
              <Pressable
                key={culture.key}
                onPress={() => handleCultureSelect(culture.key)}
                style={[
                  styles.cultureCard,
                  {
                    backgroundColor: isActive ? culture.color : theme.surface,
                    borderColor: isActive ? culture.color : theme.border,
                    shadowColor: isActive ? culture.color : "transparent",
                  },
                ]}
              >
                <View
                  style={[
                    styles.cultureIconWrap,
                    {
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.25)"
                        : culture.gradientBg,
                    },
                  ]}
                >
                  <Ionicons
                    name={culture.icon}
                    size={26}
                    color={isActive ? "#fff" : culture.color}
                  />
                </View>
                <Text
                  style={[
                    styles.cultureLabel,
                    { color: isActive ? "#fff" : theme.textPrimary },
                  ]}
                >
                  {culture.label}
                </Text>
                <Text
                  style={[
                    styles.cultureSubtitle,
                    { color: isActive ? "rgba(255,255,255,0.8)" : theme.textMuted },
                  ]}
                >
                  {culture.subtitle}
                </Text>
                <View
                  style={[
                    styles.cultureArrow,
                    { backgroundColor: isActive ? "rgba(255,255,255,0.2)" : theme.primaryLight + "18" },
                  ]}
                >
                  <Ionicons
                    name={isActive ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={isActive ? "#fff" : theme.primary}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Category Grid — shown when culture selected */}
        {selectedCulture && (
          <View style={styles.categoryPanel}>
            <Text style={[styles.categoryPanelTitle, { color: theme.textSecondary }]}>
              {selectedCulture === "hindu" ? "🪔" : "🙏"} Select a ritual category
            </Text>
            <View style={styles.categoryGrid}>
              {RITUAL_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => handleCategoryPress(cat.key)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Ionicons name={cat.icon} size={18} color={theme.primary} />
                  <Text
                    style={[styles.categoryChipLabel, { color: theme.textPrimary }]}
                  >
                    {cat.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={theme.textMuted}
                  />
                </Pressable>
              ))}
            </View>

            {/* Quick peek: top rituals for selected culture */}
            {ritualsLoading ? (
              <View style={{ paddingVertical: 12 }}>
                <Text style={{ color: theme.textMuted, fontSize: 12, textAlign: "center" }}>
                  Loading rituals...
                </Text>
              </View>
            ) : previewRituals.length > 0 ? (
              <View style={styles.previewList}>
                <Text style={[styles.previewTitle, { color: theme.textSecondary }]}>
                  Featured {selectedCulture === "hindu" ? "Hindu" : "Buddhist"} Rituals
                </Text>
                {previewRituals.map((ritual) => (
                  <Pressable
                    key={ritual._id}
                    onPress={() =>
                      navigation.navigate("RitualDetail", { ritualId: ritual._id })
                    }
                    style={[
                      styles.previewItem,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.previewIcon,
                        { backgroundColor: theme.primaryLight + "20" },
                      ]}
                    >
                      <Ionicons
                        name="flame-outline"
                        size={18}
                        color={theme.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.previewItemTitle, { color: theme.textPrimary }]}
                        numberOfLines={1}
                      >
                        {ritual.title}
                      </Text>
                      <Text
                        style={[styles.previewItemCat, { color: theme.textMuted }]}
                        numberOfLines={1}
                      >
                        {ritual.category} • {ritual.religion}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.textMuted}
                    />
                  </Pressable>
                ))}
                <Pressable
                  onPress={() =>
                    navigation.navigate("Rituals", { religion: selectedCulture })
                  }
                  style={[
                    styles.browseMoreBtn,
                    { backgroundColor: theme.primaryLight + "18" },
                  ]}
                >
                  <Text style={[styles.browseMoreText, { color: theme.primary }]}>
                    Browse all {selectedCulture === "hindu" ? "Hindu" : "Buddhist"} rituals →
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      </View>
    ),
    [
      selectedCulture,
      handleCultureSelect,
      handleCategoryPress,
      theme,
      navigation,
      previewRituals,
      ritualsLoading,
    ]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerWrap}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Articles &amp; Knowledge
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Curated guidance for {user?.religionPreference || "your"} spiritual journey
        </Text>

        {/* Lifecycle Filter Row */}
        <FlatList
          data={LIFECYCLE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setFilter(item)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === item ? theme.primary : theme.surface,
                  borderColor: filter === item ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={{
                  color: filter === item ? theme.textOnPrimary : theme.textSecondary,
                  fontSize: fonts.sizes.sm,
                  fontWeight: fonts.weights.medium,
                  textTransform: "capitalize",
                }}
              >
                {item}
              </Text>
            </Pressable>
          )}
        />

        {/* Rituals Explorer Section */}
        {renderRitualsSection()}

        {/* Articles section divider */}
        <View style={[styles.divider, { borderColor: theme.border }]}>
          <Text style={[styles.dividerLabel, { color: theme.textSecondary }]}>
            📖 Articles
          </Text>
        </View>
      </View>
    ),
    [filter, theme, user?.religionPreference, renderRitualsSection]
  );

  if (loading && allArticles.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <ListSkeleton count={6} />
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.listContent}
      data={visibleArticles}
      renderItem={renderArticleItem}
      keyExtractor={(item, index) => item._id || String(index)}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text style={[styles.emptyText, { color: theme.textMuted, marginBottom: 12 }]}>
            No articles available for this category
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
      initialNumToRender={8}
      maxToRenderPerBatch={6}
      windowSize={5}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  headerWrap: { marginTop: 12, marginBottom: 8 },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
  },
  headerSubtitle: {
    fontSize: fonts.sizes.sm,
    marginTop: 4,
    marginBottom: 12,
  },
  filterRow: { gap: 8, paddingRight: 12 },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },

  // ── Ritual Section ──
  ritualSection: { marginTop: 20 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
  },
  sectionSubtitle: {
    fontSize: fonts.sizes.xs,
    marginTop: 2,
  },
  viewAllBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  viewAllText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
  },

  // Culture cards
  cultureRow: { flexDirection: "row", gap: 12 },
  cultureCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  cultureIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cultureLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    textAlign: "center",
    marginBottom: 2,
  },
  cultureSubtitle: {
    fontSize: fonts.sizes.xs,
    textAlign: "center",
    marginBottom: 10,
  },
  cultureArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  // Category grid
  categoryPanel: { marginTop: 14 },
  categoryPanelTitle: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.semibold,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: "45%",
    flex: 1,
  },
  categoryChipLabel: {
    flex: 1,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
  },

  // Preview rituals
  previewList: { marginTop: 14 },
  previewTitle: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  previewIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  previewItemTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
  },
  previewItemCat: {
    fontSize: fonts.sizes.xs,
    textTransform: "capitalize",
    marginTop: 1,
  },
  browseMoreBtn: {
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginTop: 6,
  },
  browseMoreText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
  },

  // Divider
  divider: {
    borderTopWidth: 1,
    marginTop: 20,
    marginBottom: 14,
    paddingTop: 14,
  },
  dividerLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
  },

  // Article list items
  articleRow: { alignItems: "center", flexDirection: "row" },
  articleIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  articleInfo: { flex: 1, marginLeft: 12 },
  articleTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    marginBottom: 3,
  },
  articleSnippet: {
    fontSize: fonts.sizes.sm,
    lineHeight: 18,
  },
  articleMeta: {
    fontSize: fonts.sizes.xs,
    marginTop: 5,
    textTransform: "capitalize",
  },
  emptyText: {
    fontSize: fonts.sizes.md,
    textAlign: "center",
    marginTop: 30,
  },
});

export default memo(ArticlesScreen);
