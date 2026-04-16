import { memo, useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

function SkeletonBox({ width = "100%", height = 16, borderRadius = 8, style }) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductSkeleton() {
  return (
    <View style={skStyles.card}>
      <SkeletonBox height={140} borderRadius={12} />
      <SkeletonBox width="70%" height={14} style={{ marginTop: 10 }} />
      <SkeletonBox width="40%" height={12} style={{ marginTop: 6 }} />
    </View>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <View style={skStyles.listWrap}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={skStyles.row}>
          <SkeletonBox width={56} height={56} borderRadius={12} />
          <View style={skStyles.rowText}>
            <SkeletonBox width="60%" height={14} />
            <SkeletonBox width="40%" height={11} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const skStyles = StyleSheet.create({
  card: { padding: 12, marginBottom: 16 },
  listWrap: { paddingVertical: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  rowText: { flex: 1, marginLeft: 12 },
});

export default memo(SkeletonBox);
