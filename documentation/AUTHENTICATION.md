# Authentication Module Documentation

## Overview

The `(auth)` directory contains all authentication-related screens and functionality for the meditation app. This module handles user sign-up, sign-in, and onboarding processes using Clerk for authentication and Firebase for data storage.

## File Structure

```
app/(auth)/
├── _layout.tsx        # Layout wrapper for auth routes with redirection logic
├── sign-up.tsx        # User registration screen
├── sign-in.tsx        # User login screen
├── onboarding.tsx     # Profile completion screen after registration
```

## Components

### \_layout.tsx

This file serves as the layout wrapper for all authentication routes. It includes redirection logic to prevent authenticated users from accessing auth screens.

**Key Features:**

- Redirects signed-in users to the home page
- Configures the navigation stack with no header

```typescript
// Usage example
<Stack screenOptions={{ headerShown: false }} />
```

### sign-up.tsx

Handles the user registration process with email verification.

**Key Features:**

- Email and password registration
- Email verification with code
- Integration with Firebase via ClerkFirebaseSync
- Navigation to main app after successful registration

**Flow:**

1. User enters email and password
2. Verification code is sent to email
3. User enters verification code
4. Upon successful verification, user is redirected to the main app

### sign-in.tsx

Manages user authentication for existing accounts.

**Key Features:**

- Email and password authentication
- Integration with Firebase via ClerkFirebaseSync
- Navigation to sign-up screen for new users

**Flow:**

1. User enters email and password
2. Upon successful authentication, user is redirected to the main app
3. Firebase sync ensures user data is properly synchronized

### onboarding.tsx

Collects additional user information after registration to complete the profile.

**Key Features:**

- Profile picture upload using expo-image-picker
- Full name collection and parsing into first/last name
- Updates Clerk user profile with provided information

**Flow:**

1. User uploads profile picture (optional)
2. User enters full name
3. Upon completion, user is redirected to the main app

## Authentication Flow

1. **New User Registration:**

   - User navigates to sign-up screen
   - Enters email and password
   - Verifies email with code
   - Completes profile in onboarding
   - Redirected to main app

2. **Existing User Login:**
   - User navigates to sign-in screen
   - Enters email and password
   - Redirected to main app

## Integration Points

### Clerk Authentication

The module uses Clerk for authentication services:

- `useSignUp()` - For registration and email verification
- `useSignIn()` - For authentication
- `useUser()` - For accessing and updating user information
- `setActive()` - For setting the active session

### Firebase Integration

Firebase synchronization is handled through the `ClerkFirebaseSync` component:

- Ensures user data is properly synchronized between Clerk and Firebase
- Provides loading state during synchronization
- Triggers navigation upon completion

### Expo Router

Navigation is managed using Expo Router:

- `useRouter()` - For programmatic navigation
- `Link` - For declarative navigation
- `Redirect` - For conditional redirects

## Styling

The authentication screens follow a consistent design language:

- Purple background (`#2D1B69`)
- Yellow accent color (`#FFD93D`)
- Rounded input fields and buttons
- Consistent typography and spacing

## Usage Example

```typescript
// Redirecting to sign-in
router.push("/sign-in");

// Redirecting to sign-up
router.push("/sign-up");

// Accessing user information
const { user } = useUser();
const userName = user?.firstName;
```

## Error Handling

All authentication operations include error handling:

- Console logging for debugging
- Try-catch blocks for operation safety
- Status checking for multi-step processes

## Security Considerations

- Password fields use `secureTextEntry` for masking
- Email verification is required before account activation
- Authenticated routes are protected from unauthenticated access
- Firebase synchronization ensures data consistency
