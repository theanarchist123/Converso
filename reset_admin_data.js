// MongoDB Commands to Reset Admin Data
// Run these commands in MongoDB Atlas Data Explorer or MongoDB Compass

use('converso');

// ===============================
// DELETE ALL ADMIN DATA
// ===============================

// 1. Delete all admin users
db.adminusers.deleteMany({});
print("✅ Deleted all admin users");

// 2. Drop all indexes on adminusers collection (optional - will be recreated)
db.adminusers.dropIndexes();
print("✅ Dropped all adminusers indexes");

// 3. If you want to completely remove the collection (optional)
// db.adminusers.drop();
// print("✅ Dropped adminusers collection completely");

print("");
print("=== ADMIN DATA CLEANUP COMPLETE ===");
print("All admin users and related data have been removed.");
print("");

// ===============================
// RECREATE ADMIN USERS (Fresh Start)
// ===============================

// Create super admin user
db.adminusers.insertOne({
  email: "admin@converso.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LQ4YCeWwZ2yR9cH.WOeZ3kX7r8tGjKlP4nQxO", // "admin123" hashed
  firstName: "Super",
  lastName: "Admin",
  role: "super_admin",
  permissions: [
    "view_users",
    "edit_users", 
    "delete_users",
    "ban_users",
    "view_companions",
    "moderate_companions",
    "delete_companions",
    "view_analytics",
    "export_analytics",
    "view_admins",
    "create_admins",
    "edit_admins",
    "delete_admins",
    "view_system_settings",
    "edit_system_settings"
  ],
  isActive: true,
  loginAttempts: 0,
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create additional admin users for testing
db.adminusers.insertMany([
  {
    email: "moderator@converso.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LQ4YCeWwZ2yR9cH.WOeZ3kX7r8tGjKlP4nQxO", // "admin123"
    firstName: "Test",
    lastName: "Moderator",
    role: "moderator",
    permissions: [
      "view_users",
      "view_companions",
      "moderate_companions",
      "view_analytics"
    ],
    isActive: true,
    loginAttempts: 0,
    refreshTokens: [],
    createdBy: "admin@converso.com",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: "viewer@converso.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LQ4YCeWwZ2yR9cH.WOeZ3kX7r8tGjKlP4nQxO", // "admin123"
    firstName: "Test",
    lastName: "Viewer",
    role: "viewer",
    permissions: [
      "view_users",
      "view_companions",
      "view_analytics"
    ],
    isActive: true,
    loginAttempts: 0,
    refreshTokens: [],
    createdBy: "admin@converso.com",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Recreate indexes for better performance (email index auto-created by unique constraint)
db.adminusers.createIndex({ role: 1 });
db.adminusers.createIndex({ isActive: 1 });
db.adminusers.createIndex({ createdAt: -1 });
db.adminusers.createIndex({ lastLogin: -1 });
db.adminusers.createIndex({ 'refreshTokens.expiresAt': 1 });

print("");
print("=== FRESH ADMIN DATA CREATED ===");
print("Login Credentials:");
print("1. Super Admin: admin@converso.com / admin123");
print("2. Moderator: moderator@converso.com / admin123"); 
print("3. Viewer: viewer@converso.com / admin123");
print("");
print("Access the admin panel at: /admin/login");
print("Admin dashboard at: /admin/dashboard");
print("");
print("=== RESET COMPLETE - JWT ADMIN SYSTEM READY! ===");

// ===============================
// VERIFICATION QUERIES
// ===============================

// Check if admin users were created successfully
print("\n=== VERIFICATION ===");
print("Total admin users:", db.adminusers.countDocuments());
db.adminusers.find({}, { email: 1, role: 1, firstName: 1, lastName: 1, _id: 0 }).forEach(printjson);