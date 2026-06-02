import { memo } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import NepaliDatePkg from "nepali-date-converter";
const NepaliDate = NepaliDatePkg.default || NepaliDatePkg;

const NE_D = ["०","१","२","३","४","५","६","७","८","९"];
const toN  = (n) => n == null ? "" : String(n).replace(/[0-9]/g, d => NE_D[+d]);

const MONTHS_NE = [
  "बैशाख","जेठ","आषाढ","श्रावण",
  "भदौ","असोज","कार्तिक","मंसिर",
  "पुस","माघ","फागुन","चैत",
];
const MONTHS_EN = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS_NE = ["आइतबार","सोमबार","मंगलबार","बुधबार","बिहीबार","शुक्रबार","शनिबार"];

const RELIGION_META = {
  national: { label: "🇳🇵 सार्वजनिक बिदा",   color: "#E53935", bg: "#E5393515" },
  hindu:    { label: "🙏 हिन्दू पर्व",         color: "#FF6D00", bg: "#FF6D0015" },
  buddhist: { label: "☸️ बौद्ध पर्व",         color: "#1E88E5", bg: "#1E88E515" },
  general:  { label: "📅 सामान्य पर्व",        color: "#E53935", bg: "#E5393515" },
};

function EventDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { event } = route.params ?? {};

  if (!event) {
    return (
      <View style={[styles.center, { backgroundColor: "#0D0D0D", flex: 1 }]}>
        <Ionicons name="calendar-outline" size={64} color="#444" />
        <Text style={styles.errTxt}>उत्सव विवरण फेला परेन।</Text>
      </View>
    );
  }

  const jsDate   = new Date(event.date);
  const dow      = jsDate.getDay();
  const adDay    = jsDate.getDate();
  const adMonth  = jsDate.getMonth();
  const adYear   = jsDate.getFullYear();

  let bsDay = 0, bsMonth = 0, bsYear = 0;
  try {
    const nd = new NepaliDate(jsDate);
    bsDay   = nd.getDate();
    bsMonth = nd.getMonth();
    bsYear  = nd.getYear();
  } catch {}

  const rel = RELIGION_META[event.religion] ?? RELIGION_META.general;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Banner / Image ── */}
      {event.image ? (
        <Image source={{ uri: event.image }} style={styles.banner} />
      ) : (
        <View style={[styles.bannerPlaceholder, { backgroundColor: rel.color + "22" }]}>
          <Ionicons name="calendar" size={80} color={rel.color} />
        </View>
      )}

      {/* Back button overlay */}
      <Pressable
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        hitSlop={10}
      >
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </Pressable>

      {/* ── Main Content ── */}
      <View style={styles.content}>

        {/* Religion badge */}
        <View style={[styles.relBadge, { backgroundColor: rel.bg, borderColor: rel.color + "44" }]}>
          <Text style={[styles.relTxt, { color: rel.color }]}>{rel.label}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{event.title}</Text>

        {/* Date boxes */}
        <View style={styles.dateRow}>
          {/* BS Date */}
          <View style={[styles.dateBox, { borderColor: rel.color + "55" }]}>
            <Text style={styles.dateBoxLabel}>विक्रम संवत्</Text>
            <Text style={[styles.dateBoxBig, { color: rel.color }]}>
              {toN(bsDay)} {MONTHS_NE[bsMonth]}
            </Text>
            <Text style={styles.dateBoxYear}>{toN(bsYear)}</Text>
          </View>
          {/* AD Date */}
          <View style={[styles.dateBox, { borderColor: "#33334A" }]}>
            <Text style={styles.dateBoxLabel}>ईसवी सन्</Text>
            <Text style={[styles.dateBoxBig, { color: "#DDDDFF" }]}>
              {adDay} {MONTHS_EN[adMonth]}
            </Text>
            <Text style={styles.dateBoxYear}>{adYear}</Text>
          </View>
        </View>

        {/* Day of week */}
        <View style={styles.dowRow}>
          <Ionicons name="calendar-outline" size={16} color="#777799" />
          <Text style={styles.dowTxt}>{DAYS_NE[dow]}</Text>
        </View>

        {/* Description */}
        {event.description ? (
          <View style={styles.descCard}>
            <View style={styles.descHeaderRow}>
              <View style={[styles.descBar, { backgroundColor: rel.color }]} />
              <Text style={styles.descHeader}>विवरण / Description</Text>
            </View>
            <Text style={styles.descTxt}>{event.description}</Text>
          </View>
        ) : (
          <View style={styles.descCard}>
            <Text style={styles.noDesc}>यस पर्वको विवरण उपलब्ध छैन।</Text>
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: "#0D0D0D" },
  scroll: { paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errTxt: { fontSize: 16, color: "#555", marginTop: 14 },

  // Banner
  banner: { width: "100%", height: 260, resizeMode: "cover" },
  bannerPlaceholder: {
    width: "100%", height: 220,
    alignItems: "center", justifyContent: "center",
  },

  // Back button overlaid on banner
  backBtn: {
    position: "absolute",
    top: Platform.OS === "web" ? 16 : 52,
    left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center",
  },

  content: { paddingHorizontal: 16, paddingTop: 18 },

  // Religion badge
  relBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    marginBottom: 12,
  },
  relTxt: { fontSize: 13, fontWeight: "700" },

  // Title
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 34,
    letterSpacing: 0.2,
    marginBottom: 18,
  },

  // Date boxes
  dateRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  dateBox: {
    flex: 1,
    backgroundColor: "#161628",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  dateBoxLabel: { fontSize: 10, color: "#666688", fontWeight: "700", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  dateBoxBig:   { fontSize: 18, fontWeight: "900", textAlign: "center" },
  dateBoxYear:  { fontSize: 12, color: "#666688", marginTop: 3 },

  // Day of week
  dowRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
  dowTxt: { fontSize: 14, color: "#8888AA", fontWeight: "600" },

  // Description card
  descCard: {
    backgroundColor: "#161628",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2A2A50",
  },
  descHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  descBar: { width: 4, height: 18, borderRadius: 2 },
  descHeader: { fontSize: 14, fontWeight: "800", color: "#AAAACC", letterSpacing: 0.3 },
  descTxt: { fontSize: 15, lineHeight: 26, color: "#CCCCDD" },
  noDesc:  { fontSize: 14, color: "#555566", textAlign: "center", paddingVertical: 20 },
});

export default memo(EventDetailScreen);
