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
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { fetchCart, updateCartItem, removeCartItem, clearCart } from "../../services/api";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import AppButton from "../../components/common/AppButton";

function CartScreen({ navigation }) {
  const { theme } = useTheme();
  const { isGuest, logout } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      const res = await fetchCart();
      setCart(res.cart || res);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = useCallback(
    async (productId, qty) => {
      if (qty < 1) {
        handleRemove(productId);
        return;
      }
      try {
        await updateCartItem(productId, qty);
        loadCart();
      } catch (e) {
        Alert.alert("Error", e.message);
      }
    },
    [loadCart]
  );

  const handleRemove = useCallback(
    async (productId) => {
      try {
        await removeCartItem(productId);
        loadCart();
      } catch (e) {
        Alert.alert("Error", e.message);
      }
    },
    [loadCart]
  );

  const handleClearCart = useCallback(async () => {
    Alert.alert("Clear Cart", "Remove all items from cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await clearCart();
            loadCart();
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  }, [loadCart]);

  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice || items.reduce((s, i) => s + i.price * i.quantity, 0);
  const subtotal = totalPrice;
  const deliveryFee = items.length > 0 ? 0 : 0;
  const grandTotal = subtotal + deliveryFee;

  const renderItem = useCallback(
    ({ item }) => (
      <View
        style={[
          styles.cartItem,
          { backgroundColor: theme.card, borderColor: theme.borderLight },
        ]}
      >
        <View
          style={[
            styles.itemIcon,
            { backgroundColor: theme.primaryLight + "20" },
          ]}
        >
          <Ionicons name="cube-outline" size={24} color={theme.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text
            style={[styles.itemName, { color: theme.textPrimary }]}
            numberOfLines={2}
          >
            {item.product?.name || item.name || "Product"}
          </Text>
          <Text style={[styles.itemPrice, { color: theme.primary }]}>
            Rs. {item.price}
          </Text>
        </View>
        <View style={styles.qtyRow}>
          <Pressable
            onPress={() => handleQuantityChange(item.product?._id || item.product, item.quantity - 1)}
            style={[styles.qtyBtn, { borderColor: theme.border }]}
          >
            <Ionicons name="remove" size={16} color={theme.textPrimary} />
          </Pressable>
          <Text style={[styles.qtyText, { color: theme.textPrimary }]}>
            {item.quantity}
          </Text>
          <Pressable
            onPress={() => handleQuantityChange(item.product?._id || item.product, item.quantity + 1)}
            style={[styles.qtyBtn, { borderColor: theme.border }]}
          >
            <Ionicons name="add" size={16} color={theme.textPrimary} />
          </Pressable>
        </View>
        <Pressable onPress={() => handleRemove(item.product?._id || item.product)}>
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
        </Pressable>
      </View>
    ),
    [theme, handleQuantityChange, handleRemove]
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ListSkeleton count={4} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, idx) => (item.product?._id || item.product || idx).toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="cart-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Your cart is empty
            </Text>
            <AppButton
              title="Browse Products"
              variant="outline"
              onPress={() => navigation.navigate("ProductsTab")}
              style={{ marginTop: 16 }}
            />
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
      {items.length > 0 && (
        <View
          style={[
            styles.footer,
            { backgroundColor: theme.surface, borderTopColor: theme.border },
          ]}
        >
          <View>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
              {items.length} item(s) • Total
            </Text>
            <Text style={[styles.totalPrice, { color: theme.textPrimary }]}>
              Rs. {grandTotal}
            </Text>
          </View>
          <View style={styles.footerButtons}>
            <Pressable onPress={handleClearCart} style={{ marginRight: 12 }}>
              <Ionicons name="trash-outline" size={22} color={theme.danger} />
            </Pressable>
            <AppButton
              title="Checkout"
              onPress={() => {
                if (isGuest) {
                  Alert.alert(
                    "Sign In Required",
                    "You need to be signed in to checkout.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Sign In", onPress: logout },
                    ]
                  );
                } else {
                  navigation.navigate("Checkout");
                }
              }}
              size="md"
              style={{ paddingHorizontal: 24 }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 12 },
  cartItem: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    padding: 12,
  },
  itemIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: fonts.sizes.sm, fontWeight: fonts.weights.medium, marginBottom: 2 },
  itemPrice: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.bold },
  qtyRow: { alignItems: "center", flexDirection: "row", marginRight: 12 },
  qtyBtn: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  qtyText: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.semibold, marginHorizontal: 8 },
  footer: {
    alignItems: "center",
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: "absolute",
    right: 0,
  },
  footerButtons: { alignItems: "center", flexDirection: "row" },
  totalLabel: { fontSize: fonts.sizes.sm },
  totalPrice: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold },
  emptyWrap: { alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: fonts.sizes.lg, marginTop: 12 },
});

export default memo(CartScreen);
