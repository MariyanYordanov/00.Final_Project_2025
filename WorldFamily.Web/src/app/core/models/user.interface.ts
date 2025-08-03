export interface User {
  id: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth?: Date;
  bio?: string;
  profilePictureUrl?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth?: Date;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth?: string | null;
  bio?: string | null;
  profilePictureUrl?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}