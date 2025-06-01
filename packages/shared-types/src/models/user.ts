import { UserRole, UserStatus } from '../enums';

export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  refreshToken?: string | null;
  lastLoginAt?: Date | null;
  emailVerificationToken?: string | null;
  emailVerifiedAt?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  // Profile fields
  about?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  imageUrl?: string | null;
  language?: string | null;
  currency?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  imageUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: Date | null;
  createdAt: Date;
}

export interface IUserAuth {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: Date | null;
}

export interface ICreateUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

export interface IUpdateUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  about?: string;
  dateOfBirth?: Date;
  gender?: string;
  imageUrl?: string;
  language?: string;
  currency?: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

// Backward compatibility aliases
export type { ICreateUser as IUserCreate };
export type { IUpdateUser as IUserUpdate };
