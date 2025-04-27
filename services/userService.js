import { db } from "../config/firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Synchronizes a Clerk user with Firebase Firestore
 * @param {Object} clerkUser - The Clerk user object
 * @returns {Promise<Object>} - The Firebase user document
 */
export const syncUserWithFirebase = async (clerkUser) => {
  console.log("syncUserWithFirebase: Starting sync process");
  console.log("Clerk user ID:", clerkUser?.id);
  console.log("Clerk user email:", clerkUser?.emailAddresses[0]?.emailAddress);

  if (!clerkUser) {
    console.error("syncUserWithFirebase: No Clerk user provided");
    return null;
  }

  try {
    const userRef = doc(db, "users", clerkUser.id);
    console.log("syncUserWithFirebase: Checking if user exists in Firestore");
    const userSnap = await getDoc(userRef);
    console.log(
      "syncUserWithFirebase: User exists in Firestore:",
      userSnap.exists()
    );

    // Basic user data from Clerk
    const userData = {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      fullName: `${clerkUser.firstName || ""} ${
        clerkUser.lastName || ""
      }`.trim(),
      profileImageUrl: clerkUser.imageUrl || "",
      lastSyncedAt: serverTimestamp(),
    };

    console.log("syncUserWithFirebase: Prepared user data:", userData);

    // If user doesn't exist in Firestore, create a new document
    if (!userSnap.exists()) {
      console.log("syncUserWithFirebase: Creating new user in Firestore");
      // Add creation timestamp for new users
      userData.createdAt = serverTimestamp();
      await setDoc(userRef, userData);
      console.log(
        "syncUserWithFirebase: User created in Firebase:",
        clerkUser.id
      );
    } else {
      console.log("syncUserWithFirebase: Updating existing user in Firestore");
      // Update existing user
      await updateDoc(userRef, userData);
      console.log(
        "syncUserWithFirebase: User updated in Firebase:",
        clerkUser.id
      );
    }

    return { id: clerkUser.id, ...userData };
  } catch (error) {
    console.error(
      "syncUserWithFirebase: Error syncing user with Firebase:",
      error
    );
    throw error;
  }
};

/**
 * Fetches a user from Firebase by Clerk ID
 * @param {string} clerkId - The Clerk user ID
 * @returns {Promise<Object|null>} - The user document or null if not found
 */
export const getUserByClerkId = async (clerkId) => {
  if (!clerkId) return null;

  try {
    const userRef = doc(db, "users", clerkId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }

    return null;
  } catch (error) {
    console.error("Error fetching user from Firebase:", error);
    return null;
  }
};

/**
 * Updates user metadata in Firebase
 * @param {string} clerkId - The Clerk user ID
 * @param {Object} metadata - The metadata to update
 * @returns {Promise<void>}
 */
export const updateUserMetadata = async (clerkId, metadata) => {
  if (!clerkId) return;

  try {
    const userRef = doc(db, "users", clerkId);
    await updateDoc(userRef, {
      ...metadata,
      updatedAt: serverTimestamp(),
    });
    console.log("User metadata updated in Firebase:", clerkId);
  } catch (error) {
    console.error("Error updating user metadata in Firebase:", error);
    throw error;
  }
};
