import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { config } from "../../config/firebase";

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(config);
} else {
  app = getApp();
}

const db = getFirestore(app);

/**
 * Log a user's mood to Firestore
 * @param {string} userId - The user's ID
 * @param {number} moodId - The selected mood ID (1-5)
 * @param {string} moodLabel - The mood label (Unhappy, Sad, etc.)
 * @returns {Promise} - Promise that resolves when the mood is logged
 */
export const logMood = async (userId, moodId, moodLabel) => {
  try {
    // Create a timestamp
    const now = new Date();

    // Create the mood data object
    const moodData = {
      userId: userId,
      selectedMood: moodId,
      moodLabel: moodLabel,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      timestamp: now.toISOString(),
      unixTimestamp: Math.floor(now.getTime() / 1000),
      createdAt: Timestamp.fromDate(now),
    };

    // Reference to the user_mood collection
    const moodCollection = collection(db, "user_mood");

    // Create a document with the user's ID
    const userMoodDoc = doc(moodCollection, userId);

    // Create a subcollection for the user's moods
    const userMoodsCollection = collection(userMoodDoc, "moods");

    // Add the mood to the subcollection
    await addDoc(userMoodsCollection, moodData);

    console.log("Mood logged successfully");
    return { success: true, data: moodData };
  } catch (error) {
    console.error("Error logging mood:", error);
    return { success: false, error };
  }
};

/**
 * Get a user's mood history
 * @param {string} userId - The user's ID
 * @param {number} limit - The number of moods to retrieve (default: 7)
 * @returns {Promise} - Promise that resolves with the mood history
 */
export const getMoodHistory = async (userId, limitCount = 7) => {
  try {
    // Reference to the user's moods subcollection
    const userMoodDoc = doc(collection(db, "user_mood"), userId);
    const userMoodsCollection = collection(userMoodDoc, "moods");

    // Create a query to get the most recent moods
    const q = query(
      userMoodsCollection,
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    // Get the moods
    const querySnapshot = await getDocs(q);

    // Map the moods to an array
    const moods = [];
    querySnapshot.forEach((doc) => {
      moods.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: moods };
  } catch (error) {
    console.error("Error getting mood history:", error);
    return { success: false, error };
  }
};

/**
 * Get today's mood for a user
 * @param {string} userId - The user's ID
 * @returns {Promise} - Promise that resolves with today's mood or null if not found
 */
export const getTodaysMood = async (userId) => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Format today's date as a string in the same format as stored in Firestore
    const todayString = today.toLocaleDateString();

    // Reference to the user's moods subcollection
    const userMoodDoc = doc(collection(db, "user_mood"), userId);
    const userMoodsCollection = collection(userMoodDoc, "moods");

    // First, get all moods from today without ordering
    const q = query(userMoodsCollection, where("date", "==", todayString));

    // Get the moods
    const querySnapshot = await getDocs(q);

    // Check if we have a mood for today
    if (querySnapshot.empty) {
      return { success: true, data: null };
    }

    // Convert to array and sort manually
    const todaysMoods = [];
    querySnapshot.forEach((doc) => {
      todaysMoods.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort by createdAt timestamp (most recent first)
    todaysMoods.sort((a, b) => {
      // Handle Firestore timestamps
      const timeA = a.createdAt?.toDate?.() || new Date(a.timestamp);
      const timeB = b.createdAt?.toDate?.() || new Date(b.timestamp);
      return timeB - timeA;
    });

    // Return the most recent mood for today
    const todaysMood = todaysMoods[0];

    console.log("Retrieved today's mood:", todaysMood);
    return { success: true, data: todaysMood };
  } catch (error) {
    console.error("Error getting today's mood:", error);
    return { success: false, error };
  }
};

/**
 * Get the weekly mood history for a user
 * @param {string} userId - The user's ID
 * @param {Array} dates - Array of dates to get moods for (should be ordered from oldest to newest)
 * @param {number} weekOffset - Offset in weeks (0 = current week, -1 = previous week, etc.)
 * @returns {Promise} - Promise that resolves with the weekly mood history
 */
export const getWeeklyMoodHistory = async (userId, dates, weekOffset = 0) => {
  try {
    if (!userId) {
      return { success: false, error: "No user ID provided" };
    }

    // Apply week offset to dates if provided
    let adjustedDates = dates;
    if (weekOffset !== 0) {
      adjustedDates = dates.map((date) => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + weekOffset * 7);
        return newDate;
      });
    }

    // Ensure dates are ordered from oldest to newest
    const orderedDates = [...adjustedDates].sort(
      (a, b) => a.getTime() - b.getTime()
    );

    // Get the start and end dates for the query
    const startDate = orderedDates[0];
    const endDate = orderedDates[orderedDates.length - 1];

    // Format dates for logging
    const startDateStr = startDate.toLocaleDateString("en-US");
    const endDateStr = endDate.toLocaleDateString("en-US");
    console.log(
      `Fetching moods from ${startDateStr} to ${endDateStr} (week offset: ${weekOffset})`
    );

    // Reference to the user's moods subcollection
    const userMoodDoc = doc(collection(db, "user_mood"), userId);
    const userMoodsCollection = collection(userMoodDoc, "moods");

    // Get all moods for the user
    const querySnapshot = await getDocs(userMoodsCollection);

    // Log raw query results
    console.log("Raw query results:");
    querySnapshot.forEach((doc) => {
      console.log("Document ID:", doc.id);
      console.log("Document data:", doc.data());
    });

    if (querySnapshot.empty) {
      console.log("No moods found for user:", userId);
      return {
        success: true,
        data: orderedDates.map((date) => ({
          date,
          mood: null,
          value: null,
        })),
      };
    }

    // Convert to array
    const allMoods = [];
    querySnapshot.forEach((doc) => {
      allMoods.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("All moods array:", JSON.stringify(allMoods, null, 2));
    console.log(`Found ${allMoods.length} total moods for user`);

    // Map the moods to the dates
    const weeklyMoods = orderedDates.map((date) => {
      // Format date string consistently with 'en-US' locale
      const dateString = date.toLocaleDateString("en-US");
      console.log(`Looking for mood on date: ${dateString}`);

      // Find all moods for this date
      const moodsForDate = allMoods.filter((mood) => {
        // Parse the stored date and format it consistently
        const moodDate = new Date(mood.timestamp).toLocaleDateString("en-US");
        return moodDate === dateString;
      });

      if (moodsForDate.length > 0) {
        console.log(`Found ${moodsForDate.length} moods for ${dateString}`);

        // Sort moods by createdAt timestamp (most recent first)
        const sortedMoods = moodsForDate.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(a.timestamp);
          const timeB = b.createdAt?.toDate?.() || new Date(b.timestamp);
          return timeB - timeA;
        });

        // Take the latest mood
        const latestMood = sortedMoods[0];

        console.log(`Latest mood for ${dateString}:`, latestMood);

        return {
          date,
          mood: latestMood.moodLabel.toLowerCase(),
          value: parseInt(latestMood.selectedMood),
          time: latestMood.time,
          id: latestMood.id,
        };
      }

      console.log(`No mood found for ${dateString}`);
      return {
        date,
        mood: null,
        value: null,
      };
    });

    const moodsFound = weeklyMoods.filter((m) => m.mood).length;
    console.log("Final weekly moods:", JSON.stringify(weeklyMoods, null, 2));
    console.log(`Found ${moodsFound} moods in the requested date range`);

    return { success: true, data: weeklyMoods };
  } catch (error) {
    console.error("Error getting weekly mood history:", error);
    return { success: false, error };
  }
};
