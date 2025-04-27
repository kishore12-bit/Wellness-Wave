# Clerk and Firebase Integration Guide

This guide explains how the Clerk authentication service is integrated with Firebase in this React Native Expo application.

## Overview

The integration allows you to:

1. Authenticate users with Clerk
2. Automatically sync user data to Firebase Firestore
3. Use Firebase for storing and retrieving user-related data

## How It Works

### Architecture

The integration follows this flow:

1. User signs up or signs in using Clerk
2. After successful authentication, the user data is synced to Firebase
3. The app uses the Firebase user data for application features

### Key Components

- **Firebase Configuration** (`config/firebase.js`): Initializes Firebase and exports the necessary services
- **User Service** (`services/userService.js`): Handles synchronization between Clerk and Firebase
- **Firebase User Hook** (`hooks/useFirebaseUser.js`): Custom hook to access Firebase user data
- **Firebase User Context** (`contexts/FirebaseUserContext.js`): Context provider for Firebase user data
- **ClerkFirebaseSync Component** (`components/ClerkFirebaseSync.js`): Component to handle user synchronization during authentication events

## Usage

### Accessing Firebase User Data

You can access the Firebase user data in your components using the `useFirebaseUserContext` hook:

```jsx
import { useFirebaseUserContext } from "@/contexts/FirebaseUserContext";

function MyComponent() {
  const { firebaseUser, isLoading, error, refreshUser, updateMetadata } =
    useFirebaseUserContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <View>
      <Text>Welcome, {firebaseUser?.fullName}</Text>
      {/* Your component content */}
    </View>
  );
}
```

### Updating User Metadata

You can update user metadata in Firebase using the `updateMetadata` function:

```jsx
const { updateMetadata } = useFirebaseUserContext();

// Update user metadata
const handleUpdatePreferences = async () => {
  try {
    await updateMetadata({
      preferences: {
        theme: "dark",
        notifications: true,
      },
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
  }
};
```

### Manual Synchronization

If you need to manually sync the user data with Firebase, you can use the `refreshUser` function:

```jsx
const { refreshUser } = useFirebaseUserContext();

// Force a sync with Firebase
const handleRefresh = async () => {
  try {
    await refreshUser();
  } catch (error) {
    console.error("Error refreshing user data:", error);
  }
};
```

## Firebase Database Structure

The integration creates the following structure in Firestore:

```
/users/{clerkUserId}/
  - clerkId: string
  - email: string
  - firstName: string
  - lastName: string
  - fullName: string
  - profileImageUrl: string
  - createdAt: timestamp
  - lastSyncedAt: timestamp
  - [additional metadata fields]
```

## Extending the Integration

### Adding Custom User Fields

To add custom fields to the user document, you can modify the `syncUserWithFirebase` function in `services/userService.js`:

```javascript
export const syncUserWithFirebase = async (clerkUser) => {
  // ... existing code ...

  const userData = {
    // ... existing fields ...

    // Add your custom fields here
    customField1: clerkUser.publicMetadata.customField1 || "",
    customField2: clerkUser.privateMetadata.customField2 || "",
  };

  // ... rest of the function ...
};
```

### Adding Related Collections

You can create related collections for user data, such as user preferences, settings, etc.:

```javascript
import { collection, addDoc } from "firebase/firestore";

// Add a document to a subcollection
export const addUserPreference = async (userId, preference) => {
  try {
    const preferencesRef = collection(db, "users", userId, "preferences");
    await addDoc(preferencesRef, {
      ...preference,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding user preference:", error);
    throw error;
  }
};
```

## Troubleshooting

### User Data Not Syncing

If user data is not syncing properly:

1. Check that the `ClerkFirebaseSync` component is being used in your sign-in and sign-up flows
2. Verify that Firebase is properly initialized
3. Check for errors in the console

### Firebase Permissions

If you encounter permission errors:

1. Check your Firebase security rules
2. Ensure that the user has the necessary permissions to read/write data

## Security Considerations

- The integration uses the user's Clerk ID as the document ID in Firestore
- Make sure to set up proper security rules in Firebase to protect user data
- Consider what data should be stored in Clerk vs. Firebase based on sensitivity and access patterns
