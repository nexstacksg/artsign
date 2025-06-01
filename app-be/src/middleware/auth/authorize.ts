import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate";
import { ApiError } from "../error/errorHandler";
import { UserRole } from "@app/shared-types";

export const authorize = (...allowedRoles: UserRole[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ApiError("Authentication required", 401, "AUTH_REQUIRED")
      );
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    const allowedRoleStrings: string[] = allowedRoles;
    const hasRole = allowedRoleStrings.includes(req.user.role);

    if (!hasRole) {
      return next(new ApiError("Insufficient permissions", 403, "FORBIDDEN"));
    }

    next();
  };
};

// Check if user has at least one of the specified roles
export const authorizeAny = (...allowedRoles: UserRole[]) => {
  return authorize(...allowedRoles);
};

// Check if user is a manager or higher
export const authorizeManager = () => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ApiError("Authentication required", 401, "AUTH_REQUIRED")
      );
    }

    const managerRoles: string[] = [UserRole.SUPER_ADMIN, UserRole.MANAGER];

    if (!managerRoles.includes(req.user.role)) {
      return next(new ApiError("Manager access required", 403, "FORBIDDEN"));
    }

    next();
  };
};

// Check if user is an admin (super admin only now)
export const authorizeAdmin = () => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ApiError("Authentication required", 401, "AUTH_REQUIRED")
      );
    }

    if (req.user.role !== UserRole.SUPER_ADMIN) {
      return next(new ApiError("Admin access required", 403, "FORBIDDEN"));
    }

    next();
  };
};

// Check if user is a super admin
export const authorizeSuperAdmin = () => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ApiError("Authentication required", 401, "AUTH_REQUIRED")
      );
    }

    if (req.user.role !== UserRole.SUPER_ADMIN) {
      return next(
        new ApiError("Super admin access required", 403, "FORBIDDEN")
      );
    }

    next();
  };
};

// Check if user can access their own resources or is a manager
export const authorizeSelfOrManager = (userIdParam: string = "id") => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ApiError("Authentication required", 401, "AUTH_REQUIRED")
      );
    }

    const targetUserId = req.params[userIdParam];

    // User can access their own resources
    if (req.user.id === targetUserId) {
      return next();
    }

    // Managers and above can access others' resources
    const managerRoles: string[] = [UserRole.SUPER_ADMIN, UserRole.MANAGER];

    if (!managerRoles.includes(req.user.role)) {
      return next(new ApiError("Access denied", 403, "FORBIDDEN"));
    }

    next();
  };
};
