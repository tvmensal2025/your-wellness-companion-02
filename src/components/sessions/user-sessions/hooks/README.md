# useSessionData Hook

## Overview

Custom React hook that encapsulates all business logic, state management, and data fetching for the UserSessions component. This hook follows React best practices with proper dependency management and TypeScript typing.

## Purpose

Extracts complex logic from the UserSessions component to:
- Improve code maintainability and testability
- Separate concerns (UI vs business logic)
- Enable reusability across components
- Follow the Single Responsibility Principle

## Usage

```typescript
import { useSessionData } from './hooks/useSessionData';

function UserSessionsComponent({ user }: { user: User | null }) {
  const {
    // State
    userSessions,
    loading,
    stats,
    activeHealthWheelSession,
    reviewMode,
    showToolsModal,
    selectedSessionForTools,
    activeToolSession,
    sendingDrVital,
    drVitalData,
    drVitalCardRef,
    showEarlyRequestModal,
    selectedSessionForRequest,
    requestReason,
    
    // Setters
    setShowEarlyRequestModal,
    setSelectedSessionForRequest,
    setRequestReason,
    setReviewMode,
    setShowToolsModal,
    setActiveToolSession,
    
    // Functions
    loadUserSessions,
    startSession,
    handleHealthWheelComplete,
    updateProgress,
    completeSessionWithFeedback,
    autoSaveProgress,
    requestEarlyRelease,
    openReviewMode,
    saveSessionActivity,
    openToolsModal,
    handleSelectTool,
    handleToolComplete,
    getCompletedTools,
    sendDrVitalAnalysis,
  } = useSessionData(user);

  // Use the state and functions in your component
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <SessionStats stats={stats} />
      <SessionList 
        sessions={userSessions}
        onStartSession={startSession}
        onCompleteSession={completeSessionWithFeedback}
        // ... other props
      />
    </div>
  );
}
```

## Return Values

### State

- **userSessions**: `UserSession[]` - Array of user sessions with full details
- **loading**: `boolean` - Loading state for initial data fetch
- **stats**: `SessionStats` - Statistics about sessions (pending, in progress, completed, locked, total)
- **activeHealthWheelSession**: `UserSession | null` - Currently active health wheel assessment
- **reviewMode**: `UserSession | null` - Session being reviewed (read-only mode)
- **showToolsModal**: `boolean` - Whether tools selection modal is visible
- **selectedSessionForTools**: `UserSession | null` - Session selected for tools
- **activeToolSession**: `{ session: UserSession; tool: SessionTool } | null` - Currently active tool
- **sendingDrVital**: `string | null` - ID of session being sent to Dr. Vital
- **drVitalData**: `DrVitalData | null` - Data for Dr. Vital card rendering
- **drVitalCardRef**: `RefObject<HTMLDivElement>` - Ref for Dr. Vital card capture
- **showEarlyRequestModal**: `boolean` - Whether early release request modal is visible
- **selectedSessionForRequest**: `UserSession | null` - Session selected for early release
- **requestReason**: `string` - Reason for early release request

### Setters

Simple state setters for modal and UI control:
- `setShowEarlyRequestModal`
- `setSelectedSessionForRequest`
- `setRequestReason`
- `setReviewMode`
- `setShowToolsModal`
- `setActiveToolSession`

### Functions

#### Data Management

- **loadUserSessions()**: `Promise<void>`
  - Fetches all user sessions from database
  - Updates stats automatically
  - Shows toast notifications

- **saveSessionActivity(sessionId, activity)**: `Promise<void>`
  - Saves session activity to daily_responses table
  - Used for tracking user progress

#### Session Actions

- **startSession(sessionId)**: `Promise<void>`
  - Starts a session or opens health wheel assessment
  - Updates session status to 'in_progress'

- **updateProgress(sessionId, progress)**: `Promise<void>`
  - Updates session progress percentage
  - Auto-completes session when progress reaches 100%

- **completeSessionWithFeedback(sessionId)**: `Promise<void>`
  - Completes a session cycle
  - Triggers next cycle availability

- **autoSaveProgress(sessionId, progressData)**: `Promise<void>`
  - Silently saves progress without user notification
  - Used for auto-save functionality

#### Health Wheel

- **handleHealthWheelComplete()**: `void`
  - Closes health wheel session
  - Reloads sessions list

#### Review & Tools

- **openReviewMode(userSession)**: `Promise<void>`
  - Opens session in read-only review mode
  - Increments review counter

- **openToolsModal(userSession)**: `void`
  - Opens tools selection modal for session

- **handleSelectTool(tool)**: `void`
  - Activates selected tool for current session

- **handleToolComplete(toolResponse)**: `Promise<void>`
  - Handles tool completion
  - Reloads session data

- **getCompletedTools(userSession)**: `string[]`
  - Returns array of completed tool IDs

#### Early Release

- **requestEarlyRelease()**: `Promise<void>`
  - Submits early release request for locked session

#### Dr. Vital Integration

- **sendDrVitalAnalysis(userSession)**: `Promise<void>`
  - Generates AI analysis of session responses
  - Captures card as image
  - Sends via WhatsApp

## Types

### UserSession

```typescript
interface UserSession {
  id: string;
  session_id: string;
  status: string;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  progress: number;
  sessions: Session;
  auto_save_data: Record<string, unknown>;
  tools_data: Record<string, ToolResponse>;
  cycle_number: number;
  next_available_date?: string;
  is_locked: boolean;
  review_count: number;
}
```

### SessionStats

```typescript
interface SessionStats {
  pending: number;
  inProgress: number;
  completed: number;
  locked: number;
  total: number;
}
```

## Dependencies

The hook properly manages all dependencies using `useCallback` to prevent unnecessary re-renders:

- All async functions are wrapped in `useCallback`
- Dependencies are correctly specified in dependency arrays
- No stale closure issues

## Best Practices

1. **Always pass the user object**: The hook requires a valid user to function
2. **Handle loading state**: Check `loading` before rendering session data
3. **Use provided setters**: Don't manipulate state directly
4. **Error handling**: All functions include try-catch with toast notifications
5. **Auto-save**: Use `autoSaveProgress` for silent saves during session

## Example: Complete Component

```typescript
import React from 'react';
import { User } from '@supabase/supabase-js';
import { useSessionData } from './hooks/useSessionData';
import { SessionList } from './SessionList';
import { SessionStats } from './SessionStats';

interface UserSessionsProps {
  user: User | null;
}

export const UserSessions: React.FC<UserSessionsProps> = ({ user }) => {
  const {
    userSessions,
    loading,
    stats,
    startSession,
    completeSessionWithFeedback,
    openReviewMode,
    sendDrVitalAnalysis,
    // ... other values
  } = useSessionData(user);

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  if (!user) {
    return <div>Please log in to view sessions</div>;
  }

  return (
    <div className="space-y-6">
      <SessionStats stats={stats} />
      <SessionList
        userSessions={userSessions}
        onStartSession={startSession}
        onCompleteSession={completeSessionWithFeedback}
        onOpenReview={openReviewMode}
        onSendDrVital={sendDrVitalAnalysis}
      />
    </div>
  );
};
```

## Testing

The hook can be tested using React Testing Library:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useSessionData } from './useSessionData';

describe('useSessionData', () => {
  it('should load sessions on mount', async () => {
    const { result } = renderHook(() => useSessionData(mockUser));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.userSessions).toHaveLength(3);
    });
  });
});
```

## Related Files

- `SessionList.tsx` - Renders list of sessions
- `SessionCard.tsx` - Individual session card component
- `SessionActions.tsx` - Action buttons for sessions
- `../../../types/sessions.ts` - TypeScript type definitions

## Requirements

**Validates: Requirements 1.7** - Extracts business logic from UserSessions.tsx into custom hook

## Notes

- All Supabase queries include proper error handling
- Toast notifications provide user feedback for all actions
- The hook follows React Hooks rules (verified with ESLint)
- All dependencies are correctly specified to prevent stale closures
