import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import AppCard from "../../components/common/AppCard";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import { fetchArticles } from "../../services/api";
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadArticles();
  }, [loadArticles]);

  const visibleArticles = useMemo(() => {
    if (filter === "all") return allArticles;
    return allArticles.filter((a) => detectLifecycle(a) === filter);
  }, [allArticles, filter]);

  const renderItem = useCallback(
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

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerWrap}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Articles & Knowledge
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Curated guidance for {user?.religionPreference || "your"} spiritual journey
        </Text>
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
      </View>
    ),
    [filter, theme, user?.religionPreference]
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
      renderItem={renderItem}
      keyExtractor={(item, index) => item._id || String(index)}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          No articles available for this category
        </Text>
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

