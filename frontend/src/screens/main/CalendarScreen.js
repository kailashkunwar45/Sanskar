import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchFestivals } from "../../services/api";
import NepaliDatePkg from "nepali-date-converter";
const NepaliDate = NepaliDatePkg.default || NepaliDatePkg;

const { width: SCREEN_W } = Dimensions.get("window");

// ─────────────────────────────────────────────
// Nepali numerals
const NE_D = ["०","१","२","३","४","५","६","७","८","९"];
const toN = (n) =>
  n == null ? "" : String(n).replace(/[0-9]/g, (d) => NE_D[+d]);

// ─────────────────────────────────────────────
// Constants
const MONTHS_NE = [
  "बैशाख","जेठ","आषाढ","श्रावण",
  "भदौ","असोज","कार्तिक","मंसिर",
  "पुस","माघ","फागुन","चैत",
];
const MONTHS_EN = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NE = ["आ","सो","मं","बु","बि","शु","श"];
const DAY_EN_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const DAY_NE_FULL = ["आइतबार","सोमबार","मंगलबार","बुधबार","बिहीबार","शुक्रबार","शनिबार"];
const TITHI = [
  "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पञ्चमी",
  "षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
  "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा",
  "प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पञ्चमी",
  "षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी",
  "एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","अमावस्या",
];

// Festival colour by religion — red circle for national/holiday, orange for hindu, blue for buddhist
const RELIGION_COLOR = {
  national: "#E53935",   // red — public holiday
  general:  "#E53935",   // also red for general
  hindu:    "#FF6D00",   // deep orange
  buddhist: "#1E88E5",   // blue
};

// ─────────────────────────────────────────────
// Build BS grid
function buildBS(year, month) {
  try {
    const start = new NepaliDate(year, month, 1);
    const dow0 = start.getDay();
    const cells = [];
    for (let i = 0; i < dow0; i++) cells.push(null);
    let d = 1;
    while (true) {
      try {
        const nd = new NepaliDate(year, month, d);
        if (nd.getMonth() !== month) break;
        const js = nd.toJsDate();
        cells.push({
          bsDay: d, dow: nd.getDay(),
          adDay: js.getDate(), adMonth: js.getMonth(), adYear: js.getFullYear(),
          adStr: js.toISOString().split("T")[0],
        });
        d++;
      } catch { break; }
    }
    return cells;
  } catch { return []; }
}

// Build AD grid
function buildAD(year, month) {
  const dim = new Date(year, month, 0).getDate();
  const fd  = new Date(year, month - 1, 1).getDay();
  const cells = [];
  for (let i = 0; i < fd; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) {
    let bsDay = 0, bsMonth = 0, bsYear = 0;
    try {
      const nd = new NepaliDate(new Date(year, month - 1, d));
      bsDay = nd.getDate(); bsMonth = nd.getMonth(); bsYear = nd.getYear();
    } catch {}
    cells.push({
      adDay: d, dow: new Date(year, month - 1, d).getDay(),
      adStr: `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`,
      bsDay, bsMonth, bsYear,
    });
  }
  return cells;
}

function daysDiff(dateStr) {
  const a = new Date(); a.setHours(0,0,0,0);
  const b = new Date(dateStr); b.setHours(0,0,0,0);
  return Math.round((b - a) / 864e5);
}

// ─────────────────────────────────────────────
export default memo(function CalendarScreen({ navigation }) {
  const now = new Date();
  let bsNow;
  try { bsNow = new NepaliDate(now); } catch { bsNow = null; }

  const todayBsY  = bsNow?.getYear()  ?? 2081;
  const todayBsM  = bsNow?.getMonth() ?? 0;
  const todayBsD  = bsNow?.getDate()  ?? 1;
  const todayDow  = now.getDay();
  const todayStr  = now.toISOString().split("T")[0];

  const [mode, setMode]       = useState("BS");
  const [bsY,  setBsY]        = useState(todayBsY);
  const [bsM,  setBsM]        = useState(todayBsM);
  const [adY,  setAdY]        = useState(now.getFullYear());
  const [adM,  setAdM]        = useState(now.getMonth() + 1);
  const [selDate, setSelDate] = useState(null);
  const [festivals, setFests] = useState([]);
  const [tick, setTick]       = useState(now);

  // clock
  useEffect(() => {
    const id = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // fetch
  const load = useCallback(async () => {
    try {
      if (mode === "BS") {
        let fa; try { fa = new NepaliDate(bsY, bsM, 1).toJsDate(); } catch { return; }
        const months = [{ y: fa.getFullYear(), m: fa.getMonth() + 1 }];
        let d = 1, la = fa;
        while (true) {
          try {
            const nd = new NepaliDate(bsY, bsM, d);
            if (nd.getMonth() !== bsM) break;
            la = nd.toJsDate(); d++;
          } catch { break; }
        }
        const lm = { y: la.getFullYear(), m: la.getMonth() + 1 };
        if (!months.some(x => x.y === lm.y && x.m === lm.m)) months.push(lm);
        const rs = await Promise.all(months.map(({ y, m }) => fetchFestivals(y, m)));
        const all = rs.flatMap(r => r?.festivals ?? []);
        setFests(Array.from(new Map(all.map(f => [f._id, f])).values()));
      } else {
        const r = await fetchFestivals(adY, adM);
        setFests(r?.festivals ?? []);
      }
    } catch { setFests([]); }
  }, [mode, bsY, bsM, adY, adM]);

  useEffect(() => { load(); }, [load]);

  // grid & festival map
  const cells = useMemo(() =>
    mode === "BS" ? buildBS(bsY, bsM) : buildAD(adY, adM),
    [mode, bsY, bsM, adY, adM]
  );

  const festMap = useMemo(() => {
    const m = {};
    festivals.forEach(f => {
      const k = f.date?.split("T")[0];
      if (k) { if (!m[k]) m[k] = []; m[k].push(f); }
    });
    return m;
  }, [festivals]);

  // upcoming
  const upcoming = useMemo(() => {
    const t = new Date(); t.setHours(0,0,0,0);
    const c = new Date(t); c.setDate(t.getDate() + 60);
    return festivals
      .filter(f => { const d = new Date(f.date); d.setHours(0,0,0,0); return d >= t && d <= c; })
      .sort((a,b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);
  }, [festivals]);

  // nav
  const prev = () => {
    setSelDate(null);
    if (mode === "BS") { if (bsM===0){setBsY(y=>y-1);setBsM(11);}else setBsM(m=>m-1); }
    else               { if (adM===1){setAdY(y=>y-1);setAdM(12);}else setAdM(m=>m-1); }
  };
  const next = () => {
    setSelDate(null);
    if (mode === "BS") { if (bsM===11){setBsY(y=>y+1);setBsM(0);}else setBsM(m=>m+1); }
    else               { if (adM===12){setAdY(y=>y+1);setAdM(1);}else setAdM(m=>m+1); }
  };

  // clock
  const hh = tick.getHours(), mm = String(tick.getMinutes()).padStart(2,"0"),
        ss = String(tick.getSeconds()).padStart(2,"0"),
        ampm = hh >= 12 ? "PM" : "AM", h12 = hh % 12 || 12;

  const CELL = Math.floor((SCREEN_W - 2) / 7);

  const selFests = selDate ? (festMap[selDate] ?? []) : [];

  return (
    <ScrollView style={S.root} contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>

      {/* ── HEADER ── */}
      <View style={S.header}>
        <View style={S.headerLeft}>
          <Text style={S.bsDateBig}>
            {toN(todayBsD)} {MONTHS_NE[todayBsM]} {toN(todayBsY)}
          </Text>
          <Text style={S.adDateSmall}>
            {MONTHS_EN[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
          </Text>
          <Text style={S.tithiText}>
            तिथि · {TITHI[(todayBsD - 1) % 30]}
          </Text>
          <Text style={S.dowText}>{DAY_NE_FULL[todayDow]}</Text>
        </View>
        <View style={S.clockBox}>
          <Text style={S.clockNum}>{String(h12).padStart(2,"0")}:{mm}</Text>
          <Text style={S.clockSec}>:{ss} {ampm}</Text>
        </View>
      </View>

      {/* ── MODE TOGGLE ── */}
      <View style={S.modeRow}>
        {["BS","AD"].map(m => (
          <Pressable key={m} onPress={() => { setMode(m); setSelDate(null); }}
            style={[S.modeBtn, mode === m && S.modeBtnOn]}>
            <Text style={[S.modeTxt, mode === m && S.modeTxtOn]}>
              {m === "BS" ? "विक्रम सम्वत (BS)" : "ईसवी सन् (AD)"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── CALENDAR CARD ── */}
      <View style={S.calCard}>

        {/* Month header */}
        <View style={S.monthRow}>
          <Pressable onPress={prev} style={S.navBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
          </Pressable>
          <View style={S.monthMid}>
            <Text style={S.monthTitle}>
              {mode === "BS"
                ? `${MONTHS_NE[bsM]} ${toN(bsY)}`
                : `${MONTHS_EN[adM-1]} ${adY}`}
            </Text>
            <Text style={S.monthSub}>
              {mode === "BS"
                ? (() => {
                    try {
                      const j = new NepaliDate(bsY, bsM, 15).toJsDate();
                      return `${MONTHS_EN[j.getMonth()]} ${j.getFullYear()}`;
                    } catch { return ""; }
                  })()
                : `${MONTHS_NE[bsM]} ${toN(bsY)}`}
            </Text>
          </View>
          <Pressable onPress={next} style={S.navBtn} hitSlop={12}>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Day-of-week headers */}
        <View style={S.dayHdrRow}>
          {(mode === "BS" ? DAY_NE : DAY_EN_SHORT).map((d, i) => (
            <View key={i} style={[S.dayHdrCell, { width: CELL }]}>
              <Text style={[S.dayHdrTxt, i === 6 && S.satTxt]}>{d}</Text>
            </View>
          ))}
        </View>

        <View style={S.divider} />

        {/* Grid */}
        <View style={S.grid}>
          {cells.map((cell, idx) => {
            if (!cell) return <View key={`e${idx}`} style={{ width: CELL, height: 52 }} />;

            const isToday  = cell.adStr === todayStr;
            const isSat    = cell.dow === 6;
            const isSun    = cell.dow === 0;
            const fests    = festMap[cell.adStr] ?? [];
            const hasFest  = fests.length > 0;
            // pick the "strongest" colour (national > hindu/buddhist > general)
            const festColor = hasFest
              ? (fests.find(f => f.religion === "national")?.religion
                  || fests[0].religion
                  || "general")
              : null;
            const circle   = hasFest ? RELIGION_COLOR[festColor] ?? "#E53935" : null;
            const isSel    = selDate === cell.adStr;

            const mainNum  = mode === "BS" ? toN(cell.bsDay) : String(cell.adDay);
            const subNum   = mode === "BS" ? String(cell.adDay) : toN(cell.bsDay);

            return (
              <Pressable
                key={cell.adStr}
                style={({ pressed }) => [
                  S.cell,
                  { width: CELL },
                  isSel && S.cellSel,
                  pressed && { opacity: 0.65 },
                ]}
                onPress={() => {
                  if (hasFest) {
                    if (fests.length === 1) {
                      // navigate straight to detail
                      navigation.navigate("EventDetail", { event: fests[0] });
                    } else {
                      // multiple — show panel
                      setSelDate(isSel ? null : cell.adStr);
                    }
                  } else {
                    setSelDate(isSel ? null : cell.adStr);
                  }
                }}
              >
                {/* Circle highlight (today = green, festival = red/orange/blue) */}
                <View style={[
                  S.numWrap,
                  isToday && S.todayCircle,
                  !isToday && hasFest && { backgroundColor: (circle + "22") },
                  !isToday && hasFest && { borderWidth: 1.5, borderColor: circle },
                  isSel && !isToday && S.selCircle,
                ]}>
                  <Text style={[
                    S.numMain,
                    isToday && S.todayNum,
                    !isToday && isSat && S.satNum,
                    !isToday && isSun && S.sunNum,
                    !isToday && hasFest && { color: circle, fontWeight: "800" },
                    isSel && !isToday && S.selNum,
                  ]}>
                    {mainNum}
                  </Text>
                  <Text style={[
                    S.numSub,
                    isToday && S.todaySubNum,
                    !isToday && hasFest && { color: circle + "CC" },
                  ]}>
                    {subNum}
                  </Text>
                </View>

                {/* Festival name snippet below number */}
                {hasFest && (
                  <Text
                    style={[S.festSnippet, { color: circle }]}
                    numberOfLines={1}
                  >
                    {fests[0].title}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── SELECTED DATE FESTIVAL PANEL ── */}
      {selFests.length > 1 && (
        <View style={S.selPanel}>
          {selFests.map(f => {
            const c = RELIGION_COLOR[f.religion] ?? "#E53935";
            return (
              <Pressable
                key={f._id}
                style={[S.selRow, { borderLeftColor: c }]}
                onPress={() => navigation.navigate("EventDetail", { event: f })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={S.selTitle}>{f.title}</Text>
                  <Text style={[S.selRel, { color: c }]}>
                    {f.religion === "hindu" ? "🙏 Hindu" :
                     f.religion === "buddhist" ? "☸️ Buddhist" :
                     f.religion === "national" ? "🇳🇵 National Holiday" : "📅 Festival"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#888" />
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── UPCOMING FESTIVALS ── */}
      {upcoming.length > 0 && (
        <View style={S.upSec}>
          <Text style={S.secTitle}>🎉 आगामी चाडपर्वहरू</Text>
          {upcoming.map((f, i) => {
            const diff = daysDiff(f.date);
            let bsD = "", bsMStr = "";
            try { const n = new NepaliDate(new Date(f.date)); bsD = toN(n.getDate()); bsMStr = MONTHS_NE[n.getMonth()]; } catch {}
            const c = RELIGION_COLOR[f.religion] ?? "#E53935";
            const badge = diff === 0 ? "आज" : diff < 0 ? `${toN(Math.abs(diff))}d पहिले` : `${toN(diff)} दिन`;
            const fdow = new Date(f.date).getDay();
            return (
              <Pressable
                key={f._id}
                style={({ pressed }) => [S.upCard, { borderLeftColor: c }, pressed && { opacity: 0.75 }]}
                onPress={() => navigation.navigate("EventDetail", { event: f })}
              >
                <View style={[S.upDateBox, { backgroundColor: c + "18" }]}>
                  <Text style={[S.upBsD, { color: c }]}>{bsD}</Text>
                  <Text style={[S.upBsMon, { color: c }]}>{bsMStr}</Text>
                </View>
                <View style={S.upInfo}>
                  <Text style={S.upTitle} numberOfLines={1}>{f.title}</Text>
                  <Text style={S.upDow}>{DAY_NE_FULL[fdow]}</Text>
                </View>
                <View style={[S.upBadge, { backgroundColor: c + "22", borderColor: c }]}>
                  <Text style={[S.upBadgeTxt, { color: c }]}>{badge}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── LEGEND ── */}
      <View style={S.legend}>
        {[
          { color: "#2C7A2C", label: "आज" },
          { color: "#E53935", label: "सार्वजनिक बिदा" },
          { color: "#FF6D00", label: "हिन्दू पर्व" },
          { color: "#1E88E5", label: "बौद्ध पर्व" },
          { color: "#E05252", label: "शनिबार" },
        ].map(({ color, label }) => (
          <View key={label} style={S.lgItem}>
            <View style={[S.lgDot, { backgroundColor: color }]} />
            <Text style={S.lgTxt}>{label}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
});

// ─────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0D0D" },
  scroll: { paddingBottom: 50 },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 18 : 52,
    paddingBottom: 16,
    backgroundColor: "#161628",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A50",
  },
  headerLeft: { flex: 1 },
  bsDateBig: { fontSize: 24, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.2 },
  adDateSmall: { fontSize: 12, color: "#9999BB", marginTop: 3 },
  tithiText: { fontSize: 12, color: "#7B7FCC", marginTop: 4, fontWeight: "600" },
  dowText: { fontSize: 12, color: "#9999BB", marginTop: 2 },
  clockBox: { alignItems: "flex-end", justifyContent: "center" },
  clockNum: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", letterSpacing: 2, fontVariant: ["tabular-nums"] },
  clockSec: { fontSize: 13, color: "#9999BB", marginTop: 2, textAlign: "right" },

  // MODE TOGGLE
  modeRow: { flexDirection: "row", margin: 12, backgroundColor: "#1A1A2E", borderRadius: 12, padding: 3 },
  modeBtn: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 10 },
  modeBtnOn: { backgroundColor: "#2C3580" },
  modeTxt: { fontSize: 13, color: "#666699", fontWeight: "600" },
  modeTxtOn: { color: "#FFFFFF" },

  // CALENDAR CARD
  calCard: {
    marginHorizontal: 1,
    backgroundColor: "#161628",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#2A2A50",
    marginBottom: 12,
  },

  // Month nav
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#12122A",
  },
  navBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#252545",
    alignItems: "center", justifyContent: "center",
  },
  monthMid: { alignItems: "center", flex: 1 },
  monthTitle: { fontSize: 19, fontWeight: "900", color: "#FFFFFF" },
  monthSub: { fontSize: 11, color: "#7070AA", marginTop: 2 },

  // Day headers
  dayHdrRow: { flexDirection: "row", paddingTop: 10, paddingBottom: 6, backgroundColor: "#12122A" },
  dayHdrCell: { alignItems: "center" },
  dayHdrTxt: { fontSize: 12, fontWeight: "800", color: "#7070AA" },
  satTxt: { color: "#E53935" },
  sunTxt: { color: "#FF6D00" },

  divider: { height: 1, backgroundColor: "#2A2A50" },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", paddingVertical: 4 },
  cell: {
    height: 58,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 3,
    position: "relative",
  },
  cellSel: { backgroundColor: "#1E1E3A" },

  numWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  todayCircle: { backgroundColor: "#2C5F2E" },
  selCircle: { backgroundColor: "#2A2A50" },

  numMain: { fontSize: 15, fontWeight: "700", color: "#DDDDEE", lineHeight: 18 },
  numSub:  { fontSize: 9,  color: "#55556A", lineHeight: 11 },
  todayNum: { color: "#FFFFFF", fontWeight: "900" },
  todaySubNum: { color: "#AABBAA" },
  satNum: { color: "#E53935" },
  sunNum: { color: "#FF8C42" },
  selNum: { color: "#AAAAEE", fontWeight: "900" },

  festSnippet: {
    fontSize: 7,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 1,
    maxWidth: Math.floor(SCREEN_W / 7) - 2,
    lineHeight: 9,
  },

  // Selected panel (when multiple festivals on one day)
  selPanel: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#161628",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A2A50",
  },
  selRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E3A",
    borderLeftWidth: 4,
    gap: 10,
  },
  selTitle: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  selRel:   { fontSize: 12, marginTop: 2 },

  // Upcoming
  upSec: { marginHorizontal: 12, marginBottom: 12 },
  secTitle: { fontSize: 15, fontWeight: "800", color: "#FFFFFF", marginBottom: 10 },
  upCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161628",
    borderRadius: 12,
    padding: 12,
    marginBottom: 7,
    gap: 12,
    borderLeftWidth: 4,
  },
  upDateBox: { width: 50, height: 50, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  upBsD:    { fontSize: 20, fontWeight: "900" },
  upBsMon:  { fontSize: 9,  fontWeight: "700", marginTop: -2 },
  upInfo:   { flex: 1 },
  upTitle:  { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  upDow:    { fontSize: 11, color: "#888" },
  upBadge:  { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  upBadgeTxt: { fontSize: 11, fontWeight: "700" },

  // Legend
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 10,
    justifyContent: "flex-start",
  },
  lgItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  lgDot: { width: 10, height: 10, borderRadius: 5 },
  lgTxt: { fontSize: 11, color: "#777799" },
});
