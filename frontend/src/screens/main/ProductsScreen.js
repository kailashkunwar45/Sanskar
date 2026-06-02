import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { ProductSkeleton } from "../../components/common/SkeletonLoader";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { fetchProducts } from "../../services/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const CATEGORIES = [
  { key: "all", label: "All Products" },
  { key: "pooja-item", label: "Pooja" },
  { key: "statue", label: "Statues" },
  { key: "clothing", label: "Clothing" },
  { key: "book", label: "Books" },
  { key: "accessory", label: "Accessories" },
  { key: "other", label: "Other" },
];

const CULTURES = [
  { key: "all", label: "All Cultures" },
  { key: "hindu", label: "Hinduism" },
  { key: "buddhist", label: "Buddhism" },
];

const RITUALS = [
  { key: "all", label: "All Rituals" },
  { key: "daily", label: "Daily Rituals" },
  { key: "festival", label: "Festival Rituals" },
  { key: "ceremony", label: "Ceremonies" },
  { key: "wedding", label: "Weddings" },
  { key: "funeral", label: "Funeral" },
  { key: "other", label: "Other Rituals" },
];

function ProductsScreen({ navigation }) {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState("all");
  const [culture, setCulture] = useState("all");
  const [ritual, setRitual] = useState("all");
  const [search, setSearch] = useState("");

  const loadProducts = useCallback(
    async (pageNum = 1, cat = category, cult = culture, rit = ritual, reset = false) => {
      try {
        const catParam = cat === "all" ? undefined : cat;
        const cultParam = cult === "all" ? undefined : cult;
        const ritParam = rit === "all" ? undefined : rit;
        const res = await fetchProducts(pageNum, 10, catParam, cultParam, ritParam);
        const list = res.products || res.data || [];
        setProducts((prev) => (reset ? list : [...prev, ...list]));
        setHasMore(list.length === 10);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category, culture, ritual]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadProducts(1, category, culture, ritual, true);
  }, [category, culture, ritual]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadProducts(1, category, culture, ritual, true);
  }, [loadProducts, category, culture, ritual]);

  const onEndReached = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    loadProducts(next, category, culture, ritual, false);
  }, [hasMore, loading, page, loadProducts, category, culture, ritual]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name?.toLowerCase().includes(q));
  }, [products, search]);

  const renderProduct = useCallback(
    ({ item }) => (
      <Pressable
        onPress={() => navigation.navigate("ProductDetail", { productId: item._id })}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.borderLight,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.imgPlaceholder,
            { backgroundColor: theme.primaryLight + "20" },
          ]}
        >
          {item.images?.[0] ? (
            <Image source={{ uri: item.images[0] }} style={styles.productImg} />
          ) : (
            <Ionicons name="cube-outline" size={36} color={theme.primary} />
          )}
        </View>
        <Text
          style={[styles.productName, { color: theme.textPrimary }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text style={[styles.productPrice, { color: theme.primary }]}>
          Rs. {item.price}
        </Text>
        <Text style={[styles.productStock, { color: item.stock > 0 ? theme.success : theme.danger }]}>
          {item.stock > 0 ? "In Stock" : "Out of Stock"}
        </Text>
      </Pressable>
    ),
    [theme, navigation]
  );

  const renderHeader = useCallback(
    () => (
      <>
        {/* Search */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
        </View>

        {/* Culture Category Filter */}
        <Text style={{ fontSize: 11, fontWeight: "bold", color: theme.textMuted, marginBottom: 4 }}>CULTURE CATEGORY</Text>
        <FlatList
          data={CULTURES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => c.key}
          contentContainerStyle={styles.catRow}
          renderItem={({ item: cult }) => (
            <Pressable
              onPress={() => setCulture(cult.key)}
              style={[
                styles.catChip,
                {
                  backgroundColor:
                    culture === cult.key ? theme.primary : theme.surface,
                  borderColor:
                    culture === cult.key ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    culture === cult.key
                      ? theme.textOnPrimary
                      : theme.textSecondary,
                  fontSize: fonts.sizes.sm - 1,
                  fontWeight: fonts.weights.medium,
                }}
              >
                {cult.label}
              </Text>
            </Pressable>
          )}
        />

        {/* Ritual Category Filter */}
        <Text style={{ fontSize: 11, fontWeight: "bold", color: theme.textMuted, marginBottom: 4 }}>RITUAL CATEGORY</Text>
        <FlatList
          data={RITUALS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(r) => r.key}
          contentContainerStyle={styles.catRow}
          renderItem={({ item: rit }) => (
            <Pressable
              onPress={() => setRitual(rit.key)}
              style={[
                styles.catChip,
                {
                  backgroundColor:
                    ritual === rit.key ? theme.accent : theme.surface,
                  borderColor:
                    ritual === rit.key ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    ritual === rit.key
                      ? theme.textOnPrimary
                      : theme.textSecondary,
                  fontSize: fonts.sizes.sm - 1,
                  fontWeight: fonts.weights.medium,
                }}
              >
                {rit.label}
              </Text>
            </Pressable>
          )}
        />

        {/* Product Category Filter */}
        <Text style={{ fontSize: 11, fontWeight: "bold", color: theme.textMuted, marginBottom: 4 }}>PRODUCTS CATEGORY</Text>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => c.key}
          contentContainerStyle={styles.catRow}
          renderItem={({ item: cat }) => (
            <Pressable
              onPress={() => setCategory(cat.key)}
              style={[
                styles.catChip,
                {
                  backgroundColor:
                    category === cat.key ? theme.primary : theme.surface,
                  borderColor:
                    category === cat.key ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    category === cat.key
                      ? theme.textOnPrimary
                      : theme.textSecondary,
                  fontSize: fonts.sizes.sm - 1,
                  fontWeight: fonts.weights.medium,
                }}
              >
                {cat.label}
              </Text>
            </Pressable>
          )}
        />
      </>
    ),
    [theme, search, category, culture, ritual]
  );

  if (loading && products.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ width: CARD_WIDTH }}>
              <ProductSkeleton />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.listContent}
      data={filteredProducts}
      renderItem={renderProduct}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <Text style={[styles.empty, { color: theme.textMuted }]}>
          No products found
        </Text>
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
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={5}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  searchBar: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: fonts.sizes.md, marginLeft: 8, paddingVertical: 10 },
  catRow: { gap: 8, marginBottom: 14, paddingRight: 16 },
  catChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: { justifyContent: "space-between" },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    padding: 10,
    width: CARD_WIDTH,
  },
  imgPlaceholder: {
    alignItems: "center",
    borderRadius: 12,
    height: 120,
    justifyContent: "center",
    marginBottom: 8,
    width: "100%",
  },
  productImg: { borderRadius: 12, height: "100%", width: "100%" },
  productName: { fontSize: fonts.sizes.sm, fontWeight: fonts.weights.semibold, marginBottom: 4 },
  productPrice: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold },
  productStock: { fontSize: fonts.sizes.xs, marginTop: 2 },
  skeletonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16 },
  empty: { fontSize: fonts.sizes.md, marginTop: 40, textAlign: "center" },
});

export default memo(ProductsScreen);
