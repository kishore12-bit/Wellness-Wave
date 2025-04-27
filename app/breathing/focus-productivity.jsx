import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Groq from "groq-sdk";
import * as Speech from "expo-speech";
import { useUser } from "@clerk/clerk-expo";

import Header from "../../components/breathing/Header";
import BreathingCircle from "../../components/breathing/BreathingCircle";
import Instructions from "../../components/breathing/Instructions";
import Script from "../../components/breathing/Script";
import StartStopButton from "../../components/breathing/StartStopButton";
import { logBreathingSession } from "../../config/firebase";

const { width } = Dimensions.get("window");

const groq = new Groq({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
});

export default function FocusProductivityScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [isBreathing, setIsBreathing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("Get Ready");
  const [countdown, setCountdown] = useState(3);
  const [calmingScript, setCalmingScript] = useState("");
  const [isLoadingScript, setIsLoadingScript] = useState(true);
  const [showBreathing, setShowBreathing] = useState(false);
  const breathAnimation = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const countdownIntervalRef = useRef(null);
  const animationRef = useRef(null);
  const phaseTimeoutRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const wordTimerRef = useRef(null);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [utteranceId, setUtteranceId] = useState(null);

  const breathingPattern = {
    inhale: 4,
    hold: 4,
    exhale: 4,
  };

  // Smooth cleanup function with fade out animation
  const cleanup = (immediate = false) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }

    if (animationRef.current) {
      animationRef.current.stop();
    }

    if (!immediate && animationStarted) {
      Animated.parallel([
        Animated.timing(breathAnimation, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentPhase("Get Ready");
        setCountdown(3);
        console.log(
          `Breathing animation ended at ${new Date().toLocaleString()}`
        );
        setAnimationStarted(false);
        // Fade text back in
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      setAnimationStarted(false);
      setCurrentPhase("Get Ready");
      setCountdown(3);
    }
  };

  useEffect(() => {
    if (isBreathing) {
      startBreathingCycle();
    } else {
      cleanup();
    }
    // Only use immediate cleanup on unmount
    return () => cleanup(true);
  }, [isBreathing]);

  const startBreathingCycle = () => {
    const animatePhase = (phase, duration, nextPhase, scale) => {
      // Fade out current phase text
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPhase(phase);
        // Fade in new phase text
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });

      // Animate breathing circle
      const animation = Animated.timing(breathAnimation, {
        toValue: scale,
        duration: duration * 1000,
        useNativeDriver: true,
      });

      animationRef.current = animation;
      animation.start();

      // Schedule next phase
      phaseTimeoutRef.current = setTimeout(() => {
        if (isBreathing && nextPhase) {
          nextPhase();
        }
      }, duration * 1000);
    };

    const breatheIn = () => {
      animatePhase("Inhale", breathingPattern.inhale, holdBreath, 1);
    };

    const holdBreath = () => {
      animatePhase("Hold", breathingPattern.hold, breatheOut, 1);
    };

    const breatheOut = () => {
      animatePhase("Exhale", breathingPattern.exhale, breatheIn, 0.3);
    };

    breatheIn();
  };

  const handleStart = () => {
    if (!showBreathing) {
      setShowBreathing(true);
      return;
    }

    if (!isBreathing) {
      console.log(
        `Breathing animation started at ${new Date().toLocaleString()}`
      );
      setAnimationStarted(true);
      setSessionStartTime(new Date());
      // Reset states
      setCountdown(3);
      setCurrentPhase("Get Ready");

      // Start countdown with fade animations
      const startCountdown = () => {
        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;

              // Fade out countdown before starting
              Animated.timing(textOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start(() => {
                setIsBreathing(true);
                // Fade in first phase
                Animated.timing(textOpacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
              });

              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      };

      // Initial fade in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(startCountdown);
    } else {
      setIsBreathing(false);
      logBreathingSession(
        user?.id,
        sessionStartTime,
        new Date(),
        "Focus & Productivity"
      );
    }
  };

  useEffect(() => {
    generateCalmingScript();
  }, []);

  const generateCalmingScript = async () => {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a calming meditation guide focused on focus and productivity. Keep responses concise, warm, and encouraging.",
          },
          {
            role: "user",
            content:
              "Create a short calming script (1 paragraph) that helps improve focus and productivity, and ends by encouraging the user to try the box breathing technique (4-4-4). Make it personal and compassionate.",
          },
        ],
        model: "mixtral-8x7b-32768",
        temperature: 1,
        max_tokens: 500,
      });

      const script = completion.choices[0]?.message?.content || "";
      setCalmingScript(script);
      setWords(script.split(/\s+/));
      setIsLoadingScript(false);
    } catch (error) {
      console.error("Error generating script:", error);
      const fallbackScript =
        "Take a moment to center yourself. Let's enhance your focus and productivity with mindful breathing.";
      setCalmingScript(fallbackScript);
      setWords(fallbackScript.split(/\s+/));
      setIsLoadingScript(false);
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
      setUtteranceId(null);
    } else {
      setIsSpeaking(true);
      setCurrentWordIndex(0);

      try {
        // Generate a unique ID for this utterance
        const id = Math.random().toString(36).substring(7);
        setUtteranceId(id);

        await Speech.speak(calmingScript, {
          rate: 1.0,
          pitch: 1.0,
          onBoundary: (event) => {
            // Only process events for current utterance
            if (event.utterance === id) {
              // Update word index based on the word boundary event
              const wordPosition = event.wordPosition;
              setCurrentWordIndex(wordPosition);
            }
          },
          onDone: () => {
            setIsSpeaking(false);
            setCurrentWordIndex(-1);
            setUtteranceId(null);
          },
          onError: () => {
            setIsSpeaking(false);
            setCurrentWordIndex(-1);
            setUtteranceId(null);
          },
          identifier: id, // Set the utterance identifier
        });
      } catch (error) {
        console.error("Speech error:", error);
        setIsSpeaking(false);
        setCurrentWordIndex(-1);
        setUtteranceId(null);
      }
    }
  };

  useEffect(() => {
    return () => {
      Speech.stop();
      setUtteranceId(null);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Focus & Productivity" />

      {!showBreathing ? (
        <ScrollView
          style={styles.scriptContainer}
          contentContainerStyle={styles.scriptContent}
        >
          <Script
            isLoadingScript={isLoadingScript}
            calmingScript={calmingScript}
            words={words}
            currentWordIndex={currentWordIndex}
            isSpeaking={isSpeaking}
            handleSpeak={handleSpeak}
            isBreathing={isBreathing}
            handleStart={handleStart}
            startStopButton={
              <StartStopButton
                isBreathing={isBreathing}
                handleStart={handleStart}
              />
            }
          />
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <BreathingCircle
            breathAnimation={breathAnimation}
            textOpacity={textOpacity}
            currentPhase={currentPhase}
            countdown={countdown}
            isBreathing={isBreathing}
          />

          <Instructions
            title="Box Breathing Technique"
            instructions={
              "• Inhale deeply through your nose for 4 seconds\n• Hold your breath for 4 seconds\n• Exhale completely through your mouth for 4 seconds"
            }
          />

          <StartStopButton
            isBreathing={isBreathing}
            handleStart={handleStart}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D1B69",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingTop: 60,
  },
  scriptContainer: {
    flex: 1,
  },
  scriptContent: {
    padding: 20,
  },
});
