import { Stack } from "expo-router";

export default function BreathingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="stress-relief" />
      <Stack.Screen name="focus-productivity" />
      <Stack.Screen name="sleep-relaxation" />
      <Stack.Screen name="general" />
    </Stack>
  );
}
