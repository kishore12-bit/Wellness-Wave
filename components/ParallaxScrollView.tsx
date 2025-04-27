import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "./ThemedView";

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage?: ReactElement;
  headerBackgroundColor?: { dark: string; light: string };
  parallaxHeaderHeight?: number;
  renderBackground?: () => ReactNode;
  renderForeground?: () => ReactNode;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  parallaxHeaderHeight = HEADER_HEIGHT,
  renderBackground,
  renderForeground,
}: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-parallaxHeaderHeight, 0, parallaxHeaderHeight],
            [-parallaxHeaderHeight / 2, 0, parallaxHeaderHeight * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-parallaxHeaderHeight, 0, parallaxHeaderHeight],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: "#1A1040" }]}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 20 }}
        style={{ backgroundColor: "#1A1040" }}
      >
        <Animated.View
          style={[
            styles.header,
            { height: parallaxHeaderHeight },
            headerAnimatedStyle,
          ]}
        >
          {renderBackground && renderBackground()}
          {headerImage}
          {renderForeground && renderForeground()}
        </Animated.View>
        <ThemedView style={[styles.content, { backgroundColor: "#1A1040" }]}>
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
    overflow: "hidden",
  },
});
