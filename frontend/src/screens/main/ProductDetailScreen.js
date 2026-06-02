import { memo, useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { fetchProductById, addToCart, fetchReviews } from "../../services/api";
import { ListSkeleton } from "../../components/common/SkeletonLoader";

function ProductDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { isGuest, logout, user } = useAuth();
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, rRes] = await Promise.allSettled([
          fetchProductById(productId),
          fetchReviews(productId),
        ]);
        if (pRes.status === "fulfilled") setProduct(pRes.value.product || pRes.value);
        if (rRes.status === "fulfilled") setReviews(rRes.value.reviews || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const handleAddToCart = useCallback(async () => {
    if (isGuest) {
      Alert.alert(
        "Sign In Required",
        "You need to be signed in to add items to your cart.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: logout },
        ]
      );
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(productId, 1);
      Alert.alert("Added!", "Product added to your cart.", [
        { text: "Continue Shopping" },
        {
          text: "Go to Cart",
          onPress: () => navigation.navigate("CartTab"),
        },
      ]);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setAddingToCart(false);
    }
  }, [productId, navigation, isGuest, logout]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ListSkeleton count={4} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          Product not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Image */}
        <View
          style={[
            styles.imageBox,
            { backgroundColor: theme.primaryLight + "15" },
          ]}
        >
          {product.images?.[0] ? (
            <Image source={{ uri: product.images[0] }} style={styles.image} />
          ) : (
            <Ionicons name="cube-outline" size={80} color={theme.primary} />
          )}
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.primary }]}>
              Rs. {product.price}
            </Text>
            <View
              style={[
                styles.stockBadge,
                {
                  backgroundColor:
                    product.stock > 0 ? theme.success + "15" : theme.danger + "15",
                },
              ]}
            >
              <Text
                style={{
                  color: product.stock > 0 ? theme.success : theme.danger,
                  fontSize: fonts.sizes.sm,
                  fontWeight: fonts.weights.semibold,
                }}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
              </Text>
            </View>
          </View>
          <View style={[styles.catBadge, { backgroundColor: theme.primaryLight + "20" }]}>
            <Text style={[styles.catText, { color: theme.primary }]}>
              {product.category}
            </Text>
          </View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {product.description}
          </Text>
        </View>

        {/* Reviews */}
        {reviews.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Reviews ({reviews.length})
            </Text>
            {reviews.slice(0, 5).map((r) => (
              <AppCard key={r._id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Ionicons name="star" size={14} color={theme.warning} />
                  <Text style={[styles.reviewRating, { color: theme.textPrimary }]}>
                    {r.rating}/5
                  </Text>
                </View>
                <Text style={[styles.reviewText, { color: theme.textSecondary }]}>
                  {r.comment || r.text}
                </Text>
              </AppCard>
            ))}
          </>
        )}
      </ScrollView>

      {/* Add to Cart Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ]}
      >
        <View>
          <Text style={[styles.footerPrice, { color: theme.textPrimary }]}>
            Rs. {product.price}
          </Text>
        </View>
        {user?.role === "vendor" ? (
          <View style={[styles.vendorNotice, { backgroundColor: theme.primaryLight + "10" }]}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Shopping is restricted for Vendors</Text>
          </View>
        ) : (
          <AppButton
            title="Add to Cart"
            onPress={handleAddToCart}
            loading={addingToCart}
            disabled={product.stock === 0}
            size="md"
            style={{ paddingHorizontal: 32 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 100 },
  imageBox: {
    alignItems: "center",
    height: 280,
    justifyContent: "center",
    width: "100%",
  },
  image: { height: "100%", width: "100%", resizeMode: "cover" },
  infoSection: { paddingHorizontal: 20, paddingTop: 20 },
  name: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, marginBottom: 8 },
  priceRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  price: { fontSize: fonts.sizes.xxl, fontWeight: fonts.weights.extrabold },
  stockBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  catBadge: { alignSelf: "flex-start", borderRadius: 8, marginBottom: 14, paddingHorizontal: 12, paddingVertical: 5 },
  catText: { fontSize: fonts.sizes.sm, fontWeight: fonts.weights.medium, textTransform: "capitalize" },
  description: { fontSize: fonts.sizes.md, lineHeight: 22 },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  reviewCard: { marginHorizontal: 16 },
  reviewHeader: { alignItems: "center", flexDirection: "row", marginBottom: 4 },
  reviewRating: { fontSize: fonts.sizes.sm, fontWeight: fonts.weights.semibold, marginLeft: 4 },
  reviewText: { fontSize: fonts.sizes.sm, lineHeight: 18 },
  footer: {
    alignItems: "center",
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 20,
    paddingVertical: 14,
    position: "absolute",
    right: 0,
  },
  footerPrice: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold },
  vendorNotice: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  errorText: { fontSize: fonts.sizes.lg },
});

export default memo(ProductDetailScreen);
