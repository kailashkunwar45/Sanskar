import { memo, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import AppCard from "../../components/common/AppCard";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import { fetchArticleById } from "../../services/api";
import fonts from "../../theme/fonts";

function normalizeArticleResponse(res) {
  return res?.data || res?.article || res || null;
}

function ArticleDetailScreen({ route }) {
  const { theme } = useTheme();
  const { articleId } = route.params;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchArticleById(articleId);
        setArticle(normalizeArticleResponse(response));
      } catch {
        setArticle(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [articleId]);

  const linkedProducts = useMemo(() => article?.linkedProducts || [], [article]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ListSkeleton count={5} />
      </View>
    );
  }

  if (!article) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          Article not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.primaryLight + "30" },
          ]}
        >
          <Ionicons name="book-outline" size={34} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {article.title}
        </Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {(article.category || "guide").toUpperCase()} - {(article.religion || "general").toUpperCase()}
        </Text>
      </View>

      <AppCard elevation={2}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Overview
        </Text>
        <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
          {article.content}
        </Text>
      </AppCard>

      {article.meaning ? (
        <AppCard elevation={2}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Spiritual Meaning
          </Text>
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            {article.meaning}
          </Text>
        </AppCard>
      ) : null}

      {Array.isArray(article.steps) && article.steps.length > 0 ? (
        <AppCard elevation={2}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Steps
          </Text>
          {article.steps.map((step, idx) => (
            <View key={`${idx}-${step}`} style={styles.stepRow}>
              <View
                style={[
                  styles.stepBadge,
                  { backgroundColor: theme.primaryLight + "40" },
                ]}
              >
                <Text style={[styles.stepBadgeText, { color: theme.primary }]}>
                  {idx + 1}
                </Text>
              </View>
              <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                {step}
              </Text>
            </View>
          ))}
        </AppCard>
      ) : null}

      {Array.isArray(article.requiredItems) && article.requiredItems.length > 0 ? (
        <AppCard elevation={2}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Required Items
          </Text>
          {article.requiredItems.map((item, idx) => (
            <View key={`${idx}-${item}`} style={styles.itemRow}>
              <Ionicons name="checkmark-circle-outline" size={17} color={theme.primary} />
              <Text style={[styles.itemText, { color: theme.textSecondary }]}>
                {item}
              </Text>
            </View>
          ))}
        </AppCard>
      ) : null}

      {linkedProducts.length > 0 ? (
        <AppCard elevation={2}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Linked Products
          </Text>
          {linkedProducts.map((product, idx) => (
            <View key={product?._id || idx} style={styles.linkedRow}>
              <Ionicons name="bag-handle-outline" size={16} color={theme.primary} />
              <Text style={[styles.linkedText, { color: theme.textSecondary }]}>
                {product?.name || "Product"} - Rs. {product?.price ?? "-"}
              </Text>
            </View>
          ))}
        </AppCard>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },
  header: { alignItems: "center", marginBottom: 12 },
  iconCircle: {
    alignItems: "center",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    marginBottom: 10,
    width: 72,
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    textAlign: "center",
  },
  meta: { marginTop: 4, fontSize: fonts.sizes.xs },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: fonts.sizes.md,
    lineHeight: 22,
  },
  stepRow: { flexDirection: "row", marginTop: 8 },
  stepBadge: {
    alignItems: "center",
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    marginRight: 10,
    width: 24,
  },
  stepBadgeText: { fontSize: fonts.sizes.xs, fontWeight: fonts.weights.bold },
  stepText: { flex: 1, fontSize: fonts.sizes.sm, lineHeight: 20 },
  itemRow: { alignItems: "center", flexDirection: "row", marginTop: 6 },
  itemText: { marginLeft: 8, fontSize: fonts.sizes.sm },
  linkedRow: { alignItems: "center", flexDirection: "row", marginTop: 7 },
  linkedText: { fontSize: fonts.sizes.sm, marginLeft: 8 },
  errorText: { fontSize: fonts.sizes.lg },
});

export default memo(ArticleDetailScreen);

