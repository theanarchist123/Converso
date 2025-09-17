import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest, hasPermission, hasAnyPermission, hasAllPermissions, JWTPayload } from '@/lib/jwt/auth';
import connectToDatabase from '@/lib/mongodb/connection';
import { AdminUser } from '@/lib/mongodb/models/AdminUser';

export interface AdminAuthResult {
  success: boolean;
  admin?: JWTPayload;
  error?: string;
  status?: number;
}

/**
 * Basic admin authentication middleware
 * Checks if request has valid admin token
 */
export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  try {
    const adminPayload = getAdminFromRequest(request);
    
    if (!adminPayload) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }

    // Verify admin still exists and is active
    await connectToDatabase();
    const admin = await AdminUser.findOne({
      _id: adminPayload.adminId,
      isActive: true
    });

    if (!admin) {
      return {
        success: false,
        error: 'Admin account not found or inactive',
        status: 401
      };
    }

    return {
      success: true,
      admin: adminPayload
    };

  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      status: 500
    };
  }
}

/**
 * Permission-based middleware
 * Checks if admin has specific permission
 */
export async function requirePermission(
  request: NextRequest, 
  permission: string
): Promise<AdminAuthResult> {
  const authResult = await requireAdmin(request);
  
  if (!authResult.success || !authResult.admin) {
    return authResult;
  }

  if (!hasPermission(authResult.admin, permission)) {
    return {
      success: false,
      error: 'Insufficient permissions',
      status: 403
    };
  }

  return authResult;
}

/**
 * Multiple permissions middleware (admin needs ANY of the permissions)
 */
export async function requireAnyPermission(
  request: NextRequest, 
  permissions: string[]
): Promise<AdminAuthResult> {
  const authResult = await requireAdmin(request);
  
  if (!authResult.success || !authResult.admin) {
    return authResult;
  }

  if (!hasAnyPermission(authResult.admin, permissions)) {
    return {
      success: false,
      error: 'Insufficient permissions',
      status: 403
    };
  }

  return authResult;
}

/**
 * Multiple permissions middleware (admin needs ALL permissions)
 */
export async function requireAllPermissions(
  request: NextRequest, 
  permissions: string[]
): Promise<AdminAuthResult> {
  const authResult = await requireAdmin(request);
  
  if (!authResult.success || !authResult.admin) {
    return authResult;
  }

  if (!hasAllPermissions(authResult.admin, permissions)) {
    return {
      success: false,
      error: 'Insufficient permissions',
      status: 403
    };
  }

  return authResult;
}

/**
 * Role-based middleware
 * Checks if admin has specific role or higher
 */
export async function requireRole(
  request: NextRequest, 
  requiredRole: string
): Promise<AdminAuthResult> {
  const authResult = await requireAdmin(request);
  
  if (!authResult.success || !authResult.admin) {
    return authResult;
  }

  // Role hierarchy (higher number = more permissions)
  const roleHierarchy: { [key: string]: number } = {
    'viewer': 1,
    'moderator': 2,
    'admin': 3,
    'super_admin': 4
  };

  const adminRoleLevel = roleHierarchy[authResult.admin.role] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  if (adminRoleLevel < requiredRoleLevel) {
    return {
      success: false,
      error: 'Insufficient role level',
      status: 403
    };
  }

  return authResult;
}

/**
 * Super admin only middleware
 */
export async function requireSuperAdmin(request: NextRequest): Promise<AdminAuthResult> {
  return requireRole(request, 'super_admin');
}

/**
 * Helper function to create middleware response
 */
export function createAuthErrorResponse(authResult: AdminAuthResult): NextResponse {
  return NextResponse.json(
    { error: authResult.error },
    { status: authResult.status || 401 }
  );
}

/**
 * Wrapper function to easily protect API routes
 */
export function withAdminAuth(
  handler: (request: NextRequest, admin: JWTPayload) => Promise<NextResponse>,
  options?: {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    role?: string;
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    let authResult: AdminAuthResult;

    // Apply appropriate middleware based on options
    if (options?.role) {
      authResult = await requireRole(request, options.role);
    } else if (options?.permission) {
      authResult = await requirePermission(request, options.permission);
    } else if (options?.permissions) {
      if (options.requireAll) {
        authResult = await requireAllPermissions(request, options.permissions);
      } else {
        authResult = await requireAnyPermission(request, options.permissions);
      }
    } else {
      authResult = await requireAdmin(request);
    }

    if (!authResult.success || !authResult.admin) {
      return createAuthErrorResponse(authResult);
    }

    return handler(request, authResult.admin);
  };
}

/**
 * Client-side hook helper for checking permissions
 */
export function createPermissionChecker(admin: JWTPayload) {
  return {
    hasPermission: (permission: string) => hasPermission(admin, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(admin, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(admin, permissions),
    hasRole: (role: string) => admin.role === role,
    isAtLeastRole: (role: string) => {
      const roleHierarchy: { [key: string]: number } = {
        'viewer': 1,
        'moderator': 2,
        'admin': 3,
        'super_admin': 4
      };
      const adminRoleLevel = roleHierarchy[admin.role] || 0;
      const requiredRoleLevel = roleHierarchy[role] || 0;
      return adminRoleLevel >= requiredRoleLevel;
    }
  };
}