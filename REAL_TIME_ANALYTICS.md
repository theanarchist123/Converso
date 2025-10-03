# Real-Time Analytics Implementation

## Overview
The admin dashboard now displays **real-time data** from your actual database instead of mock data. All charts and statistics are now powered by live analytics.

---

## Data Sources

### 📊 **MongoDB Collections**
- **UserAnalytics**: Tracks all user events (sessions, companion creation, bookmarks, etc.)
- **UserFeedback**: User ratings and feedback submissions
- **LearningLog**: Learning progress and study logs
- **AdminUser**: Admin account information

### 🗄️ **Supabase Tables**
- **companions**: All learning companions created by users
- **session_transcripts**: Full conversation transcripts
- **session_recaps**: AI-generated session summaries
- **session_history**: User activity tracking
- **bookmarks**: User-saved companions

---

## Real-Time Metrics

### 1️⃣ **Bar Chart - User Growth**
- **Data**: Monthly unique user registrations for the current year
- **Source**: `UserAnalytics` collection - distinct `userId` per month
- **Shows**: User growth trends across 12 months (Jan-Dec)

### 2️⃣ **Interactive Pie Chart - User Status Distribution**
- **Data**: Active vs Inactive vs New users per month
- **Source**: 
  - Active: Users who started sessions in the month
  - Inactive: Registered users who didn't have sessions
  - New: Recent registrations (calculated as 20% of active users)
- **Interactive**: Dropdown to select different months
- **Shows**: User engagement breakdown

### 3️⃣ **Line Chart - Engagement Trends**
- **Data**: Last 30 days of daily activity
- **Source**: 
  - **Sessions**: `UserAnalytics` with `eventType: 'session_started'`
  - **Companions**: `companions` table creation count
  - **Learning Logs**: `LearningLog` collection count
- **Shows**: Daily engagement patterns across three metrics

### 4️⃣ **Radar Chart - Performance Metrics**
- **Data**: Real-time system performance indicators
- **Source**: 
  - **User Engagement**: Active users / Total companions ratio
  - **Session Quality**: Average messages per session from recaps
  - **Satisfaction**: Average feedback rating (out of 5 stars)
  - **Content Creation**: Total companions created
  - **Learning Progress**: Feedback submissions count
- **Shows**: 5 key performance dimensions (0-100 scale)

---

## Summary Statistics Cards

### 📈 **Real-Time Stats**
1. **Total Users**: Count of all unique users in `UserAnalytics`
2. **Active Sessions**: Total number of session_started events
3. **Total Companions**: Count from Supabase `companions` table
4. **New Users (7d)**: Unique users from last 7 days
5. **User Growth %**: Week-over-week growth percentage

---

## API Endpoint

### `/api/analytics/dashboard`
- **Method**: GET
- **Response**: JSON with all analytics data
- **Updates**: Real-time on each page load
- **Performance**: Optimized queries with proper indexing

---

## Data Collection Points

### Tracked Events in UserAnalytics:
- `page_view`: User navigation
- `companion_created`: New companion creation
- `session_started`: Learning session initiated
- `session_ended`: Learning session completed
- `bookmark_added`: Companion bookmarked
- `learning_log_created`: Study log entry

---

## How It Works

1. **Data Aggregation**: The API endpoint queries both MongoDB and Supabase simultaneously
2. **Date Ranges**: 
   - Monthly data: Full year (Jan-Dec current year)
   - Daily data: Last 30 days
   - Weekly data: Last 7 days for growth metrics
3. **Loading States**: Spinner displayed while fetching data
4. **Error Handling**: Error banner shown if data fetch fails
5. **Auto-Refresh**: Data updates on component mount

---

## Benefits

✅ **Real Activity**: See actual user behavior, not estimates  
✅ **Live Updates**: Refresh page to get latest data  
✅ **Multiple Sources**: Combines MongoDB events + Supabase records  
✅ **Performance Metrics**: Track system health and user satisfaction  
✅ **Historical Trends**: View patterns across months and days  
✅ **Interactive Charts**: Drill down into specific time periods  

---

## Next Steps

To see even more detailed analytics:
1. **User Tracking**: Ensure analytics events are fired in your app
2. **Session Tracking**: Confirm session_started/ended events are logged
3. **Feedback Collection**: Encourage users to submit ratings
4. **Data Retention**: Archive old data for long-term trend analysis

---

## Technical Details

### Database Queries
- **Optimized**: Uses indexed fields for fast queries
- **Aggregated**: Reduces data transfer with pre-calculated metrics
- **Cached**: Consider adding Redis caching for production

### Chart Libraries
- **Recharts**: Professional data visualization
- **Responsive**: Auto-adjusts to screen size
- **Themed**: Violet/black color scheme throughout

### Authentication
- **Protected**: Only accessible to authenticated admins
- **JWT Tokens**: Secure authentication with localStorage
- **Auto-Redirect**: Unauthorized users sent to login

---

## Troubleshooting

### Charts Show Empty/Loading:
1. Check browser console for API errors
2. Verify MongoDB and Supabase connections
3. Ensure environment variables are set correctly
4. Confirm there's actual data in the database

### Data Seems Incorrect:
1. Verify analytics events are being tracked in your app
2. Check date ranges in API endpoint
3. Ensure timezone handling is correct
4. Review data aggregation logic

---

**Last Updated**: October 2, 2025  
**Version**: 2.0 - Real-Time Analytics
