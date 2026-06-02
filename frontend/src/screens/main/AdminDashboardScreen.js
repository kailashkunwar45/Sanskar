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
import { useAuth } from "../../contexts/AuthContext";
import AppCard from "../../components/common/AppCard";
import AppButton from "../../components/common/AppButton";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchBookings,
  fetchPendingProviders,
  fetchUserSummary,
  verifyProvider,
  declineProvider,
  fetchArticles,
  createArticle,
  deleteArticle,
  fetchRituals,
  createRitual,
  updateRitual,
  deleteRitual,
  fetchProducts,
  createProduct,
  deleteProduct,
  fetchFestivals,
  createFestival,
  deleteFestival,
  updateFestival,
  uploadMedia,
} from "../../services/api";

const ARTICLE_CATEGORIES = ["guide", "history", "festival", "mantra", "wellness", "other"];
const CULTURES = ["hindu", "buddhist"];
const PRODUCT_CATEGORIES = ["pooja-item", "statue", "clothing", "book", "accessory", "other"];
const RITUAL_CATEGORIES = ["festival", "daily", "ceremony", "wedding", "funeral", "other"];
const USER_CATEGORIES = ["customer", "vendor", "pandit", "lama", "admin", "superadmin", "unassigned"];

const EMPTY_USER_SUMMARY = {
  total: 0,
  categories: USER_CATEGORIES.reduce((acc, role) => ({ ...acc, [role]: 0 }), {}),
  users: [],
};

const normalizeUserSummary = (payload) => {
  const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const users = Array.isArray(data?.users) ? data.users.filter(Boolean) : [];
  const rawCategories = data?.categories && typeof data.categories === "object" ? data.categories : {};
  const categories = USER_CATEGORIES.reduce((acc, role) => {
    const countedUsers = users.filter(user => (user?.role || "unassigned") === role).length;
    acc[role] = Number(rawCategories[role] ?? countedUsers ?? 0);
    return acc;
  }, {});
  const rawTotal = Number(data?.total);

  return {
    total: Number.isFinite(rawTotal) ? rawTotal : users.length,
    categories,
    users,
  };
};

function AdminDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Stats & Overview Data
  const [bookings, setBookings] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, pending: 0, confirmed: 0 });
  const [userSummary, setUserSummary] = useState(EMPTY_USER_SUMMARY);
  const [expandedBookingIds, setExpandedBookingIds] = useState({});
  const [bookingStatusFilter, setBookingStatusFilter] = useState(null);
  const [selectedUserRole, setSelectedUserRole] = useState(null);

  // List Data
  const [articles, setArticles] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [products, setProducts] = useState([]);
  const [festivals, setFestivals] = useState([]);

  // Form & Interaction States
  const [actionLoading, setActionLoading] = useState(null);
  const [formMode, setFormMode] = useState(null); // 'add-article', 'add-product', 'add-festival', 'edit-festival', 'add-ritual', 'edit-ritual'
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [articleForm, setArticleForm] = useState({
    title: "",
    content: "",
    category: "guide",
    religion: "hindu",
    meaning: "",
    steps: "",
    requiredItems: "",
    imageFile: null,
    imageUrl: "",
  });

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

  const [ritualForm, setRitualForm] = useState({
    title: "",
    description: "",
    meaning: "",
    religion: "hindu",
    category: "daily",
    steps: "",
    checklist: "",
    requiredItems: "",
    imageFile: null,
    imageUrl: "",
  });

  const EMPTY_RITUAL_FORM = {
    title: "",
    description: "",
    meaning: "",
    religion: "hindu",
    category: "daily",
    steps: "",
    checklist: "",
    requiredItems: "",
    imageFile: null,
    imageUrl: "",
  };

  const [festivalForm, setFestivalForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    religion: "general",
    imageFile: null,
    imageUrl: "",
  });

  // Loaders
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookRes, provRes, userRes, artRes, ritualRes, prodRes, festRes] = await Promise.allSettled([
        fetchBookings(),
        fetchPendingProviders(),
        fetchUserSummary(),
        fetchArticles(1, 100),
        fetchRituals(1, 100),
        fetchProducts(1, 100),
        fetchFestivals(new Date().getFullYear(), new Date().getMonth() + 1),
      ]);

      const bookList = bookRes.status === "fulfilled" ? (bookRes.value.data || bookRes.value.bookings || []) : [];
      setBookings(bookList);
      setPendingProviders(provRes.status === "fulfilled" ? (provRes.value.data || []) : []);
      setUserSummary(userRes.status === "fulfilled" ? normalizeUserSummary(userRes.value) : EMPTY_USER_SUMMARY);
      
      setStats({
        totalBookings: bookList.length,
        pending: bookList.filter(b => b.status === "pending").length,
        confirmed: bookList.filter(b => b.status === "confirmed").length,
      });

      if (artRes.status === "fulfilled") {
        setArticles(artRes.value.data || artRes.value.articles || []);
      }
      if (ritualRes.status === "fulfilled") {
        setRituals(ritualRes.value.data || ritualRes.value.rituals || []);
      }
      if (prodRes.status === "fulfilled") {
        setProducts(prodRes.value.data || prodRes.value.products || []);
      }
      if (festRes.status === "fulfilled") {
        setFestivals(festRes.value.festivals || []);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Provider approvals
  const handleVerify = async (id, action) => {
    try {
      setActionLoading(id);
      if (action === "approve") {
        await verifyProvider(id);
        Alert.alert("Success", "User approved successfully");
      } else {
        await declineProvider(id);
        Alert.alert("Declined", "User registration request removed");
      }
      loadAllData();
    } catch (e) {
      Alert.alert("Error", e.message || `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Image Picking
  const triggerImagePick = (type) => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          if (type === 'article') setArticleForm(f => ({ ...f, imageFile: file, imageUrl: URL.createObjectURL(file) }));
          if (type === 'ritual') setRitualForm(f => ({ ...f, imageFile: file, imageUrl: URL.createObjectURL(file) }));
          if (type === 'product') setProductForm(f => ({ ...f, imageFile: file, imageUrl: URL.createObjectURL(file) }));
          if (type === 'festival') setFestivalForm(f => ({ ...f, imageFile: file, imageUrl: URL.createObjectURL(file) }));
        }
      };
      input.click();
    } else {
      Alert.alert("Feature unavailable", "Local image upload only works on Web in this build. Please provide a direct image URL:");
    }
  };

  // Article Actions
  const handleAddArticle = async () => {
    if (!articleForm.title || !articleForm.content) {
      Alert.alert("Validation", "Title and Content are required.");
      return;
    }
    setLoading(true);
    try {
      let finalImg = "";
      if (articleForm.imageFile) {
        const res = await uploadMedia(articleForm.imageFile);
        finalImg = res.imageUrl;
      }

      await createArticle({
        title: articleForm.title,
        content: articleForm.content,
        category: articleForm.category,
        religion: articleForm.religion,
        meaning: articleForm.meaning,
        steps: articleForm.steps ? articleForm.steps.split("\n").filter(Boolean) : [],
        requiredItems: articleForm.requiredItems ? articleForm.requiredItems.split("\n").filter(Boolean) : [],
        images: finalImg ? [finalImg] : [],
      });

      Alert.alert("Success", "Article created successfully");
      setFormMode(null);
      setArticleForm({
        title: "",
        content: "",
        category: "guide",
        religion: "hindu",
        meaning: "",
        steps: "",
        requiredItems: "",
        imageFile: null,
        imageUrl: "",
      });
      loadAllData();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to create article");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this article?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteArticle(id);
            Alert.alert("Deleted", "Article successfully removed");
            loadAllData();
          } catch (e) {
            Alert.alert("Error", e.message);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  // Product Actions
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
      loadAllData();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

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
            loadAllData();
          } catch (e) {
            Alert.alert("Error", e.message);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  // Calendar Actions
  const handleSaveFestival = async () => {
    if (!festivalForm.title || !festivalForm.description || !festivalForm.date) {
      Alert.alert("Validation", "Title, Description, and Date are required.");
      return;
    }
    setLoading(true);
    try {
      let finalImg = festivalForm.imageUrl;
      if (festivalForm.imageFile) {
        const res = await uploadMedia(festivalForm.imageFile);
        finalImg = res.imageUrl;
      }

      const payload = {
        title: festivalForm.title,
        description: festivalForm.description,
        date: new Date(festivalForm.date).toISOString(),
        religion: festivalForm.religion,
        image: finalImg,
      };

      if (formMode === 'edit-festival') {
        await updateFestival(editingId, payload);
        Alert.alert("Success", "Festival updated successfully");
      } else {
        await createFestival(payload);
        Alert.alert("Success", "Festival created successfully");
      }

      setFormMode(null);
      setEditingId(null);
      setFestivalForm({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        religion: "general",
        imageFile: null,
        imageUrl: "",
      });
      loadAllData();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to save festival");
    } finally {
      setLoading(false);
    }
  };

  const handleEditFestivalClick = (f) => {
    setEditingId(f._id);
    setFestivalForm({
      title: f.title,
      description: f.description,
      date: new Date(f.date).toISOString().split("T")[0],
      religion: f.religion || "general",
      imageFile: null,
      imageUrl: f.image || "",
    });
    setFormMode("edit-festival");
  };

  const handleDeleteFestival = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this festival date?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteFestival(id);
            Alert.alert("Deleted", "Festival successfully removed");
            loadAllData();
          } catch (e) {
            Alert.alert("Error", e.message);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  // Ritual Actions
  const handleSaveRitual = async () => {
    if (!ritualForm.title || !ritualForm.description) {
      Alert.alert("Validation", "Title and Description are required.");
      return;
    }
    setLoading(true);
    try {
      let finalImg = ritualForm.imageUrl;
      if (ritualForm.imageFile) {
        const res = await uploadMedia(ritualForm.imageFile);
        finalImg = res.imageUrl;
      }

      const payload = {
        title: ritualForm.title,
        description: ritualForm.description,
        meaning: ritualForm.meaning,
        religion: ritualForm.religion,
        category: ritualForm.category,
        steps: ritualForm.steps ? ritualForm.steps.split("\n").filter(Boolean) : [],
        checklist: ritualForm.checklist ? ritualForm.checklist.split("\n").filter(Boolean) : [],
        requiredItems: ritualForm.requiredItems ? ritualForm.requiredItems.split("\n").filter(Boolean) : [],
        images: finalImg ? [finalImg] : [],
      };

      if (formMode === "edit-ritual") {
        await updateRitual(editingId, payload);
        Alert.alert("Success", "Ritual updated successfully");
      } else {
        await createRitual(payload);
        Alert.alert("Success", "Ritual created successfully");
      }

      setFormMode(null);
      setEditingId(null);
      setRitualForm(EMPTY_RITUAL_FORM);
      loadAllData();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to save ritual");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRitualClick = (r) => {
    setEditingId(r._id);
    setRitualForm({
      title: r.title || "",
      description: r.description || "",
      meaning: r.meaning || "",
      religion: r.religion || "hindu",
      category: r.category || "daily",
      steps: (r.steps || []).join("\n"),
      checklist: (r.checklist || []).join("\n"),
      requiredItems: (r.requiredItems || []).join("\n"),
      imageFile: null,
      imageUrl: r.images?.[0] || "",
    });
    setFormMode("edit-ritual");
  };

  const handleDeleteRitual = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this ritual?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteRitual(id);
            Alert.alert("Deleted", "Ritual successfully removed");
            loadAllData();
          } catch (e) {
            Alert.alert("Error", e.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // Toggle checklist values
  const toggleArrayItem = (key, val, formType) => {
    if (formType === 'product') {
      setProductForm(prev => {
        const arr = prev[key];
        const newArr = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
        return { ...prev, [key]: newArr };
      });
    }
  };

  const toggleBookingDetails = (id) => {
    setExpandedBookingIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openBookingList = (status = null) => {
    setBookingStatusFilter(status);
    setActiveTab("bookings");
    setFormMode(null);
  };

  const bookingList = bookingStatusFilter
    ? bookings.filter(b => b.status === bookingStatusFilter)
    : bookings;

  const summaryUsers = Array.isArray(userSummary.users) ? userSummary.users : [];
  const summaryCategories = userSummary.categories || EMPTY_USER_SUMMARY.categories;
  const approvedUsers = summaryUsers.filter(user => user?.isVerified);
  const userCategories = USER_CATEGORIES;

  if (loading && bookings.length === 0) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: theme.background }]}>
        <ListSkeleton count={6} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Professional Navbar */}
      <View style={[styles.topNavbar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.navLogoSection}>
          <Text style={[styles.logoText, { color: theme.primary }]}>卐 Sanskar Admin</Text>
          <Text style={[styles.logoSubtitle, { color: theme.textMuted }]}>Platform Control</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navItemsRow}>
          {[
            { id: "overview", label: "Overview", icon: "grid-outline" },
            { id: "approvals", label: "User Approvals", icon: "person-add-outline" },
            { id: "users", label: "User Categories", icon: "people-outline" },
            { id: "articles", label: "Articles", icon: "document-text-outline" },
            { id: "rituals", label: "Rituals", icon: "flame-outline" },
            { id: "products", label: "Products", icon: "storefront-outline" },
            { id: "bookings", label: "Bookings", icon: "calendar-outline" },
            { id: "calendar", label: "Festivals", icon: "today-outline" },
          ].map(tab => (
            <Pressable
              key={tab.id}
              onPress={() => { setActiveTab(tab.id); setFormMode(null); }}
              style={[
                styles.navBtn,
                activeTab === tab.id && { borderBottomColor: theme.primary, borderBottomWidth: 3 }
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === tab.id ? theme.primary : theme.textSecondary },
                  activeTab === tab.id && { fontWeight: "bold" }
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable onPress={logout} style={styles.logoutBtn} hitSlop={12}>
          <Ionicons name="log-out-outline" size={22} color={theme.danger} />
        </Pressable>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.mainScroll}>
        
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === "overview" && (
          <View>
            <Text style={[styles.tabTitle, { color: theme.textPrimary }]}>System Summary</Text>
            <View style={styles.statsGrid}>
              <AppCard style={styles.statCard} onPress={() => openBookingList()}>
                <Text style={[styles.statValue, { color: theme.primary }]}>{stats.totalBookings}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Bookings</Text>
              </AppCard>
              <AppCard style={styles.statCard} onPress={() => openBookingList("pending")}>
                <Text style={[styles.statValue, { color: theme.warning }]}>{stats.pending}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Pending Booking Approvals</Text>
              </AppCard>
              <AppCard style={styles.statCard} onPress={() => setActiveTab("approvals")}>
                <Text style={[styles.statValue, { color: theme.warning }]}>{pendingProviders.length}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Approval Requests</Text>
              </AppCard>
              <AppCard style={styles.statCard} onPress={() => openBookingList("confirmed")}>
                <Text style={[styles.statValue, { color: theme.success }]}>{bookings.filter(b => b.status === "confirmed").length}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Completed</Text>
              </AppCard>
            </View>

            {/* User Approval Section */}
            {false && <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>User Approval Section</Text>}
            {false && (pendingProviders.length === 0 ? (
              <AppCard style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={32} color={theme.success} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No pending user verification requests.</Text>
              </AppCard>
            ) : (
              pendingProviders.map(provider => (
                <AppCard key={provider._id} style={[styles.approvalItem, { borderColor: theme.warning }]}>
                  <View style={styles.row}>
                    <View style={[styles.roleIcon, { backgroundColor: theme.warning + "15" }]}>
                      <Ionicons name={provider.role === "vendor" ? "business" : "person"} size={22} color={theme.warning} />
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.nameText, { color: theme.textPrimary }]}>{provider.name}</Text>
                      <Text style={[styles.roleText, { color: theme.textSecondary }]}>
                        {provider.role.toUpperCase()} • Preference: {provider.religionPreference || "General"}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.textMuted }}>{provider.email}</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <AppButton
                        title="Reject"
                        size="sm"
                        onPress={() => handleVerify(provider._id, "decline")}
                        loading={actionLoading === provider._id}
                        variant="outline"
                        style={{ borderColor: theme.danger }}
                        textStyle={{ color: theme.danger }}
                      />
                      <AppButton
                        title="Approve"
                        size="sm"
                        loading={actionLoading === provider._id}
                        onPress={() => handleVerify(provider._id, "approve")}
                      />
                    </View>
                  </View>
                </AppCard>
              ))
            ))}

            {/* Recent Bookings Overview */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Activity</Text>
            {bookings.length === 0 ? (
              <Text style={{ color: theme.textMuted, paddingLeft: 8 }}>No bookings registered yet.</Text>
            ) : (
              bookings.slice(0, 5).map(b => (
                <AppCard key={b._id} style={styles.listRowCard} onPress={() => toggleBookingDetails(b._id)}>
                  <View style={styles.row}>
                    <Ionicons name="calendar-sharp" size={20} color={theme.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: theme.textPrimary, fontWeight: "bold" }}>
                        Customer: {b.user?.name || "Unknown"}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                        Provider: {b.panditOrLama?.name || "Pending Assign"}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: theme.primary + "15" }]}>
                      <Text style={{ color: theme.primary, fontSize: 11 }}>{b.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  {expandedBookingIds[b._id] && (
                    <View style={[styles.detailPanel, { borderTopColor: theme.border }]}>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Customer email: {b.user?.email || "N/A"}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Provider email: {b.panditOrLama?.email || "N/A"}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                        Date: {new Date(b.dateTime).toLocaleDateString()} {new Date(b.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </View>
                  )}
                </AppCard>
              ))
            )}
          </View>
        )}

        {/* ==================== USER APPROVALS TAB ==================== */}
        {activeTab === "approvals" && (
          <View>
            <Text style={[styles.tabTitle, { color: theme.textPrimary }]}>User Approval Requests</Text>
            <View style={styles.statsGrid}>
              <AppCard style={styles.statCard}>
                <Text style={[styles.statValue, { color: theme.warning }]}>{pendingProviders.length}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Pending</Text>
              </AppCard>
              <AppCard style={styles.statCard}>
                <Text style={[styles.statValue, { color: theme.success }]}>{approvedUsers.length}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Approved History</Text>
              </AppCard>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Pending Requests</Text>
            {pendingProviders.length === 0 ? (
              <AppCard style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={32} color={theme.success} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No pending user verification requests.</Text>
              </AppCard>
            ) : (
              pendingProviders.map(provider => (
                <AppCard key={provider._id} style={[styles.approvalItem, { borderColor: theme.warning }]}>
                  <View style={styles.row}>
                    <View style={[styles.roleIcon, { backgroundColor: theme.warning + "15" }]}>
                      <Ionicons name={provider.role === "vendor" ? "business" : "person"} size={22} color={theme.warning} />
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.nameText, { color: theme.textPrimary }]}>{provider.name}</Text>
                      <Text style={[styles.roleText, { color: theme.textSecondary }]}>
                        {provider.role.toUpperCase()} - Preference: {provider.religionPreference || "General"}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.textMuted }}>{provider.email}</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <AppButton
                        title="Reject"
                        size="sm"
                        onPress={() => handleVerify(provider._id, "decline")}
                        loading={actionLoading === provider._id}
                        variant="outline"
                        style={{ borderColor: theme.danger }}
                        textStyle={{ color: theme.danger }}
                      />
                      <AppButton
                        title="Approve"
                        size="sm"
                        loading={actionLoading === provider._id}
                        onPress={() => handleVerify(provider._id, "approve")}
                      />
                    </View>
                  </View>
                </AppCard>
              ))
            )}

            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Approval History</Text>
            {approvedUsers.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No approved users found.</Text>
            ) : (
              approvedUsers.map(user => (
                <AppCard key={user._id} style={styles.listRowCard}>
                  <View style={styles.row}>
                    <View style={[styles.roleIcon, { backgroundColor: theme.success + "15" }]}>
                      <Ionicons name="checkmark-done-outline" size={20} color={theme.success} />
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.nameText, { color: theme.textPrimary }]}>{user.name}</Text>
                      <Text style={[styles.roleText, { color: theme.textSecondary }]}>
                        {user.role?.toUpperCase()} - {user.email}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: theme.success + "15" }]}>
                      <Text style={{ color: theme.success, fontSize: 11 }}>APPROVED</Text>
                    </View>
                  </View>
                </AppCard>
              ))
            )}
          </View>
        )}

        {/* ==================== USER CATEGORIES TAB ==================== */}
        {activeTab === "users" && (
          <View>
            <Text style={[styles.tabTitle, { color: theme.textPrimary }]}>Users by Category</Text>
            <View style={styles.statsGrid}>
              <AppCard 
                style={[styles.statCard, !selectedUserRole && { borderColor: theme.primary, borderWidth: 1 }]} 
                onPress={() => setSelectedUserRole(null)}
              >
                <Text style={[styles.statValue, { color: theme.primary }]}>{Number(userSummary.total) || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Users</Text>
              </AppCard>
              {userCategories.map(role => (
                <AppCard 
                  key={role} 
                  style={[styles.statCard, selectedUserRole === role && { borderColor: theme.primary, borderWidth: 1 }]}
                  onPress={() => setSelectedUserRole(role)}
                >
                  <Text style={[styles.statValue, { color: theme.primary }]}>{summaryCategories[role] || 0}</Text>
                  <Text style={[styles.statLabel, { color: theme.textMuted, textTransform: "capitalize" }]}>
                    {role === "unassigned" ? "Unassigned" : role}
                  </Text>
                </AppCard>
              ))}
            </View>

            {userCategories
              .filter(role => !selectedUserRole || selectedUserRole === role)
              .map(role => {
              const roleUsers = summaryUsers.filter(user => (user?.role || "unassigned") === role);
              return (
                <View key={role}>
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary, textTransform: "capitalize" }]}>
                    {role === "unassigned" ? "Unassigned" : role} ({roleUsers.length})
                  </Text>
                  {roleUsers.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>No {role === "unassigned" ? "unassigned" : role} users found.</Text>
                  ) : (
                    roleUsers.map(user => (
                      <AppCard key={user._id} style={styles.listRowCard}>
                        <View style={styles.row}>
                          <View style={[styles.roleIcon, { backgroundColor: (user.isVerified ? theme.success : theme.warning) + "15" }]}>
                            <Ionicons name={user.isVerified ? "checkmark-circle-outline" : "time-outline"} size={20} color={user.isVerified ? theme.success : theme.warning} />
                          </View>
                          <View style={styles.info}>
                            <Text style={[styles.nameText, { color: theme.textPrimary }]}>{user.name}</Text>
                            <Text style={[styles.roleText, { color: theme.textSecondary }]}>{user.email}</Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: (user.isVerified ? theme.success : theme.warning) + "15" }]}>
                            <Text style={{ color: user.isVerified ? theme.success : theme.warning, fontSize: 11 }}>
                              {user.isVerified ? "VERIFIED" : "PENDING"}
                            </Text>
                          </View>
                        </View>
                      </AppCard>
                    ))
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ==================== ARTICLES TAB ==================== */}
        {activeTab === "articles" && (
          <View>
            <View style={styles.tabHeader}>
              <Text style={[styles.tabTitle, { color: theme.textPrimary }]}>Manage Articles</Text>
              {!formMode && (
                <AppButton
                  title="Add Article"
                  size="sm"
                  onPress={() => setFormMode("add-article")}
                  icon="add"
                />
              )}
            </View>

            {formMode === "add-article" ? (
              <AppCard style={styles.formCard}>
                <Text style={[styles.formHeaderTitle, { color: theme.textPrimary }]}>Create New Article</Text>

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Title *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="Enter article title"
                  value={articleForm.title}
                  onChangeText={v => setArticleForm(f => ({ ...f, title: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Overview Content *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, height: 100 }]}
                  placeholder="Enter detailed content..."
                  multiline
                  value={articleForm.content}
                  onChangeText={v => setArticleForm(f => ({ ...f, content: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Spiritual Meaning (Optional)</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="Explain spiritual significance"
                  value={articleForm.meaning}
                  onChangeText={v => setArticleForm(f => ({ ...f, meaning: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Steps (One per line, optional)</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, height: 80 }]}
                  placeholder="Step 1&#10;Step 2&#10;Step 3..."
                  multiline
                  value={articleForm.steps}
                  onChangeText={v => setArticleForm(f => ({ ...f, steps: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Required Items (One per line, optional)</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, height: 80 }]}
                  placeholder="Incense&#10;Flowers&#10;Water container..."
                  multiline
                  value={articleForm.requiredItems}
                  onChangeText={v => setArticleForm(f => ({ ...f, requiredItems: v }))}
                />

                <View style={styles.gridRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Category</Text>
                    <View style={[styles.selectBox, { borderColor: theme.border }]}>
                      <FlatList
                        data={ARTICLE_CATEGORIES}
                        horizontal
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                          <Pressable
                            onPress={() => setArticleForm(f => ({ ...f, category: item }))}
                            style={[
                              styles.chip,
                              { backgroundColor: articleForm.category === item ? theme.primary : theme.surface }
                            ]}
                          >
                            <Text style={{ color: articleForm.category === item ? "#FFF" : theme.textSecondary, textTransform: "capitalize", fontSize: 12 }}>
                              {item}
                            </Text>
                          </Pressable>
                        )}
                      />
                    </View>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Culture / Religion</Text>
                    <View style={styles.row}>
                      {CULTURES.map(c => (
                        <Pressable
                          key={c}
                          onPress={() => setArticleForm(f => ({ ...f, religion: c }))}
                          style={[
                            styles.chip,
                            { backgroundColor: articleForm.religion === c ? theme.primary : theme.surface, marginRight: 8 }
                          ]}
                        >
                          <Text style={{ color: articleForm.religion === c ? "#FFF" : theme.textSecondary, textTransform: "capitalize", fontSize: 12 }}>
                            {c}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Upload Section */}
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Article Banner Image</Text>
                <Pressable onPress={() => triggerImagePick('article')} style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.primaryLight + "08" }]}>
                  {articleForm.imageUrl ? (
                    <Image source={{ uri: articleForm.imageUrl }} style={styles.previewImage} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={32} color={theme.primary} />
                      <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>Click to Upload Banner Image</Text>
                    </>
                  )}
                </Pressable>

                <View style={[styles.row, { marginTop: 20, gap: 12, justifyContent: "flex-end" }]}>
                  <AppButton title="Cancel" variant="outline" onPress={() => setFormMode(null)} />
                  <AppButton title="Save Article" onPress={handleAddArticle} />
                </View>
              </AppCard>
            ) : (
              <View>
                {articles.length === 0 ? (
                  <View style={styles.noArticlesWrapper}>
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>No Articles Available</Text>
                    <AppButton title="Add Your First Article" onPress={() => setFormMode("add-article")} style={{ marginTop: 12 }} />
                  </View>
                ) : (
                  articles.map(art => (
                    <AppCard key={art._id} style={styles.listRowCard}>
                      <View style={styles.row}>
                        {art.images?.[0] ? (
                          <Image source={{ uri: art.images[0] }} style={styles.thumbnail} />
                        ) : (
                          <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.primaryLight + "15" }]}>
                            <Ionicons name="document-text" size={20} color={theme.primary} />
                          </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[styles.listRowTitle, { color: theme.textPrimary }]} numberOfLines={1}>{art.title}</Text>
                          <Text style={{ color: theme.textMuted, fontSize: 11 }}>
                            Category: {art.category} • Culture: {art.religion}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 6 }}>
                          <AppButton
                            title="View"
                            size="sm"
                            variant="outline"
                            onPress={() => navigation.navigate("ArticleDetail", { articleId: art._id })}
                          />
                          <Pressable onPress={() => handleDeleteArticle(art._id)} style={{ padding: 6 }}>
                            <Ionicons name="trash-outline" size={20} color={theme.danger} />
                          </Pressable>
                        </View>
                      </View>
                    </AppCard>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* ==================== RITUALS TAB ==================== */}
        {activeTab === "rituals" && (
          <View>
            <View style={styles.tabHeader}>
              <Text style={[styles.tabTitle, { color: theme.textPrimary }]}>Manage Rituals</Text>
              {!formMode && (
                <AppButton
                  title="Add Ritual"
                  size="sm"
                  onPress={() => { setFormMode("add-ritual"); setEditingId(null); setRitualForm(EMPTY_RITUAL_FORM); }}
                  icon="add"
                />
              )}
            </View>

            {formMode === "add-ritual" || formMode === "edit-ritual" ? (
              <AppCard style={styles.formCard}>
                <Text style={[styles.formHeaderTitle, { color: theme.textPrimary }]}>
                  {formMode === "edit-ritual" ? "Edit Ritual" : "Create New Ritual"}
                </Text>

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Title *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. Satyanarayan Puja / Bodhi Day Meditation"
                  placeholderTextColor={theme.textMuted}
                  value={ritualForm.title}
                  onChangeText={v => setRitualForm(f => ({ ...f, title: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Description *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, height: 90 }]}
                  placeholder="Brief description of this ritual, its origin and purpose..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  value={ritualForm.description}
                  onChangeText={v => setRitualForm(f => ({ ...f, description: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Spiritual Meaning (Optional)</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="Deeper spiritual significance of this ritual..."
                  placeholderTextColor={theme.textMuted}
                  value={ritualForm.meaning}
                  onChangeText={v => setRitualForm(f => ({ ...f, meaning: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Steps (One per line)</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, height: 90 }]}
                  placeholder={"Light the diya\nOffer flowers to deity\nChant the mantra..."}
                  placeholderTextColor={theme.textMuted}
                  multiline
                  value={ritualForm.steps}
                  onChangeText={v => setRitualForm(f => ({ ...f, steps: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Checklist / Do's &amp; Don'ts (One per line)</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, height: 80 }]}
                  placeholder={"Fast before puja\nWear clean clothes\nAvoid non-veg..."}
                  placeholderTextColor={theme.textMuted}
                  multiline
                  value={ritualForm.checklist}
                  onChangeText={v => setRitualForm(f => ({ ...f, checklist: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Required Items (One per line)</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, height: 80 }]}
                  placeholder={"Incense sticks\nFlowers\nCoconut\nGhee lamp..."}
                  placeholderTextColor={theme.textMuted}
                  multiline
                  value={ritualForm.requiredItems}
                  onChangeText={v => setRitualForm(f => ({ ...f, requiredItems: v }))}
                />

                <View style={styles.gridRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Culture / Religion *</Text>
                    <View style={styles.row}>
                      {CULTURES.map(c => (
                        <Pressable
                          key={c}
                          onPress={() => setRitualForm(f => ({ ...f, religion: c }))}
                          style={[
                            styles.chip,
                            { backgroundColor: ritualForm.religion === c ? theme.primary : theme.surface, marginRight: 8 }
                          ]}
                        >
                          <Text style={{ color: ritualForm.religion === c ? "#FFF" : theme.textSecondary, textTransform: "capitalize", fontSize: 12 }}>
                            {c}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Ritual Category *</Text>
                    <View style={[styles.selectBox, { borderColor: theme.border }]}>
                      <FlatList
                        data={RITUAL_CATEGORIES}
                        horizontal
                        keyExtractor={item => item}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                          <Pressable
                            onPress={() => setRitualForm(f => ({ ...f, category: item }))}
                            style={[
                              styles.chip,
                              { backgroundColor: ritualForm.category === item ? theme.accent : theme.surface, marginRight: 6 }
                            ]}
                          >
                            <Text style={{ color: ritualForm.category === item ? "#FFF" : theme.textSecondary, textTransform: "capitalize", fontSize: 12 }}>
                              {item}
                            </Text>
                          </Pressable>
                        )}
                      />
                    </View>
                  </View>
                </View>

                {/* Upload Section */}
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Ritual Image (Optional)</Text>
                <Pressable onPress={() => triggerImagePick('ritual')} style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.primaryLight + "08" }]}>
                  {ritualForm.imageUrl ? (
                    <Image source={{ uri: ritualForm.imageUrl }} style={styles.previewImage} />
                  ) : (
                    <>
                      <Ionicons name="flame-outline" size={32} color={theme.primary} />
                      <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>Click to Upload Ritual Image</Text>
                    </>
                  )}
                </Pressable>

                <View style={[styles.row, { marginTop: 20, gap: 12, justifyContent: "flex-end" }]}>
                  <AppButton
                    title="Cancel"
                    variant="outline"
                    onPress={() => { setFormMode(null); setEditingId(null); setRitualForm(EMPTY_RITUAL_FORM); }}
                  />
                  <AppButton
                    title={formMode === "edit-ritual" ? "Update Ritual" : "Save Ritual"}
                    onPress={handleSaveRitual}
                  />
                </View>
              </AppCard>
            ) : (
              <View>
                {/* Stats mini-row */}
                <View style={[styles.statsGrid, { marginBottom: 12 }]}>
                  <AppCard style={styles.statCard}>
                    <Text style={[styles.statValue, { color: theme.primary }]}>{rituals.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Rituals</Text>
                  </AppCard>
                  <AppCard style={styles.statCard}>
                    <Text style={[styles.statValue, { color: "#FF6B35" }]}>{rituals.filter(r => r.religion === "hindu").length}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Hindu</Text>
                  </AppCard>
                  <AppCard style={styles.statCard}>
                    <Text style={[styles.statValue, { color: "#7B4EAB" }]}>{rituals.filter(r => r.religion === "buddhist").length}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Buddhist</Text>
                  </AppCard>
                </View>

                {rituals.length === 0 ? (
                  <View style={styles.noArticlesWrapper}>
                    <Ionicons name="flame-outline" size={40} color={theme.textMuted} />
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>No Rituals Found</Text>
                    <AppButton
                      title="Add Your First Ritual"
                      onPress={() => setFormMode("add-ritual")}
                      style={{ marginTop: 12 }}
                    />
                  </View>
                ) : (
                  rituals.map(r => (
                    <AppCard key={r._id} style={styles.listRowCard}>
                      <View style={styles.row}>
                        {r.images?.[0] ? (
                          <Image source={{ uri: r.images[0] }} style={styles.thumbnail} />
                        ) : (
                          <View
                            style={[
                              styles.thumbnailPlaceholder,
                              { backgroundColor: r.religion === "hindu" ? "#FFF3EE" : "#F5EEFF" },
                            ]}
                          >
                            <Ionicons
                              name="flame-outline"
                              size={20}
                              color={r.religion === "hindu" ? "#FF6B35" : "#7B4EAB"}
                            />
                          </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[styles.listRowTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                            {r.title}
                          </Text>
                          <Text style={{ color: theme.textMuted, fontSize: 11 }}>
                            {r.religion?.toUpperCase()} • {r.category} • {(r.steps || []).length} steps
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                          <Pressable onPress={() => handleEditRitualClick(r)} style={{ padding: 6 }}>
                            <Ionicons name="create-outline" size={20} color={theme.primary} />
                          </Pressable>
                          <Pressable onPress={() => handleDeleteRitual(r._id)} style={{ padding: 6 }}>
                            <Ionicons name="trash-outline" size={20} color={theme.danger} />
                          </Pressable>
                        </View>
                      </View>
                    </AppCard>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* ==================== PRODUCTS TAB ==================== */}
        {activeTab === "products" && (
          <View>
            <View style={styles.tabHeader}>
              <Text style={[styles.tabTitle, { color: theme.textPrimary }]}>Sacred Shop Products</Text>
            </View>

            <View>
              {products.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No products found in shop.</Text>
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
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <AppButton
                          title="View"
                          size="sm"
                          variant="outline"
                          onPress={() => navigation.navigate("ProductDetail", { productId: prod._id })}
                        />
                      </View>
                    </View>
                  </AppCard>
                ))
              )}
            </View>
          </View>
        )}

        {/* ==================== BOOKINGS TAB ==================== */}
        {activeTab === "bookings" && (
          <View>
            <View style={styles.tabHeader}>
              <Text style={[styles.tabTitle, { color: theme.textPrimary }]}>
                {bookingStatusFilter ? `${bookingStatusFilter.toUpperCase()} Bookings` : "Global Booking Log"}
              </Text>
              {bookingStatusFilter && (
                <AppButton title="Show All" size="sm" variant="outline" onPress={() => setBookingStatusFilter(null)} />
              )}
            </View>
            {bookingList.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No bookings found on the platform.</Text>
            ) : (
              bookingList.map(b => (
                <AppCard key={b._id} style={styles.bookingRowCard} onPress={() => toggleBookingDetails(b._id)}>
                  <View style={styles.bookingHeader}>
                    <View style={styles.row}>
                      <Ionicons name="receipt-outline" size={18} color={theme.primary} />
                      <Text style={[styles.bookingIdText, { color: theme.textPrimary }]}>
                        ID: {b._id.substring(b._id.length - 8).toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: theme.primary + "15" }]}>
                      <Text style={{ color: theme.primary, fontSize: 10, fontWeight: "bold" }}>
                        {b.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingBody}>
                    <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 4 }}>
                      👤 **Customer:** {b.user?.name || "N/A"} ({b.user?.email || "N/A"})
                    </Text>
                    <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 4 }}>
                      🕉️ **Ritual Service Provider:** {b.panditOrLama?.name || "Unassigned"} ({b.panditOrLama?.email || "N/A"})
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                      📅 **Scheduled Date:** {new Date(b.dateTime).toLocaleDateString()} {new Date(b.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </AppCard>
              ))
            )}
          </View>
        )}

        {/* ==================== CALENDAR TAB ==================== */}
        {activeTab === "calendar" && (
          <View>
            <View style={styles.tabHeader}>
              <Text style={[styles.tabTitle, { color: theme.textPrimary }]}>Manage Festival Dates</Text>
              {!formMode && (
                <AppButton
                  title="Add Important Date"
                  size="sm"
                  onPress={() => setFormMode("add-festival")}
                  icon="add"
                />
              )}
            </View>

            {formMode === "add-festival" || formMode === "edit-festival" ? (
              <AppCard style={styles.formCard}>
                <Text style={[styles.formHeaderTitle, { color: theme.textPrimary }]}>
                  {formMode === 'edit-festival' ? 'Edit Important Date' : 'Mark Important Date'}
                </Text>

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Title (Mandatory) *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. Ghode Jatra / घोडेजात्रा"
                  value={festivalForm.title}
                  onChangeText={v => setFestivalForm(f => ({ ...f, title: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. 2026-06-05"
                  value={festivalForm.date}
                  onChangeText={v => setFestivalForm(f => ({ ...f, date: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Description (Mandatory) *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, height: 100 }]}
                  placeholder="Describe significance, rituals performed, history..."
                  multiline
                  value={festivalForm.description}
                  onChangeText={v => setFestivalForm(f => ({ ...f, description: v }))}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Culture Preference</Text>
                <View style={styles.row}>
                  {["general", "national", "hindu", "buddhist"].map(r => (
                    <Pressable
                      key={r}
                      onPress={() => setFestivalForm(f => ({ ...f, religion: r }))}
                      style={[
                        styles.chip,
                        { backgroundColor: festivalForm.religion === r ? theme.primary : theme.surface, marginRight: 8 }
                      ]}
                    >
                      <Text style={{ color: festivalForm.religion === r ? "#FFF" : theme.textSecondary, textTransform: "capitalize", fontSize: 12 }}>
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Upload Section */}
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Festival Image (Optional)</Text>
                <Pressable onPress={() => triggerImagePick('festival')} style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.primaryLight + "08" }]}>
                  {festivalForm.imageUrl ? (
                    <Image source={{ uri: festivalForm.imageUrl }} style={styles.previewImage} />
                  ) : (
                    <>
                      <Ionicons name="calendar" size={32} color={theme.primary} />
                      <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>Click to Upload Festival Image</Text>
                    </>
                  )}
                </Pressable>

                <View style={[styles.row, { marginTop: 20, gap: 12, justifyContent: "flex-end" }]}>
                  <AppButton title="Cancel" variant="outline" onPress={() => { setFormMode(null); setEditingId(null); }} />
                  <AppButton title="Save Festival" onPress={handleSaveFestival} />
                </View>
              </AppCard>
            ) : (
              <View>
                {/* Festivals Management Grid List */}
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  Managing marked dates for current month:
                </Text>
                {festivals.length === 0 ? (
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>No marked festival dates found for this month.</Text>
                ) : (
                  festivals.map(f => (
                    <AppCard key={f._id} style={styles.listRowCard}>
                      <View style={styles.row}>
                        {f.image ? (
                          <Image source={{ uri: f.image }} style={styles.thumbnail} />
                        ) : (
                          <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.primaryLight + "15" }]}>
                            <Ionicons name="calendar" size={20} color={theme.primary} />
                          </View>
                        )}
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[styles.listRowTitle, { color: theme.textPrimary }]} numberOfLines={1}>{f.title}</Text>
                          <Text style={{ color: theme.textMuted, fontSize: 11 }}>
                            Date: {new Date(f.date).toLocaleDateString()} • Culture: {f.religion || "General"}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                          <Pressable onPress={() => handleEditFestivalClick(f)} style={{ padding: 6 }}>
                            <Ionicons name="create-outline" size={22} color={theme.primary} />
                          </Pressable>
                          <Pressable onPress={() => handleDeleteFestival(f._id)} style={{ padding: 6 }}>
                            <Ionicons name="trash-outline" size={22} color={theme.danger} />
                          </Pressable>
                        </View>
                      </View>
                    </AppCard>
                  ))
                )}
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingCenter: { flex: 1, padding: 16 },
  topNavbar: {
    paddingTop: Platform.OS === "ios" ? 44 : 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  navLogoSection: {
    marginRight: 12,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  logoSubtitle: {
    fontSize: 10,
  },
  navItemsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 8,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
  },
  mainScroll: {
    padding: 16,
    paddingBottom: 80,
  },
  tabHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flexGrow: 1,
    minWidth: 140,
    padding: 14,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },
  approvalItem: {
    marginBottom: 10,
    padding: 12,
    borderWidth: 1.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleIcon: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "600",
  },
  roleText: {
    fontSize: 11,
    marginVertical: 2,
  },
  listRowCard: {
    marginBottom: 8,
    padding: 10,
  },
  listRowTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailPanel: {
    borderTopWidth: 1,
    gap: 4,
    marginTop: 10,
    paddingTop: 10,
  },
  noArticlesWrapper: {
    alignItems: "center",
    paddingVertical: 40,
  },
  formCard: {
    padding: 16,
    marginBottom: 20,
  },
  formHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  gridRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  selectBox: {
    borderWidth: 1.2,
    borderRadius: 10,
    padding: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  checkboxContainer: {
    borderWidth: 1.2,
    borderRadius: 10,
    padding: 8,
    gap: 6,
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 10,
  },
  checkboxText: {
    fontSize: 13,
    fontWeight: "500",
  },
  bookingRowCard: {
    marginBottom: 10,
    padding: 12,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
    marginBottom: 8,
  },
  bookingIdText: {
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 6,
  },
  bookingBody: {
    paddingVertical: 4,
  },
});

export default memo(AdminDashboardScreen);
