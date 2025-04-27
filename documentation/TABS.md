# Tabs Module Documentation

## Overview

The `(tabs)` directory contains the main navigation and functionality of the Wellness Wave app after user authentication. This module implements a tab-based navigation system that provides access to key features including meditation, mood tracking, journaling, and support.

## File Structure

```
app/(tabs)/
├── _layout.jsx         # Tab navigation configuration
├── index.jsx          # Home/Dashboard screen
├── meditation.jsx     # Meditation sessions screen
├── mood.jsx          # Mood tracking screen
├── journal.jsx       # Journaling screen
└── support.jsx       # Support and help screen
```

## Components

### \_layout.jsx

Configures the tab-based navigation system and defines the tab bar appearance.

**Key Features:**

- Custom tab bar styling
- Tab icons and labels
- Navigation state management
- Authentication protection

### index.jsx (Dashboard)

The main dashboard screen that users see after logging in.

**Key Features:**

- User greeting and profile information
- Weekly mood statistics visualization
- Mini calendar for date selection
- Inspirational quotes
- Quick access to key features

### meditation.jsx

Provides access to meditation sessions and exercises.

**Key Features:**

- Meditation session categories
- Session duration options
- Progress tracking
- Audio playback controls

### mood.jsx

Enables users to track and visualize their emotional state.

**Key Features:**

- Mood selection interface
- Emotion tracking
- Historical mood data visualization
- Weekly and monthly trends

### journal.jsx

Facilitates personal reflection through journaling.

**Key Features:**

- Journal entry creation
- AI-assisted prompts
- Entry history viewing
- Mood correlation

### support.jsx

Provides help and support resources.

**Key Features:**

- FAQ section
- Contact options
- Help documentation
- Resource links

## Navigation Structure

```javascript
<Tabs
  screenOptions={{
    tabBarStyle: {
      backgroundColor: "#2D1B69",
      borderTopWidth: 0,
    },
    tabBarActiveTintColor: "#FFD93D",
  }}
>
  <Tabs.Screen name="index" options={{ title: "Home" }} />
  <Tabs.Screen name="meditation" options={{ title: "Meditate" }} />
  <Tabs.Screen name="mood" options={{ title: "Mood" }} />
  <Tabs.Screen name="journal" options={{ title: "Journal" }} />
  <Tabs.Screen name="support" options={{ title: "Support" }} />
</Tabs>
```

## Integration Points

### Firebase Integration

- Mood data storage and retrieval
- Journal entries management
- User preferences synchronization

### Clerk Authentication

- User session management
- Profile information access
- Authentication state handling

### External Services

- Groq API for AI-generated content
- Audio streaming for meditation sessions
- Analytics and tracking

## State Management

Each tab manages its own state for:

- User interactions
- Data fetching
- UI components
- Loading states
- Error handling

## Styling

The module maintains consistent styling across all tabs:

### Colors

- Primary Background: Deep Purple (`#2D1B69`)
- Tab Bar: Custom styled with transparency
- Active Tab: Yellow (`#FFD93D`)
- Text: White (`#FFFFFF`)

### Components

- Cards with rounded corners
- Consistent padding and spacing
- Custom tab bar icons
- Animated transitions

## Usage Examples

```typescript
// Tab Navigation
router.push("/(tabs)/meditation");
router.push("/(tabs)/mood");

// Accessing User Data
const { user } = useUser();
const userName = user?.firstName;

// Firebase Operations
const moodData = await getWeeklyMoodHistory(userId);
const journalEntries = await getJournalEntries(userId);
```

## Security Considerations

1. **Authentication**

   - Protected routes
   - Session validation
   - Secure data access

2. **Data Privacy**
   - User data encryption
   - Secure storage
   - Privacy controls

## Error Handling

Each tab implements comprehensive error handling:

- Network error recovery
- Data loading fallbacks
- User feedback
- Graceful degradation

## Performance Optimization

1. **Loading States**

   - Skeleton screens
   - Progressive loading
   - Data caching

2. **Resource Management**
   - Lazy loading
   - Memory optimization
   - Background task handling

## Best Practices

1. **Code Organization**

   - Modular components
   - Consistent naming
   - Clear file structure

2. **User Experience**

   - Smooth transitions
   - Intuitive navigation
   - Responsive feedback

3. **Maintenance**
   - Documentation
   - Code comments
   - Version control

## Testing Considerations

1. **Unit Tests**

   - Component rendering
   - State management
   - User interactions

2. **Integration Tests**
   - Navigation flows
   - Data persistence
   - Authentication

## Related Documentation

- [Authentication Module](./AUTHENTICATION.md)
- [Home Module](./HOME.md)
- [Clerk Firebase Integration](./CLERK_FIREBASE_INTEGRATION.md)

## Troubleshooting

Common issues and solutions:

- Navigation state issues
- Data synchronization
- Authentication flows
- Performance bottlenecks
