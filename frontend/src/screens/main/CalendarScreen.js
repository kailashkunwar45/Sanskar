import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import AppCard from "../../components/common/AppCard";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { fetchFestivals } from "../../services/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function CalendarScreen() {
  const { theme } = useTheme();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFestivals = useCallback(async (y, m) => {
    setLoading(true);
    try {
      const res = await fetchFestivals(y, m);
      setFestivals(res.festivals || []);
    } catch {
      setFestivals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFestivals(year, month);
  }, [year, month, loadFestivals]);

  const festivalDates = useMemo(() => {
    const set = new Set();
    festivals.forEach((f) => {
      const d = new Date(f.date);
      set.add(d.getDate());
    });
    return set;
  }, [festivals]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const calendarDays = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  const goNextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };
  const goPrevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <Pressable onPress={goPrevMonth} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>
          {MONTHS[month - 1]} {year}
        </Text>
        <Pressable onPress={goNextMonth} hitSlop={12}>
          <Ionicons name="chevron-forward" size={24} color={theme.textPrimary} />
        </Pressable>
      </View>

      {/* Day Headers */}
      <View style={styles.daysRow}>
        {DAYS.map((d) => (
          <Text key={d} style={[styles.dayHeader, { color: theme.textMuted }]}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {calendarDays.map((day, idx) => {
          const isFestival = day && festivalDates.has(day);
          const isToday = isCurrentMonth && day === today;
          return (
            <View key={idx} style={styles.cell}>
              {day ? (
                <View
                  style={[
                    styles.dayCircle,
                    isToday && { backgroundColor: theme.primary },
                    isFestival && !isToday && { backgroundColor: theme.warning + "30" },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: isToday ? "#FFF" : theme.textPrimary },
                    ]}
                  >
                    {day}
                  </Text>
                  {isFestival && (
                    <View
                      style={[
                        styles.festivalDot,
                        { backgroundColor: isToday ? "#FFF" : theme.warning },
                      ]}
                    />
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Festival List */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        Festivals This Month
      </Text>
      {loading ? (
        <ListSkeleton count={3} />
      ) : festivals.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>
          No festivals this month
        </Text>
      ) : (
        <FlatList
          data={festivals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AppCard style={styles.fCard}>
              <View style={styles.fRow}>
                <View
                  style={[
                    styles.fDateBadge,
                    { backgroundColor: theme.primary + "15" },
                  ]}
                >
                  <Text style={[styles.fDateText, { color: theme.primary }]}>
                    {new Date(item.date).getDate()}
                  </Text>
                </View>
                <View style={styles.fInfo}>
                  <Text style={[styles.fTitle, { color: theme.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.fReligion, { color: theme.textSecondary }]}>
                    {item.religion === "hindu" ? "🙏 Hindu" : "☸️ Buddhist"}
                  </Text>
                </View>
              </View>
            </AppCard>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  monthNav: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  monthTitle: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold },
  daysRow: { flexDirection: "row", marginBottom: 8 },
  dayHeader: {
    flex: 1,
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.semibold,
    textAlign: "center",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: `${100 / 7}%`,
  },
  dayCircle: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  dayText: { fontSize: fonts.sizes.sm, fontWeight: fonts.weights.medium },
  festivalDot: { borderRadius: 2, height: 4, marginTop: 1, width: 4 },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    marginBottom: 8,
    marginTop: 16,
  },
  empty: { fontSize: fonts.sizes.md, textAlign: "center", marginTop: 20 },
  fCard: { paddingVertical: 10 },
  fRow: { alignItems: "center", flexDirection: "row" },
  fDateBadge: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  fDateText: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold },
  fInfo: { flex: 1, marginLeft: 14 },
  fTitle: { fontSize: fonts.sizes.md, fontWeight: fonts.weights.semibold },
  fReligion: { fontSize: fonts.sizes.sm, marginTop: 2 },
});

export default memo(CalendarScreen);
