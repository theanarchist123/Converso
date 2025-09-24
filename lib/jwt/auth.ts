import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// JWT Configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

// Token expiration times
const ACCESS_TOKEN_EXPIRE = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRE = '7d'; // 7 days

export interface JWTPayload {
  adminId: string;
  email: string;
  role: string;
  permissions: string[];
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { 
      ...payload, 
      type: 'access' 
    },
    JWT_ACCESS_SECRET,
    { 
      expiresIn: ACCESS_TOKEN_EXPIRE,
      issuer: 'converso-admin',
      audience: 'admin-panel'
    }
  );
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'type' | 'permissions'>): string {
  return jwt.sign(
    { 
      adminId: payload.adminId,
      email: payload.email,
      role: payload.role,
      type: 'refresh' 
    },
    JWT_REFRESH_SECRET,
    { 
      expiresIn: REFRESH_TOKEN_EXPIRE,
      issuer: 'converso-admin',
      audience: 'admin-panel'
    }
  );
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(adminData: {
  adminId: string;
  email: string;
  role: string;
  permissions: string[];
}): TokenPair {
  const accessToken = generateAccessToken(adminData);
  const refreshToken = generateRefreshToken(adminData);
  
  // Calculate expiration time (15 minutes from now)
  const expiresIn = Math.floor(Date.now() / 1000) + (15 * 60);
  
  return {
    accessToken,
    refreshToken,
    expiresIn
  };
}

/**
 * Verify JWT access token and return payload
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: 'converso-admin',
      audience: 'admin-panel'
    }) as JWTPayload;

    if (decoded.type !== 'access') {
      return null;
    }

    return {
      adminId: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
      type: decoded.type
    };
  } catch (error) {
    return null;
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): Omit<JWTPayload, 'permissions'> | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'converso-admin',
      audience: 'admin-panel'
    }) as JWTPayload;
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    return {
      adminId: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Extract token from cookies
 */
export function extractTokenFromCookies(request: NextRequest, cookieName: string = 'admin_token'): string | null {
  return request.cookies.get(cookieName)?.value || null;
}

/**
 * Get admin from request (checks both header and cookies)
 */
export function getAdminFromRequest(request: NextRequest): JWTPayload | null {
  // First try to get token from Authorization header
  let token = extractTokenFromHeader(request);
  
  // If not found, try cookies
  if (!token) {
    token = extractTokenFromCookies(request);
  }
  
  if (!token) {
    return null;
  }
  
  return verifyAccessToken(token);
}

/**
 * Verify admin JWT token and return admin payload (alias for getAdminFromRequest)
 */
export function verifyAdminJWT(request: NextRequest): JWTPayload | null {
  return getAdminFromRequest(request);
}

/**
 * Check if admin has specific permission
 */
export function hasPermission(adminPayload: JWTPayload, permission: string): boolean {
  return adminPayload.permissions.includes(permission);
}

/**
 * Check if admin has any of the specified permissions
 */
export function hasAnyPermission(adminPayload: JWTPayload, permissions: string[]): boolean {
  return permissions.some(permission => adminPayload.permissions.includes(permission));
}

/**
 * Check if admin has all specified permissions
 */
export function hasAllPermissions(adminPayload: JWTPayload, permissions: string[]): boolean {
  return permissions.every(permission => adminPayload.permissions.includes(permission));
}

/**
 * Generate a secure random string for JWT secrets
 */
export function generateJWTSecret(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get token expiration time from JWT
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded?.exp || null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiration(token);
  if (!exp) return true;
  
  return Date.now() >= exp * 1000;
}