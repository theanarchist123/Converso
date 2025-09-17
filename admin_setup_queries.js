// MongoDB Setup Script for Admin Panel
// Run this in MongoDB Atlas Console to create the first admin user

use('converso');

// ===============================
// CREATE FIRST ADMIN USER
// ===============================

// Create super admin user (you can change these details)
db.adminusers.insertOne({
  email: "admin@converso.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LQ4YCeWwZ2yR9cH.WOeZ3kX7r8tGjKlP4nQxO", // This is "admin123" hashed
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

// Create additional admin users for testing different roles
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

// Create indexes for AdminUser collection (email index auto-created by unique constraint)
db.adminusers.createIndex({ role: 1 });
db.adminusers.createIndex({ isActive: 1 });
db.adminusers.createIndex({ createdAt: -1 });
db.adminusers.createIndex({ lastLogin: -1 });
db.adminusers.createIndex({ 'refreshTokens.expiresAt': 1 });

print("=== ADMIN USERS CREATED SUCCESSFULLY ===");
print("Login Credentials:");
print("1. Super Admin: admin@converso.com / admin123");
print("2. Moderator: moderator@converso.com / admin123");
print("3. Viewer: viewer@converso.com / admin123");
print("");
print("Access the admin panel at: /admin/login");
print("Admin dashboard at: /admin/dashboard");
print("");
print("=== JWT ADMIN SYSTEM READY! ===");