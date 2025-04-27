# Home Module Documentation

## Overview

The `(home)` directory contains the landing page and initial user experience of the Wellness Wave meditation app. This module serves as the entry point for users, providing authentication options and a welcoming interface that introduces users to the app's purpose and functionality.

## File Structure

```
app/(home)/
├── _layout.tsx        # Layout configuration for home routes
└── index.tsx         # Main landing page component
```

## Components

### \_layout.tsx

A simple layout wrapper that configures the navigation stack for the home module.

**Key Features:**

- Configures a headerless navigation stack
- Provides consistent navigation behavior

```typescript
// Usage example
<Stack screenOptions={{ headerShown: false }} />
```

### index.tsx (Landing Page)

The main landing page component that serves as the initial entry point for users.

**Key Features:**

- Welcoming animation using Lottie
- App branding and introduction
- Authentication options (Sign In/Sign Up)
- Automatic redirection for authenticated users

**Flow:**

1. Displays welcoming animation and branding
2. Presents authentication options
3. Redirects authenticated users to the main app tabs

## Component Structure

### Landing Page Layout

```jsx
<SafeAreaView>
  <SignedOut>
    <View>
      <LottieView /> {/* Animation */}
      <Text>Welcome Message</Text>
      <Text>Subtitle</Text>
      <View>
        <Link>Sign In Button</Link>
        <Link>Sign Up Button</Link>
      </View>
    </View>
  </SignedOut>
</SafeAreaView>
```

## Authentication Integration

### Clerk Authentication

The module integrates with Clerk for authentication management:

- `useUser()` - For checking authentication status
- `SignedOut` - Component to control content visibility based on auth state

### Navigation

Navigation is handled using Expo Router:

- `useRouter()` - For programmatic navigation
- `Link` - For declarative navigation to auth screens
- Automatic redirection to tabs for authenticated users

## Styling

The landing page follows the app's design language:

### Colors

- Background: Deep Purple (`#2D1B69`)
- Accent: Yellow (`#FFD93D`)
- Text: White (`#FFFFFF`)

### Typography

- Title: 32px, bold
- Subtitle: 18px, semi-transparent
- Button Text: 18px, bold with letter spacing

### Components

- Buttons: Rounded corners (30px radius)
- Animation: 300x300 dimensions
- Consistent padding and spacing
- Elevation and shadow effects for depth

## Usage Example

```typescript
// Programmatic navigation to auth screens
router.push("/(auth)/sign-in");
router.push("/(auth)/sign-up");

// Checking authentication status
const { user } = useUser();
if (user) {
  router.replace("/(tabs)");
}
```

## Animation

The module uses Lottie for engaging animations:

- Located in: `assets/animation/homepage_animation.json`
- Auto-playing and looping
- Dimensions: 300x300 pixels
- Enhances the welcoming experience

## Security Considerations

- Uses `SignedOut` component to ensure content is only visible to unauthenticated users
- Implements automatic redirection for authenticated users
- Integrates with Clerk's secure authentication flow

## Best Practices

1. **Performance**

   - Optimized animation loading
   - Efficient navigation handling
   - Minimal re-renders

2. **User Experience**

   - Clear call-to-action buttons
   - Engaging animation
   - Intuitive navigation flow

3. **Maintenance**
   - Modular component structure
   - Consistent styling patterns
   - Clear separation of concerns

## Related Modules

- Links to `(auth)` module for authentication
- Redirects to `(tabs)` for main app functionality
- Integrates with Clerk for user management

## Error Handling

The module includes basic error handling:

- Graceful handling of authentication state changes
- Safe navigation patterns
- Component error boundaries (recommended to add)
