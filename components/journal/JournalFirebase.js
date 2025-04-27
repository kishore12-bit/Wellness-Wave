import {
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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";

/**
 * Save a journal entry to Firestore
 * @param {string} userId - The user's ID
 * @param {Array} selectedEmotions - Array of selected emotions
 * @param {string} prompt - The AI-generated prompt
 * @param {string} journalEntry - The journal entry text
 * @returns {Promise} - Promise that resolves when the journal entry is saved
 */
export const saveJournalEntry = async (
  userId,
  selectedEmotions,
  prompt,
  journalEntry
) => {
  try {
    if (!userId) {
      console.error("No user ID provided");
      return { success: false, error: "No user ID provided" };
    }

    // Get current date and time
    const now = new Date();

    // Create the journal entry data object
    const journalData = {
      userId,
      selectedEmotions,
      prompt,
      journalEntry,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      timestamp: now.toISOString(),
      createdAt: serverTimestamp(),
    };

    // Reference to the user_journals collection
    const journalsCollection = collection(db, "user_journals");

    // Create a document with the user's ID
    const userJournalDoc = doc(journalsCollection, userId);

    // Create a subcollection for the user's journal entries
    const userEntriesCollection = collection(userJournalDoc, "entries");

    // Add the journal entry to the subcollection
    const docRef = await addDoc(userEntriesCollection, journalData);

    console.log("Journal entry saved successfully with ID:", docRef.id);
    return { success: true, data: { id: docRef.id, ...journalData } };
  } catch (error) {
    console.error("Error saving journal entry:", error);
    return { success: false, error };
  }
};

/**
 * Get a user's journal entries
 * @param {string} userId - The user's ID
 * @param {number} limitCount - The number of entries to retrieve (default: 10)
 * @returns {Promise} - Promise that resolves with the journal entries
 */
export const getJournalEntries = async (userId, limitCount = 10) => {
  try {
    if (!userId) {
      return { success: false, error: "No user ID provided" };
    }

    // Reference to the user's journal entries subcollection
    const userJournalDoc = doc(collection(db, "user_journals"), userId);
    const userEntriesCollection = collection(userJournalDoc, "entries");

    // Create a query to get the most recent entries
    const q = query(
      userEntriesCollection,
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    // Get the entries
    const querySnapshot = await getDocs(q);

    // Check if we have any entries
    if (querySnapshot.empty) {
      return { success: true, data: [] };
    }

    // Map the entries to an array
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: entries };
  } catch (error) {
    console.error("Error getting journal entries:", error);
    return { success: false, error };
  }
};

/**
 * Get a user's journal entries for the last 2 days
 * @param {string} userId - The user's ID
 * @returns {Promise} - Promise that resolves with the journal entries
 */
export const getRecentJournalEntries = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: "No user ID provided" };
    }

    // Get the current date and the date 2 days ago
    const currentDate = new Date();
    const twoDaysAgo = new Date(currentDate);
    twoDaysAgo.setDate(currentDate.getDate() - 2);

    // Reference to the user's journal entries subcollection
    const userJournalDoc = doc(collection(db, "user_journals"), userId);
    const userEntriesCollection = collection(userJournalDoc, "entries");

    // Create a query to get entries from the last 2 days
    const q = query(
      userEntriesCollection,
      where("timestamp", ">=", twoDaysAgo.toISOString()),
      orderBy("timestamp", "desc")
    );

    // Get the entries
    const querySnapshot = await getDocs(q);

    // Map the entries to an array
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, data: entries };
  } catch (error) {
    console.error("Error getting recent journal entries:", error);
    return { success: false, error };
  }
};

/**
 * Calculate the user's current journaling streak
 * @param {string} userId - The user's ID
 * @returns {Promise} - Promise that resolves with the streak count
 */
export const getJournalingStreak = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: "No user ID provided" };
    }

    // Get the user's journal entries for the last 2 days
    const { success, data: entries } = await getRecentJournalEntries(userId);

    if (!success) {
      return { success: false, error: "Failed to get recent journal entries" };
    }

    // Check if the user has journaled today
    const today = new Date().toLocaleDateString();
    const journaledToday = entries.some((entry) => entry.date === today);

    if (!journaledToday) {
      // If the user hasn't journaled today, the streak is 0
      return { success: true, data: 0 };
    }

    // If the user has journaled today, calculate the streak
    let streak = 1;
    let lastDate = today;

    for (const entry of entries) {
      if (entry.date === lastDate) {
        continue;
      }

      const entryDate = new Date(entry.date);
      const lastJournalDate = new Date(lastDate);

      // Check if the entry date is the previous day
      if (entryDate.getDate() === lastJournalDate.getDate() - 1) {
        streak++;
        lastDate = entry.date;
      } else {
        break;
      }
    }

    return { success: true, data: streak };
  } catch (error) {
    console.error("Error calculating journaling streak:", error);
    return { success: false, error };
  }
};
