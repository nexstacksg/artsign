import prisma from "../../database/client";
import {
  hashPassword,
  verifyPassword,
  generateTokenId,
} from "../../utils/auth";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../config/jwt";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenResponse,
  IUserPublic,
  UserRole,
  UserStatus,
  ErrorCode,
  HttpStatus,
  TokenPayload,
} from "@app/shared-types";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../utils/email";
import crypto from "crypto";

export class AuthService {
  private createUserPublic(user: any): IUserPublic {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl || null,
      role: user.role as UserRole,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
    };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(
        "User with this email already exists",
        HttpStatus.CONFLICT,
        ErrorCode.USER_EXISTS
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: passwordHash,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        role: UserRole.USER,
        status: UserStatus.PENDING_VERIFICATION,
        emailVerificationToken,
      },
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({
      ...tokenPayload,
      sessionId: generateTokenId(),
    });

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, emailVerificationToken);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Don't fail the registration if email fails
    }

    return {
      user: this.createUserPublic(user),
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new ApiError(
        "Invalid credentials",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Check user status
    if (
      user.status !== UserStatus.ACTIVE &&
      user.status !== UserStatus.PENDING_VERIFICATION
    ) {
      throw new ApiError(
        "Account is not active",
        HttpStatus.FORBIDDEN,
        ErrorCode.ACCOUNT_INACTIVE
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw new ApiError(
        "Invalid credentials",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({
      ...tokenPayload,
      sessionId: generateTokenId(),
    });

    // Update last login and refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        refreshToken,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
      },
    });

    return {
      user: this.createUserPublic(user),
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Find user and validate token
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(
          "Invalid refresh token",
          HttpStatus.UNAUTHORIZED,
          ErrorCode.INVALID_TOKEN
        );
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new ApiError(
          "Account is not active",
          HttpStatus.FORBIDDEN,
          ErrorCode.ACCOUNT_INACTIVE
        );
      }

      // Generate new tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken({
        ...tokenPayload,
        sessionId: generateTokenId(),
      });

      // Update refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
      };
    } catch {
      throw new ApiError(
        "Invalid refresh token",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_TOKEN
      );
    }
  }

  async logout(userId: string): Promise<void> {
    // Clear refresh token
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "LOGOUT",
        entity: "User",
        entityId: userId,
      },
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new ApiError(
        "Invalid verification token",
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        status: UserStatus.ACTIVE,
      },
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new ApiError(
        "Invalid or expired reset token",
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  async getCurrentUser(userId: string): Promise<IUserPublic> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND
      );
    }

    return this.createUserPublic(user);
  }
}

export default new AuthService();
