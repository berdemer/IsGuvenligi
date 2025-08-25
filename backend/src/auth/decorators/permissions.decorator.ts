import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route
 * @param permissions Array of permission strings like ['user:read', 'user:write']
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to specify required roles for a route
 * @param roles Array of role names like ['admin', 'manager']
 */
export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

/**
 * Decorator to allow access to own resources only (self permission)
 * Checks if the authenticated user can access only their own resources
 */
export const SELF_ACCESS_KEY = 'selfAccess';
export const RequireSelfAccess = () => SetMetadata(SELF_ACCESS_KEY, true);

/**
 * Decorator to bypass all permission checks (use carefully)
 */
export const PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(PUBLIC_KEY, true);