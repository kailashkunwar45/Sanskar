import { memo, useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import AppCard from "../../components/common/AppCard";
import AppButton from "../../components/common/AppButton";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchProducts,
  createProduct,
  deleteProduct,
  uploadMedia,
} from "../../services/api";

const PRODUCT_CATEGORIES = ["pooja-item", "statue", "clothing", "book", "accessory", "other"];
const CULTURES = ["hindu", "buddhist"];
const RITUAL_CATEGORIES = ["festival", "daily", "ceremony", "wedding", "funeral", "other"];

function VendorDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formMode, setFormMode] = useState(null); // 'add-product' or null
  
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categories: [],
    culturalCategories: [],
    ritualCategories: [],
    imageFile: null,
    imageUrl: "",
  });

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetchProducts(1, 100);
      setProducts(res.data || res.products || []);
    } catch (err) {
      console.error("Failed to load vendor products", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, [loadProducts]);

  // Image Picking
  const triggerImagePick = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          setProductForm(f => ({ ...f, imageFile: file, imageUrl: URL.createObjectURL(file) }));
        }
      };
      input.click();
    } else {
      Alert.alert("Feature unavailable", "Local image upload only works on Web in this build.");
    }
  };

  // Toggle selection lists
  const toggleArrayItem = (key, val) => {
    setProductForm(prev => {
      const arr = prev[key];
      const newArr = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
      return { ...prev, [key]: newArr };
    });
  };

  // Add Product Action
  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.description || !productForm.price) {
      Alert.alert("Validation", "Name, Description, and Price are required.");
      return;
    }
    setLoading(true);
    try {
      let finalImg = "";
      if (productForm.imageFile) {
        const res = await uploadMedia(productForm.imageFile);
        finalImg = res.imageUrl;
      }

      await createProduct({
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock || 0),
        category: productForm.categories.length > 0 ? productForm.categories : ["other"],
        culturalCategory: productForm.culturalCategories,
        ritualCategory: productForm.ritualCategories,
        images: finalImg ? [finalImg] : [],
      });

      Alert.alert("Success", "Product added successfully");
      setFormMode(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        categories: [],
        culturalCategories: [],
        ritualCategories: [],
        imageFile: null,
        imageUrl: "",
      });
      loadProducts();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // Delete Product Action
  const handleDeleteProduct = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteProduct(id);
            Alert.alert("Deleted", "Product successfully removed");
            loadProducts();
          } catch (e) {
            Alert.alert("Error", e.message);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  if (loading && products.length === 0) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: theme.background }]}>
        <ListSkeleton count={6} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Seller Central</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Manage your sacred products and sales</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <AppCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{products.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Products</Text>
        </AppCard>
        <AppCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.success }]}>Rs. 0</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Sales</Text>
        </AppCard>
      </View>

      {/* Main Mode Toggle */}
      {formMode === "add-product" ? (
        <AppCard style={styles.formCard}>
          <Text style={[styles.formHeaderTitle, { color: theme.textPrimary }]}>Create New Product</Text>

          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Product Name *</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Enter product name"
            placeholderTextColor={theme.textMuted}
            value={productForm.name}
            onChangeText={v => setProductForm(f => ({ ...f, name: v }))}
          />

          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Description *</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, height: 80 }]}
            placeholder="Enter product features/details"
            placeholderTextColor={theme.textMuted}
            multiline
            value={productForm.description}
            onChangeText={v => setProductForm(f => ({ ...f, description: v }))}
          />

          <View style={styles.gridRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Price (Rs.) *</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. 500"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={productForm.price}
                onChangeText={v => setProductForm(f => ({ ...f, price: v }))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Stock *</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. 25"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={productForm.stock}
                onChangeText={v => setProductForm(f => ({ ...f, stock: v }))}
              />
            </View>
          </View>

          {/* Cultural Category */}
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>1. Cultural Category (Select Multiple)</Text>
          <View style={[styles.checkboxContainer, { borderColor: theme.border }]}>
            {CULTURES.map(c => {
              const active = productForm.culturalCategories.includes(c);
              return (
                <Pressable
                  key={c}
                  onPress={() => toggleArrayItem("culturalCategories", c)}
                  style={[styles.checkboxOption, active && { backgroundColor: theme.primary + "15" }]}
                >
                  <Ionicons name={active ? "checkbox" : "square-outline"} size={18} color={theme.primary} />
                  <Text style={[styles.checkboxText, { color: theme.textPrimary }]}>{c.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Ritual Category */}
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>2. Ritual Category (Select Multiple)</Text>
          <View style={[styles.checkboxContainer, { borderColor: theme.border }]}>
            {RITUAL_CATEGORIES.map(r => {
              const active = productForm.ritualCategories.includes(r);
              return (
                <Pressable
                  key={r}
                  onPress={() => toggleArrayItem("ritualCategories", r)}
                  style={[styles.checkboxOption, active && { backgroundColor: theme.accent + "15" }]}
                >
                  <Ionicons name={active ? "checkbox" : "square-outline"} size={18} color={theme.accent} />
                  <Text style={[styles.checkboxText, { color: theme.textPrimary }]}>{r.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Product Shop Category */}
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>3. Product Shop Category (Select Multiple)</Text>
          <View style={[styles.checkboxContainer, { borderColor: theme.border }]}>
            {PRODUCT_CATEGORIES.map(pc => {
              const active = productForm.categories.includes(pc);
              return (
                <Pressable
                  key={pc}
                  onPress={() => toggleArrayItem("categories", pc)}
                  style={[styles.checkboxOption, active && { backgroundColor: theme.primary + "15" }]}
                >
                  <Ionicons name={active ? "checkbox" : "square-outline"} size={18} color={theme.primary} />
                  <Text style={[styles.checkboxText, { color: theme.textPrimary }]}>{pc.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Upload Section */}
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Product Image</Text>
          <Pressable onPress={triggerImagePick} style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.primaryLight + "08" }]}>
            {productForm.imageUrl ? (
              <Image source={{ uri: productForm.imageUrl }} style={styles.previewImage} />
            ) : (
              <>
                <Ionicons name="image-outline" size={32} color={theme.primary} />
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>Click to Upload Product Image</Text>
              </>
            )}
          </Pressable>

          <View style={[styles.row, { marginTop: 20, gap: 12, justifyContent: "flex-end" }]}>
            <AppButton title="Cancel" variant="outline" onPress={() => setFormMode(null)} />
            <AppButton title="Save Product" onPress={handleAddProduct} />
          </View>
        </AppCard>
      ) : (
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Manage Products</Text>
            <AppButton 
              title="Add Product" 
              size="sm" 
              icon="add" 
              onPress={() => setFormMode("add-product")} 
            />
          </View>

          {products.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <Ionicons name="cube-outline" size={40} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No products found. Start by adding one!</Text>
            </AppCard>
          ) : (
            products.map(prod => (
              <AppCard key={prod._id} style={styles.listRowCard}>
                <View style={styles.row}>
                  {prod.images?.[0] ? (
                    <Image source={{ uri: prod.images[0] }} style={styles.thumbnail} />
                  ) : (
                    <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.primaryLight + "15" }]}>
                      <Ionicons name="cube" size={20} color={theme.primary} />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.listRowTitle, { color: theme.textPrimary }]} numberOfLines={1}>{prod.name}</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 11 }}>
                      Price: Rs.{prod.price} • Stock: {prod.stock}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    <AppButton
                      title="View"
                      size="sm"
                      variant="outline"
                      onPress={() => navigation.navigate("ProductDetail", { productId: prod._id })}
                    />
                    <Pressable onPress={() => handleDeleteProduct(prod._id)} style={{ padding: 6 }}>
                      <Ionicons name="trash-outline" size={20} color={theme.danger} />
                    </Pressable>
                  </View>
                </View>
              </AppCard>
            ))
          )}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingCenter: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: fonts.weights.bold },
  subtitle: { fontSize: 14, marginTop: 4 },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 20 },
  statValue: { fontSize: 22, fontWeight: fonts.weights.bold },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: fonts.weights.bold },
  emptyCard: { alignItems: "center", paddingVertical: 40, borderStyle: "dashed", borderWidth: 1, justifyContent: "center" },
  emptyText: { marginTop: 12, fontSize: 14 },
  listRowCard: { marginBottom: 8, padding: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  thumbnail: { width: 48, height: 48, borderRadius: 8 },
  thumbnailPlaceholder: { width: 48, height: 48, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  listRowTitle: { fontSize: 14, fontWeight: "600" },
  formCard: { padding: 16, marginBottom: 20 },
  formHeaderTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 6 },
  inputLabel: { fontSize: 12, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1.2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  gridRow: { flexDirection: "row", marginTop: 4 },
  checkboxContainer: { borderWidth: 1.2, borderRadius: 10, padding: 8, gap: 6 },
  checkboxOption: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 8, borderRadius: 6, gap: 10 },
  checkboxText: { fontSize: 13, fontWeight: "500" },
  uploadBox: { borderWidth: 1.5, borderStyle: "dashed", borderRadius: 12, height: 140, alignItems: "center", justifyContent: "center", marginTop: 8, overflow: "hidden" },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
});

export default memo(VendorDashboardScreen);
