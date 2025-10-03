# Admin Dashboard - Database Column Mapping

## 📊 Complete Database Reference for Each Chart

This document shows **exactly which database tables and columns** each chart uses to display analytics data.

---

## 🗄️ Database Overview

### **Supabase Tables** (PostgreSQL)
- `companions` - Learning companions created by users
- `session_recaps` - AI-generated session summaries
- `session_transcripts` - Full conversation transcripts
- `session_history` - User session activity tracking
- `bookmarks` - User-saved companions

### **MongoDB Collections**
- `UserAnalytics` - Event tracking (sessions, page views, etc.)
- `UserFeedback` - User feedback and ratings
- `LearningLog` - Study logs and reflections

---

## 📈 Chart 1: Bar Chart - User Growth

### **What It Shows**
Monthly user registration trends (Jan-Dec)

### **Data Source**
- **Collection**: MongoDB `UserAnalytics`
- **Query**: Get distinct `userId` per month

### **Columns Used**
```typescript
{
  userId: string,          // Unique user identifier
  createdAt: Date          // Timestamp when user was first tracked
}
```

### **Query Logic**
```typescript
// For each month (Jan-Dec):
const monthStart = new Date(2025, monthIndex, 1)
const monthEnd = new Date(2025, monthIndex + 1, 0, 23, 59, 59)

const monthlyEvents = await UserAnalytics.distinct('userId', {
  createdAt: { $gte: monthStart, $lte: monthEnd }
})

// Result: { name: 'Jan', users: monthlyEvents.length }
```

### **Sample Data Structure**
```json
[
  { "name": "Jan", "users": 1850 },
  { "name": "Feb", "users": 1920 },
  { "name": "Mar", "users": 2010 }
]
```

### **SQL Equivalent**
```sql
-- If this was in Supabase:
SELECT 
  TO_CHAR(created_at, 'Mon') as month,
  COUNT(DISTINCT user_id) as users
FROM user_analytics
WHERE EXTRACT(YEAR FROM created_at) = 2025
GROUP BY EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon')
ORDER BY EXTRACT(MONTH FROM created_at);
```

---

## 🥧 Chart 2: Interactive Pie Chart - User Status Distribution

### **What It Shows**
Active vs Inactive vs New users breakdown per month

### **Data Source**
- **Primary**: MongoDB `UserAnalytics`
- **Filters**: By `eventType` and date range

### **Columns Used**
```typescript
{
  userId: string,              // Unique user identifier
  eventType: string,           // Type of event (session_started, etc.)
  createdAt: Date              // Event timestamp
}
```

### **Query Logic**
```typescript
// For each month:
// 1. Get Active Users (had sessions)
const activeUsers = await UserAnalytics.distinct('userId', {
  eventType: 'session_started',
  createdAt: { $gte: monthStart, $lte: monthEnd }
})

// 2. Get Total Registered Users
const totalUsers = await UserAnalytics.distinct('userId', {
  createdAt: { $lte: monthEnd }
})

// 3. Calculate Inactive Users
const inactiveUsers = totalUsers.length - activeUsers.length

// 4. Calculate New Users (20% of active)
const newUsers = Math.floor(activeUsers.length * 0.2)
```

### **Sample Data Structure**
```json
[
  {
    "month": "January",
    "data": [
      { "name": "Active", "users": 1250, "fill": "#8B5CF6" },
      { "name": "Inactive", "users": 450, "fill": "#7C3AED" },
      { "name": "New", "users": 150, "fill": "#A855F7" }
    ]
  }
]
```

### **Event Types Available**
```typescript
enum EventType {
  'page_view',           // User navigated to a page
  'companion_created',   // User created a companion
  'session_started',     // User started a learning session
  'session_ended',       // User ended a session
  'bookmark_added',      // User bookmarked a companion
  'learning_log_created' // User created a learning log
}
```

---

## 📉 Chart 3: Line Chart - Engagement Trends

### **What It Shows**
Last 30 days of daily activity (sessions, companions, learning logs)

### **Data Sources**
1. **MongoDB `UserAnalytics`** - Sessions count
2. **Supabase `companions`** - Companions created
3. **MongoDB `LearningLog`** - Learning logs count

### **Columns Used**

#### UserAnalytics (MongoDB)
```typescript
{
  eventType: 'session_started',
  createdAt: Date
}
```

#### companions (Supabase)
```sql
CREATE TABLE companions (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    voice TEXT NOT NULL,
    style TEXT NOT NULL,
    duration INTEGER DEFAULT 15,
    author TEXT NOT NULL,              -- User who created it
    created_at TIMESTAMP WITH TIME ZONE,  -- Creation timestamp
    updated_at TIMESTAMP WITH TIME ZONE
)
```

#### LearningLog (MongoDB)
```typescript
{
  userId: string,
  companionId?: string,
  sessionId?: string,
  title: string,
  content: string,
  tags: string[],
  mood: string,
  rating: number,
  createdAt: Date
}
```

### **Query Logic**
```typescript
// For each of the last 30 days:
for (let i = 29; i >= 0; i--) {
  const date = new Date()
  date.setDate(date.getDate() - i)
  const nextDate = new Date(date)
  nextDate.setDate(date.getDate() + 1)
  
  // 1. Count sessions from MongoDB
  const sessions = await UserAnalytics.countDocuments({
    eventType: 'session_started',
    createdAt: { $gte: date, $lt: nextDate }
  })
  
  // 2. Count companions from Supabase
  const { count: companions } = await supabase
    .from('companions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', date.toISOString())
    .lt('created_at', nextDate.toISOString())
  
  // 3. Count learning logs from MongoDB
  const learningLogs = await LearningLog.countDocuments({
    createdAt: { $gte: date, $lt: nextDate }
  })
  
  engagementData.push({
    name: `${date.getMonth() + 1}/${date.getDate()}`,
    sessions: sessions || 0,
    companions: companions || 0,
    learningLogs: learningLogs || 0
  })
}
```

### **Sample Data Structure**
```json
[
  { "name": "9/3", "sessions": 42, "companions": 5, "learningLogs": 23 },
  { "name": "9/4", "sessions": 38, "companions": 3, "learningLogs": 19 },
  { "name": "9/5", "sessions": 45, "companions": 7, "learningLogs": 28 }
]
```

### **SQL Equivalent (Supabase Part)**
```sql
-- Get daily companion creation count
SELECT 
  DATE(created_at) as date,
  COUNT(*) as companions
FROM companions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

---

## 🎯 Chart 4: Radar Chart - Performance Metrics

### **What It Shows**
5 key performance dimensions (0-100 scale)

### **Data Sources**
1. **MongoDB `UserAnalytics`** - User engagement & sessions
2. **Supabase `session_recaps`** - Session quality
3. **MongoDB `UserFeedback`** - Satisfaction ratings
4. **Supabase `companions`** - Content creation

### **Columns Used**

#### session_recaps (Supabase)
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
    messages_count INTEGER NOT NULL,    -- USED FOR SESSION QUALITY
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
```

#### UserFeedback (MongoDB)
```typescript
{
  userId: string,
  feedbackType: 'bug_report' | 'feature_request' | 'general' | 'session_review',
  title: string,
  description: string,
  rating?: number,          // 1-5 stars - USED FOR SATISFACTION
  tags: string[],
  status: 'pending' | 'reviewed' | 'resolved' | 'closed',
  createdAt: Date
}
```

### **Metrics Calculation**

#### 1. User Engagement
```typescript
const activeUsers = await UserAnalytics.distinct('userId', {
  createdAt: { $gte: last30Days }
})

const { count: totalCompanions } = await supabase
  .from('companions')
  .select('*', { count: 'exact', head: true })

const userEngagement = Math.min(100, 
  (activeUsers.length / Math.max(1, totalCompanions)) * 100
)
```
**Formula**: `(Active Users / Total Companions) × 100`

#### 2. Session Quality
```typescript
const { data: recaps } = await supabase
  .from('session_recaps')
  .select('*')
  .gte('created_at', last30Days.toISOString())

const avgMessages = recaps.reduce((sum, recap) => 
  sum + (recap.messages_count || 0), 0
) / recaps.length

const sessionQuality = Math.min(100, (avgMessages / 10) * 100)
```
**Formula**: `(Average Messages / 10) × 100`  
**Assumption**: 10+ messages = high-quality session

#### 3. Satisfaction
```typescript
const feedbackDocs = await UserFeedback.find({
  createdAt: { $gte: last30Days }
})

const avgRating = feedbackDocs.reduce((sum, fb) => 
  sum + (fb.rating || 0), 0
) / feedbackDocs.length

const satisfaction = (avgRating / 5) * 100
```
**Formula**: `(Average Rating / 5) × 100`  
**Scale**: 1-5 stars

#### 4. Content Creation
```typescript
const { count: totalCompanions } = await supabase
  .from('companions')
  .select('*', { count: 'exact', head: true })

const contentCreation = Math.min(100, (totalCompanions / 100) * 100)
```
**Formula**: `(Total Companions / 100) × 100`  
**Assumption**: 100+ companions = 100%

#### 5. Learning Progress
```typescript
const feedbackCount = await UserFeedback.countDocuments({})

const learningProgress = Math.min(100, (feedbackCount / 50) * 100)
```
**Formula**: `(Feedback Count / 50) × 100`  
**Assumption**: 50+ feedback = 100%

### **Sample Data Structure**
```json
[
  { "metric": "User Engagement", "value": 85, "fullMark": 100 },
  { "metric": "Session Quality", "value": 78, "fullMark": 100 },
  { "metric": "Satisfaction", "value": 92, "fullMark": 100 },
  { "metric": "Content Creation", "value": 68, "fullMark": 100 },
  { "metric": "Learning Progress", "value": 75, "fullMark": 100 }
]
```

---

## 📊 Summary Statistics Cards

### **Card 1: Total Users**
- **Source**: MongoDB `UserAnalytics`
- **Query**: `UserAnalytics.distinct('userId')`
- **Column**: `userId`

### **Card 2: Active Sessions**
- **Source**: MongoDB `UserAnalytics`
- **Query**: Count where `eventType = 'session_started'`
- **Columns**: `eventType`, `createdAt`

### **Card 3: Total Companions**
- **Source**: Supabase `companions`
- **Query**: `SELECT COUNT(*) FROM companions`
- **Column**: `id` (count all rows)

### **Card 4: New Users (7 days)**
- **Source**: MongoDB `UserAnalytics`
- **Query**: Distinct `userId` where `createdAt >= last7Days`
- **Columns**: `userId`, `createdAt`

### **Card 5: Growth Percentage**
- **Calculation**: Compare week-over-week user growth
```typescript
const thisWeek = distinct userId (last 7 days)
const lastWeek = distinct userId (7-14 days ago)
const growth = ((thisWeek - lastWeek) / lastWeek) × 100
```

---

## 🔍 Complete Table Schemas

### **Supabase Tables**

#### companions
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Companion name |
| `subject` | TEXT | Subject area (e.g., Math, Science) |
| `topic` | TEXT | Specific topic |
| `voice` | TEXT | Voice style |
| `style` | TEXT | Teaching style |
| `duration` | INTEGER | Session duration (minutes) |
| `author` | TEXT | User ID who created it |
| `created_at` | TIMESTAMP | Creation timestamp ⭐ |
| `updated_at` | TIMESTAMP | Last update |

#### session_recaps
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | TEXT | User identifier |
| `companion_name` | TEXT | Companion name |
| `subject` | TEXT | Subject area |
| `topic` | TEXT | Topic covered |
| `bullet_points` | TEXT[] | Key points array |
| `key_topics` | TEXT[] | Topics array |
| `summary` | TEXT | Session summary |
| `messages_count` | INTEGER | Message count ⭐ |
| `created_at` | TIMESTAMP | Creation timestamp ⭐ |
| `updated_at` | TIMESTAMP | Last update |

#### session_history
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | TEXT | User identifier ⭐ |
| `companion_id` | UUID | Companion used |
| `created_at` | TIMESTAMP | Session timestamp ⭐ |

### **MongoDB Collections**

#### UserAnalytics
```typescript
{
  _id: ObjectId,
  userId: string,                 // ⭐ User identifier
  eventType: string,              // ⭐ Event type
  eventData: {
    companionId?: string,
    sessionId?: string,
    duration?: number,
    page?: string,
    action?: string,
    metadata?: any
  },
  userAgent: string,
  ipAddress: string,
  createdAt: Date,                // ⭐ Timestamp
  updatedAt: Date
}
```

#### UserFeedback
```typescript
{
  _id: ObjectId,
  userId: string,                 // ⭐ User identifier
  feedbackType: string,           // Type of feedback
  title: string,
  description: string,
  rating: number,                 // ⭐ 1-5 stars
  tags: string[],
  status: string,
  createdAt: Date,                // ⭐ Timestamp
  updatedAt: Date
}
```

#### LearningLog
```typescript
{
  _id: ObjectId,
  userId: string,                 // ⭐ User identifier
  companionId: string,
  sessionId: string,
  title: string,
  content: string,
  tags: string[],
  mood: string,
  rating: number,
  createdAt: Date,                // ⭐ Timestamp
  updatedAt: Date
}
```

---

## 📝 Sample Queries to Get Actual Data

### **Get User Growth Data**
```javascript
// MongoDB
db.useranalytics.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date('2025-01-01'),
        $lte: new Date('2025-12-31')
      }
    }
  },
  {
    $group: {
      _id: { $month: "$createdAt" },
      users: { $addToSet: "$userId" }
    }
  },
  {
    $project: {
      month: "$_id",
      userCount: { $size: "$users" }
    }
  }
])
```

### **Get Active Users This Month**
```javascript
// MongoDB
db.useranalytics.distinct("userId", {
  eventType: "session_started",
  createdAt: {
    $gte: new Date('2025-10-01'),
    $lte: new Date('2025-10-31')
  }
})
```

### **Get Companions Created Today**
```sql
-- Supabase
SELECT COUNT(*) as companions_today
FROM companions
WHERE DATE(created_at) = CURRENT_DATE;
```

### **Get Average Session Quality**
```sql
-- Supabase
SELECT AVG(messages_count) as avg_quality
FROM session_recaps
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### **Get User Satisfaction Rating**
```javascript
// MongoDB
db.userfeedback.aggregate([
  {
    $match: {
      rating: { $exists: true },
      createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
    }
  },
  {
    $group: {
      _id: null,
      avgRating: { $avg: "$rating" }
    }
  }
])
```

---

## 🎯 Key Takeaways

### **Primary Data Points**
⭐ **Most Used Columns**:
- `userId` - User identification (MongoDB & Supabase)
- `created_at` / `createdAt` - Timestamps for date filtering
- `eventType` - Categorizing user actions (MongoDB)
- `messages_count` - Session quality metric (Supabase)
- `rating` - User satisfaction (MongoDB)

### **Data Relationships**
```
UserAnalytics (MongoDB)
    ↓ userId
    ├─ Tracks: sessions, page views, events
    └─ Used by: All charts

companions (Supabase)
    ↓ created_at, author
    ├─ Shows: Content creation
    └─ Used by: Line Chart, Radar Chart

session_recaps (Supabase)
    ↓ messages_count, created_at
    ├─ Measures: Session quality
    └─ Used by: Radar Chart

UserFeedback (MongoDB)
    ↓ rating, createdAt
    ├─ Measures: Satisfaction
    └─ Used by: Radar Chart

LearningLog (MongoDB)
    ↓ createdAt
    ├─ Shows: Learning activity
    └─ Used by: Line Chart
```

---

**Last Updated**: October 2, 2025  
**API Endpoint**: `/api/analytics/dashboard`
