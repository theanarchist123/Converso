# Session Recaps Feature

## Overview
The Session Recaps feature automatically generates comprehensive summaries of learning sessions in bullet-point format, making it easy for users to review and retain key learning points.

## How It Works

### 1. Automatic Generation
- When a learning session ends (either by user action or automatic timeout), the system automatically processes the conversation
- A recap is generated using the conversation transcript between the user and the AI companion
- The recap includes bullet points, key topics, and a summary

### 2. Recap Components
Each recap contains:
- **Summary**: A brief overview of the session including duration and main subject
- **Key Topics**: Important topics and concepts covered during the session
- **Learning Points**: Bullet-point list of key insights and information discussed

### 3. User Experience
- **Loading Indicator**: Shows a spinner while the recap is being generated
- **Modal Display**: Recap appears in a modal immediately after session completion
- **Recaps Page**: Users can view all their past recaps in a dedicated page
- **Navigation**: Added "Recaps" to the main navigation menu

## Technical Implementation

### Database Schema
```sql
CREATE TABLE session_recaps (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    companion_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    bullet_points TEXT[] NOT NULL,
    key_topics TEXT[] NOT NULL,
    summary TEXT NOT NULL,
    messages_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints
- `POST /api/session/recap` - Generate recap from messages
- `GET /api/session/recaps` - Fetch user's recaps

### Components
- `SessionRecapModal` - Displays recap in a modal format
- `RecapsPage` - Lists all user recaps in a grid layout

## Setup Instructions

### 1. Database Setup
Run the following SQL in your Supabase dashboard:
```sql
-- Copy and paste the contents of setup_session_recaps_table.sql
```

### 2. Feature Usage
1. Start a learning session with any companion
2. Have a conversation (the system records all exchanges)
3. End the session using "End Session" button or let it timeout
4. Wait for the recap generation (loading spinner will show)
5. Review your recap in the modal that appears
6. Access all recaps anytime via the "Recaps" page in navigation

### 3. Customization
The recap generation algorithm can be enhanced by:
- Integrating with OpenAI API for more sophisticated summarization
- Adding subject-specific keyword extraction
- Implementing learning outcome tracking
- Adding export functionality (PDF, text, etc.)

## Benefits
- **Better Retention**: Bullet-point summaries help users remember key concepts
- **Progress Tracking**: Users can see their learning journey over time
- **Quick Review**: Easy to scan format for quick knowledge refresher
- **Learning Analytics**: Track topics and concepts covered across sessions
