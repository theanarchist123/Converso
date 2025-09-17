// MongoDB Atlas Setup Queries for Converso App
// Run these in MongoDB Atlas Console or MongoDB Compass

// ===============================
// 1. LEARNING LOGS COLLECTION
// ===============================

// Switch to converso database
use('converso');

// Create Learning Logs collection with sample data
db.learninglogs.insertMany([
  {
    userId: "user_2example123",
    subject: "JavaScript",
    mood: "excited",
    content: "Today I learned about async/await and promises. The concept of handling asynchronous operations is becoming clearer. I practiced with fetch API and understood how to handle errors properly.",
    tags: ["javascript", "async", "promises", "web-development"],
    rating: 5,
    createdAt: new Date("2025-09-15T10:30:00Z"),
    updatedAt: new Date("2025-09-15T10:30:00Z")
  },
  {
    userId: "user_2example123",
    subject: "React",
    mood: "focused",
    content: "Worked on understanding React hooks today. useState and useEffect are powerful tools. Built a simple counter component and a data fetching component.",
    tags: ["react", "hooks", "frontend", "components"],
    rating: 4,
    createdAt: new Date("2025-09-14T14:20:00Z"),
    updatedAt: new Date("2025-09-14T14:20:00Z")
  },
  {
    userId: "user_2example123",
    subject: "MongoDB",
    mood: "curious",
    content: "Exploring NoSQL databases with MongoDB. The document-based approach is different from SQL but very flexible. Learning about collections, documents, and queries.",
    tags: ["mongodb", "nosql", "database", "backend"],
    rating: 4,
    createdAt: new Date("2025-09-13T16:45:00Z"),
    updatedAt: new Date("2025-09-13T16:45:00Z")
  },
  {
    userId: "user_2example456",
    subject: "Python",
    mood: "motivated",
    content: "Started learning Python data structures. Lists, dictionaries, and sets are very intuitive. Practiced with some basic algorithms and sorting methods.",
    tags: ["python", "data-structures", "algorithms", "programming"],
    rating: 5,
    createdAt: new Date("2025-09-12T09:15:00Z"),
    updatedAt: new Date("2025-09-12T09:15:00Z")
  }
]);

// Create indexes for better performance
db.learninglogs.createIndex({ userId: 1, createdAt: -1 });
db.learninglogs.createIndex({ subject: 1 });
db.learninglogs.createIndex({ tags: 1 });
db.learninglogs.createIndex({ mood: 1 });

// ===============================
// 2. USER ANALYTICS COLLECTION
// ===============================

// Create User Analytics collection with sample data
db.useranalytics.insertMany([
  {
    userId: "user_2example123",
    eventType: "page_view",
    eventData: { page: "/my-journey" },
    createdAt: new Date("2025-09-17T08:30:00Z")
  },
  {
    userId: "user_2example123",
    eventType: "companion_created",
    eventData: { companionId: "comp_001" },
    createdAt: new Date("2025-09-17T09:15:00Z")
  },
  {
    userId: "user_2example123",
    eventType: "session_started",
    eventData: { sessionId: "sess_001", companionId: "comp_001" },
    createdAt: new Date("2025-09-17T09:20:00Z")
  },
  {
    userId: "user_2example123",
    eventType: "session_ended",
    eventData: { sessionId: "sess_001", duration: 1800 },
    createdAt: new Date("2025-09-17T09:50:00Z")
  },
  {
    userId: "user_2example123",
    eventType: "learning_log_created",
    eventData: { logId: "log_001" },
    createdAt: new Date("2025-09-17T10:00:00Z")
  },
  {
    userId: "user_2example456",
    eventType: "page_view",
    eventData: { page: "/companions" },
    createdAt: new Date("2025-09-17T11:30:00Z")
  },
  {
    userId: "user_2example456",
    eventType: "bookmark_added",
    eventData: { companionId: "comp_002" },
    createdAt: new Date("2025-09-17T11:45:00Z")
  }
]);

// Create indexes for analytics
db.useranalytics.createIndex({ userId: 1, createdAt: -1 });
db.useranalytics.createIndex({ eventType: 1 });
db.useranalytics.createIndex({ createdAt: -1 });

// ===============================
// 3. USER FEEDBACK COLLECTION
// ===============================

// Create User Feedback collection with sample data
db.userfeedbacks.insertMany([
  {
    userId: "user_2example123",
    feedbackType: "feature_request",
    title: "Dark Mode Theme",
    description: "It would be great to have a dark mode option for better usability during evening study sessions. The current light theme can be straining on the eyes.",
    rating: null,
    tags: ["ui", "theme", "accessibility"],
    status: "pending",
    createdAt: new Date("2025-09-16T20:30:00Z"),
    updatedAt: new Date("2025-09-16T20:30:00Z")
  },
  {
    userId: "user_2example123",
    feedbackType: "session_review",
    title: "Great Learning Session with AI Companion",
    description: "Had an excellent session learning about React hooks. The AI companion was very helpful in explaining complex concepts and providing practical examples.",
    rating: 5,
    tags: ["session", "react", "ai-companion"],
    status: "reviewed",
    createdAt: new Date("2025-09-15T18:45:00Z"),
    updatedAt: new Date("2025-09-15T19:00:00Z")
  },
  {
    userId: "user_2example123",
    feedbackType: "bug_report",
    title: "Session History Not Loading",
    description: "Sometimes the session history page shows loading indefinitely. This happens mostly when I have many sessions recorded.",
    rating: null,
    tags: ["bug", "session-history", "loading"],
    status: "resolved",
    createdAt: new Date("2025-09-14T16:20:00Z"),
    updatedAt: new Date("2025-09-14T17:30:00Z")
  },
  {
    userId: "user_2example456",
    feedbackType: "general",
    title: "Love the Learning Journey Feature",
    description: "The My Journey page is fantastic! Being able to track my learning progress and mood really helps me understand my learning patterns.",
    rating: null,
    tags: ["my-journey", "learning-logs", "positive"],
    status: "reviewed",
    createdAt: new Date("2025-09-13T12:15:00Z"),
    updatedAt: new Date("2025-09-13T12:45:00Z")
  },
  {
    userId: "user_2example456",
    feedbackType: "session_review",
    title: "Good Session but Could Improve",
    description: "The Python session was helpful but I think the companion could provide more interactive coding examples. Overall good experience though.",
    rating: 4,
    tags: ["python", "session", "interactive", "coding"],
    status: "pending",
    createdAt: new Date("2025-09-12T14:30:00Z"),
    updatedAt: new Date("2025-09-12T14:30:00Z")
  }
]);

// Create indexes for feedback
db.userfeedbacks.createIndex({ userId: 1, createdAt: -1 });
db.userfeedbacks.createIndex({ feedbackType: 1, status: 1 });
db.userfeedbacks.createIndex({ rating: 1 });
db.userfeedbacks.createIndex({ status: 1 });

// ===============================
// 4. USEFUL QUERIES FOR TESTING
// ===============================

// Count documents in each collection
print("=== COLLECTION COUNTS ===");
print("Learning Logs:", db.learninglogs.countDocuments());
print("User Analytics:", db.useranalytics.countDocuments());
print("User Feedback:", db.userfeedbacks.countDocuments());

// Find learning logs by user
print("\n=== LEARNING LOGS FOR USER ===");
db.learninglogs.find({ userId: "user_2example123" }).forEach(printjson);

// Find recent analytics events
print("\n=== RECENT ANALYTICS EVENTS ===");
db.useranalytics.find().sort({ createdAt: -1 }).limit(5).forEach(printjson);

// Find feedback by type
print("\n=== SESSION REVIEWS ===");
db.userfeedbacks.find({ feedbackType: "session_review" }).forEach(printjson);

// Aggregation example: Learning logs by mood
print("\n=== LEARNING LOGS BY MOOD ===");
db.learninglogs.aggregate([
  { $group: { _id: "$mood", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).forEach(printjson);

// Aggregation example: Most common tags
print("\n=== MOST COMMON TAGS ===");
db.learninglogs.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: "$tags", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
]).forEach(printjson);

print("\n=== DATABASE SETUP COMPLETE! ===");
print("You can now test your MongoDB features with this sample data.");