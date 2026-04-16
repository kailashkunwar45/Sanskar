import { memo, useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import AppCard from "../../components/common/AppCard";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchCart,
  createOrder,
  initiateEsewaPayment,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
} from "../../services/api";

function CheckoutScreen({ navigation }) {
  const { theme } = useTheme();
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchCart();
        setCart(res.cart || res);
      } catch {
        // silent
      } finally {
        setCartLoading(false);
      }
    })();
  }, []);

  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice || items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handlePlaceOrder = useCallback(async () => {
    if (!address.trim()) {
      Alert.alert("Missing Info", "Please enter a shipping address");
      return;
    }
    if (items.length === 0) {
      Alert.alert("Empty Cart", "Please add items before checkout.");
      return;
    }
    try {
      setLoading(true);
      const order = await createOrder({
        shippingAddress: address.trim(),
        paymentMethod,
      });
      setCreatedOrder(order);

      if (paymentMethod === "cod") {
        Alert.alert(
          "Order Placed!",
          "Cash on Delivery selected. Your order has been placed successfully.",
          [{ text: "OK", onPress: () => navigation.navigate("HomeTab") }]
        );
        return;
      }

      if (paymentMethod === "esewa") {
        const init = await initiateEsewaPayment(order._id);
        setPaymentInitiated({
          method: "esewa",
          details: init,
        });
        Alert.alert(
          "eSewa Initiated",
          "Payment request prepared. Continue in your payment gateway and then verify.",
          [{ text: "OK" }]
        );
        return;
      }

      if (paymentMethod === "khalti") {
        const init = await initiateKhaltiPayment(order._id);
        setPaymentInitiated({
          method: "khalti",
          details: init,
        });
        Alert.alert(
          "Khalti Initiated",
          "Payment request prepared. After sandbox success, verify payment below.",
          [{ text: "OK" }]
        );
      }
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  }, [address, items.length, navigation, paymentMethod]);

  const handleKhaltiSandboxVerify = useCallback(async () => {
    if (!createdOrder?._id) return;
    try {
      setLoading(true);
      await verifyKhaltiPayment({
        orderId: createdOrder._id,
        pidx: `sandbox-${Date.now()}`,
      });
      Alert.alert("Payment Verified", "Khalti sandbox verification completed.", [
        { text: "Go Home", onPress: () => navigation.navigate("HomeTab") },
      ]);
    } catch (e) {
      Alert.alert("Verification Failed", e.message || "Try again.");
    } finally {
      setLoading(false);
    }
  }, [createdOrder?._id, navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.heading, { color: theme.textPrimary }]}>
          Order Summary
        </Text>

        {cartLoading ? (
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading cart...
          </Text>
        ) : null}

        {items.map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.orderItem,
              { borderBottomColor: theme.borderLight },
            ]}
          >
            <Text style={[styles.oiName, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.product?.name || "Product"}
            </Text>
            <Text style={[styles.oiQty, { color: theme.textSecondary }]}>
              × {item.quantity}
            </Text>
            <Text style={[styles.oiPrice, { color: theme.textPrimary }]}>
              Rs. {item.price * item.quantity}
            </Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
            Total
          </Text>
          <Text style={[styles.totalPrice, { color: theme.primary }]}>
            Rs. {totalPrice}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={[styles.subHeading, { color: theme.textPrimary }]}>
          Shipping Address
        </Text>
        <AppInput
          placeholder="Enter full delivery address"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <Text style={[styles.subHeading, { color: theme.textPrimary, marginTop: 8 }]}>
          Payment Method
        </Text>
        <View style={styles.paymentOptions}>
          {[
            { key: "cod", label: "Cash on Delivery", icon: "cash-outline" },
            { key: "esewa", label: "eSewa Sandbox", icon: "wallet-outline" },
            { key: "khalti", label: "Khalti Sandbox", icon: "card-outline" },
          ].map((method) => (
            <Pressable
              key={method.key}
              onPress={() => setPaymentMethod(method.key)}
              style={[
                styles.payOption,
                {
                  borderColor:
                    paymentMethod === method.key ? theme.primary : theme.border,
                  backgroundColor:
                    paymentMethod === method.key
                      ? theme.primary + "15"
                      : theme.surface,
                },
              ]}
            >
              <Ionicons
                name={method.icon}
                size={20}
                color={
                  paymentMethod === method.key ? theme.primary : theme.textSecondary
                }
              />
              <Text
                style={[
                  styles.paymentText,
                  {
                    color:
                      paymentMethod === method.key
                        ? theme.primary
                        : theme.textPrimary,
                  },
                ]}
              >
                {method.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <AppButton
          title={
            paymentMethod === "cod" ? "Place Order" : "Place Order & Continue Payment"
          }
          onPress={handlePlaceOrder}
          loading={loading}
          size="lg"
          style={{ marginTop: 20 }}
        />

        {paymentInitiated?.method === "khalti" && createdOrder?._id ? (
          <AppButton
            title="Verify Khalti Sandbox Payment"
            onPress={handleKhaltiSandboxVerify}
            loading={loading}
            variant="outline"
            size="lg"
            style={{ marginTop: 12 }}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingVertical: 20 },
  heading: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, marginBottom: 16 },
  loadingText: { fontSize: fonts.sizes.sm, marginBottom: 8 },
  subHeading: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.semibold, marginBottom: 12 },
  orderItem: {
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  oiName: { flex: 1, fontSize: fonts.sizes.md },
  oiQty: { fontSize: fonts.sizes.sm, marginHorizontal: 8 },
  oiPrice: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.semibold },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  totalLabel: { fontSize: fonts.sizes.lg },
  totalPrice: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold },
  divider: { borderBottomWidth: 1, borderColor: "#E7E5E4", marginVertical: 16 },
  paymentOptions: { gap: 10 },
  payOption: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  paymentText: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.medium, marginLeft: 10 },
});

export default memo(CheckoutScreen);
