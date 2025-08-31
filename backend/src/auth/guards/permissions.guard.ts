import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { 
  PERMISSIONS_KEY, 
  ROLES_KEY, 
  SELF_ACCESS_KEY, 
  PUBLIC_KEY 
} from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('Access denied');
    }

    // Get full user with roles and permissions
    const fullUser = await this.userRepository.findOne({
      where: { id: user.sub || user.id },
      relations: ['roles'],
    });

    if (!fullUser) {
      this.logger.warn(`User not found: ${user.sub || user.id}`);
      throw new ForbiddenException('User not found');
    }

    // Check if user is active
    if (!fullUser.isActive) {
      this.logger.warn(`Inactive user attempted access: ${fullUser.email}`);
      throw new ForbiddenException('Account is deactivated');
    }

    // Check required roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles) {
      const hasRequiredRole = requiredRoles.some(role => 
        fullUser.hasRole(role)
      );
      if (!hasRequiredRole) {
        this.logger.warn(
          `User ${fullUser.email} lacks required roles: ${requiredRoles.join(', ')}`
        );
        throw new ForbiddenException('Insufficient role permissions');
      }
    }

    // Check required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        fullUser.hasPermission(permission)
      );
      if (!hasAllPermissions) {
        this.logger.warn(
          `User ${fullUser.email} lacks required permissions: ${requiredPermissions.join(', ')}`
        );
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    // Check self access (user can only access their own resources)
    const requiresSelfAccess = this.reflector.getAllAndOverride<boolean>(
      SELF_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiresSelfAccess) {
      const resourceUserId = request.params.userId || request.params.id;
      if (resourceUserId && resourceUserId !== fullUser.id) {
        // Allow admins to bypass self access restrictions
        if (!fullUser.hasRole('admin')) {
          this.logger.warn(
            `User ${fullUser.email} attempted to access another user's resources`
          );
          throw new ForbiddenException('Can only access own resources');
        }
      }
    }

    // Add full user to request for controllers
    request.fullUser = fullUser;

    this.logger.debug(`Access granted for user ${fullUser.email}`);
    return true;
  }
}