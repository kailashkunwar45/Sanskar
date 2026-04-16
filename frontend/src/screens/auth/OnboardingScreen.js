import { memo, useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    icon: "flower-outline",
    title: "卐 Welcome to Sanskar 卐",
    desc: "Explore Hindu & Buddhist religious knowledge, rituals, and sacred traditions.",
  },
  {
    id: "2",
    icon: "cart-outline",
    title: "Sacred Marketplace",
    desc: "Shop pooja items, statues, books, and spiritual accessories from verified vendors.",
  },
  {
    id: "3",
    icon: "calendar-outline",
    title: "Book Pandits & Lamas",
    desc: "Find and book experienced priests for your ceremonies and rituals.",
  },
];

function OnboardingScreen({ navigation }) {
  const { theme, setTheme } = useTheme();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const currentIndex = useRef(0);
  const [selectedReligion, setSelectedReligion] = useState("hindu");

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      currentIndex.current = viewableItems[0].index ?? 0;
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = useCallback(() => {
    if (currentIndex.current < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex.current + 1,
        animated: true,
      });
    } else {
      const finalReligion =
        selectedReligion === "buddhist" ? "buddhist" : "hindu";
      setTheme(finalReligion);
      navigation.replace("Login");
    }
  }, [navigation, selectedReligion, setTheme]);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={[styles.slide, { width }]}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.primaryLight + "40" },
          ]}
        >
          <Ionicons name={item.icon} size={64} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {item.title}
        </Text>
        <Text style={[styles.desc, { color: theme.textSecondary }]}>
          {item.desc}
        </Text>
      </View>
    ),
    [theme]
  );

  const renderDots = () =>
    slides.map((_, i) => {
      const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
      const dotWidth = scrollX.interpolate({
        inputRange,
        outputRange: [8, 28, 8],
        extrapolate: "clamp",
      });
      const dotOpacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.3, 1, 0.3],
        extrapolate: "clamp",
      });
      return (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              width: dotWidth,
              opacity: dotOpacity,
              backgroundColor: theme.primary,
            },
          ]}
        />
      );
    });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View style={styles.footer}>
        <View style={styles.preferenceSection}>
          <Text
            style={[styles.preferenceLabel, { color: theme.textSecondary }]}
          >
            Choose your spiritual path
          </Text>
          <View style={styles.preferenceRow}>
            <Pressable
              onPress={() => setSelectedReligion("hindu")}
              style={[
                styles.preferenceCard,
                {
                  backgroundColor:
                    selectedReligion === "hindu"
                      ? theme.primary
                      : theme.surfaceElevated,
                  borderColor:
                    selectedReligion === "hindu"
                      ? theme.primaryDark
                      : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.preferenceText,
                  {
                    color:
                      selectedReligion === "hindu"
                        ? theme.textOnPrimary
                        : theme.textPrimary,
                  },
                ]}
              >
                Hindu
              </Text>
              <Text
                style={[
                  styles.preferenceSubText,
                  {
                    color:
                      selectedReligion === "hindu"
                        ? theme.textOnPrimary
                        : theme.textSecondary,
                  },
                ]}
              >
                Traditional Vedic rituals
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSelectedReligion("buddhist")}
              style={[
                styles.preferenceCard,
                {
                  backgroundColor:
                    selectedReligion === "buddhist"
                      ? theme.primary
                      : theme.surfaceElevated,
                  borderColor:
                    selectedReligion === "buddhist"
                      ? theme.primaryDark
                      : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.preferenceText,
                  {
                    color:
                      selectedReligion === "buddhist"
                        ? theme.textOnPrimary
                        : theme.textPrimary,
                  },
                ]}
              >
                Buddhist
              </Text>
              <Text
                style={[
                  styles.preferenceSubText,
                  {
                    color:
                      selectedReligion === "buddhist"
                        ? theme.textOnPrimary
                        : theme.textSecondary,
                  },
                ]}
              >
                Lama rituals & dharma
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.dotsRow}>{renderDots()}</View>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Ionicons name="arrow-forward" size={24} color="#FFF" />
        </Pressable>
      </View>
      <Pressable
        onPress={() => navigation.replace("Login")}
        style={styles.skipBtn}
      >
        <Text style={[styles.skipText, { color: theme.textSecondary }]}>
          Skip
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconCircle: {
    alignItems: "center",
    borderRadius: 70,
    height: 140,
    justifyContent: "center",
    marginBottom: 32,
    width: 140,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    marginBottom: 12,
    textAlign: "center",
  },
  desc: {
    fontSize: fonts.sizes.md,
    lineHeight: 22,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  preferenceSection: {
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    marginBottom: 8,
  },
  preferenceRow: {
    flexDirection: "row",
    gap: 12,
  },
  preferenceCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  preferenceText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    marginBottom: 2,
  },
  preferenceSubText: {
    fontSize: fonts.sizes.xs,
  },
  dotsRow: { flexDirection: "row", alignItems: "center" },
  dot: {
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
  },
  nextBtn: {
    alignItems: "center",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  skipBtn: {
    position: "absolute",
    right: 24,
    top: 56,
  },
  skipText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
  },
});

export default memo(OnboardingScreen);
