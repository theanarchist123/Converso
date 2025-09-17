import mongoose, { Schema, model, models, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Admin roles with hierarchical permissions
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  VIEWER: 'viewer'
} as const;

// Permission types for granular access control
export const PERMISSIONS = {
  // User management
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  BAN_USERS: 'ban_users',
  
  // Companion management
  VIEW_COMPANIONS: 'view_companions',
  MODERATE_COMPANIONS: 'moderate_companions',
  DELETE_COMPANIONS: 'delete_companions',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_ANALYTICS: 'export_analytics',
  
  // Admin management
  VIEW_ADMINS: 'view_admins',
  CREATE_ADMINS: 'create_admins',
  EDIT_ADMINS: 'edit_admins',
  DELETE_ADMINS: 'delete_admins',
  
  // System
  VIEW_SYSTEM_SETTINGS: 'view_system_settings',
  EDIT_SYSTEM_SETTINGS: 'edit_system_settings'
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ADMIN_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.BAN_USERS,
    PERMISSIONS.VIEW_COMPANIONS,
    PERMISSIONS.MODERATE_COMPANIONS,
    PERMISSIONS.DELETE_COMPANIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.VIEW_ADMINS
  ],
  [ADMIN_ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_COMPANIONS,
    PERMISSIONS.MODERATE_COMPANIONS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ADMIN_ROLES.VIEWER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_COMPANIONS,
    PERMISSIONS.VIEW_ANALYTICS
  ]
};

export interface IAdminUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  refreshTokens: Array<{
    token: string;
    expiresAt: Date;
    createdAt: Date;
  }>;
  createdBy?: string; // Admin who created this admin
  createdAt: Date;
  updatedAt: Date;
}

// Virtual property for checking if account is locked
interface IAdminUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateHashedPassword(password: string): Promise<string>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  hasPermission(permission: string): boolean;
}

const AdminUserSchema = new Schema<IAdminUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: Object.values(ADMIN_ROLES),
    required: true,
    default: ADMIN_ROLES.VIEWER
  },
  permissions: [{
    type: String,
    enum: Object.values(PERMISSIONS)
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: String // Admin ID who created this admin
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password and set permissions
AdminUserSchema.pre('save', async function(next) {
  const admin = this;
  
  // Hash password if modified
  if (admin.isModified('password')) {
    const saltRounds = 12;
    admin.password = await bcrypt.hash(admin.password, saltRounds);
  }
  
  // Set permissions based on role if role is modified
  if (admin.isModified('role')) {
    admin.permissions = ROLE_PERMISSIONS[admin.role as keyof typeof ROLE_PERMISSIONS] || [];
  }
  
  next();
});

// Instance methods
AdminUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

AdminUserSchema.methods.generateHashedPassword = async function(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

AdminUserSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

AdminUserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
  // Increment attempts
  this.loginAttempts += 1;
  
  // Lock account if max attempts reached
  if (this.loginAttempts >= maxAttempts) {
    this.lockUntil = new Date(Date.now() + lockTime);
  }
  
  await this.save();
};

AdminUserSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  await this.save();
};

AdminUserSchema.methods.hasPermission = function(permission: string): boolean {
  return this.permissions.includes(permission);
};

// Indexes for performance (email index is automatically created by unique: true)
AdminUserSchema.index({ role: 1 });
AdminUserSchema.index({ isActive: 1 });
AdminUserSchema.index({ createdAt: -1 });
AdminUserSchema.index({ lastLogin: -1 });

// Compound index for refresh tokens cleanup
AdminUserSchema.index({ 'refreshTokens.expiresAt': 1 });

export const AdminUser = models.AdminUser || model<IAdminUser>('AdminUser', AdminUserSchema);