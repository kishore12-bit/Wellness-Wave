export const config = {
  apiKey: "AIzaSyCJ2Ch-qIorRa5yexsWbyUHEwp8oFZQL5s",
  authDomain: "wellnesswave-355ee.firebaseapp.com",
  projectId: "wellnesswave-355ee",
  storageBucket: "wellnesswave-355ee.firebasestorage.app",
  messagingSenderId: "1076362782875",
  appId: "1:1076362782875:web:9d1cb082ff0c2ce94e3e3e",
  measurementId: "G-8RPXEBLG7Q",
};

// Import Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { collection, addDoc, doc, setDoc, getDocs } from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

// Add auth state change listener for debugging
auth.onAuthStateChanged((user) => {
  console.log(
    "Auth state changed:",
    user ? "User is signed in" : "No user signed in"
  );
  if (user) {
    console.log("User details:", {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
    });
  }
});

// Add error listener for auth
auth.onIdTokenChanged((user) => {
  if (user) {
    user
      .getIdToken()
      .then((token) => {
        console.log("Current auth token:", token ? "Token exists" : "No token");
      })
      .catch((error) => {
        console.error("Error getting auth token:", error);
      });
  }
});

/**
 * Log a breathing session to Firestore
 * @param {string} userId - The user's ID (if available)
 * @param {Date} sessionStart - The session start time
 * @param {Date} sessionEnd - The session end time
 * @param {string} breathingType - The type of breathing exercise
 * @returns {Promise} - Promise that resolves when the session is logged
 */
export const logBreathingSession = async (
  userId,
  sessionStart,
  sessionEnd,
  breathingType
) => {
  try {
    console.log(`User ID passed to logBreathingSession: ${userId}`);

    // Try to get the current user ID if not provided using auth directly
    const currentUser = auth.currentUser;
    console.log(
      `Current user from Firebase Auth: ${
        currentUser ? currentUser.uid : "No user logged in"
      }`
    );

    const actualUserId = userId || (currentUser ? currentUser.uid : null);
    console.log(`Actual user ID being used: ${actualUserId || "null"}`);

    // Create a timestamp and session data
    const now = new Date();
    const timestamp = now.getTime();

    // Create the session data object
    const sessionData = {
      userId: actualUserId,
      sessionStart: sessionStart.toISOString(),
      sessionEnd: sessionEnd.toISOString(),
      breathingType: breathingType,
      duration: (sessionEnd - sessionStart) / 1000, // Duration in seconds
      date: sessionEnd.toLocaleDateString(),
      time: sessionEnd.toLocaleTimeString(),
      timestamp: sessionEnd.toISOString(),
      createdAt: timestamp,
    };

    console.log(`Session data being saved:`, sessionData);

    // Reference to the breathing_session_data collection
    const breathingCollection = collection(db, "breathing_session_data");

    let result;

    if (actualUserId) {
      // Create a document with the user's ID
      const userBreathingDoc = doc(breathingCollection, actualUserId);

      // Create a subcollection for the user's breathing sessions
      const userSessionsCollection = collection(userBreathingDoc, "sessions");

      // Add the session to the subcollection
      result = await addDoc(userSessionsCollection, sessionData);

      console.log(
        `Breathing session logged for user: ${actualUserId}, session ID: ${result.id}`
      );
    } else {
      // If no userId, create an anonymous document
      const anonymousDoc = doc(breathingCollection, "anonymous");

      // Create a subcollection for anonymous breathing sessions
      const anonymousSessionsCollection = collection(anonymousDoc, "sessions");

      // Add the session to the subcollection
      result = await addDoc(anonymousSessionsCollection, sessionData);

      console.log(`Anonymous breathing session logged with ID: ${result.id}`);
    }

    return { success: true, data: sessionData };
  } catch (error) {
    console.error("Error logging breathing session:", error);
    return { success: false, error };
  }
};

/**
 * Fetch a user's breathing sessions and calculate the total duration in minutes
 * @param {string} userId - The user's ID
 * @returns {Promise} - Promise that resolves with the total duration in minutes
 */
export const getUserBreathingMinutes = async (userId) => {
  try {
    if (!userId) {
      console.error("No user ID provided to getUserBreathingMinutes");
      return 0;
    }

    // Reference to the user's document in the breathing_session_data collection
    const userBreathingDoc = doc(db, "breathing_session_data", userId);

    // Reference to the user's sessions subcollection
    const userSessionsCollection = collection(userBreathingDoc, "sessions");

    // Fetch all the user's breathing sessions
    const snapshot = await getDocs(userSessionsCollection);

    // Calculate the total duration in minutes
    let totalMinutes = 0;
    snapshot.forEach((doc) => {
      const sessionData = doc.data();
      totalMinutes += sessionData.duration / 60; // Convert seconds to minutes
    });

    return Math.round(totalMinutes);
  } catch (error) {
    console.error("Error fetching user's breathing minutes:", error);
    return 0;
  }
};

export { app, db, auth };
