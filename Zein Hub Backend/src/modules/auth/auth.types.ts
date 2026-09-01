import { UserRole } from '../../constants/roles.enum.js';

export interface IRegisterStudentDTO {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IRefreshTokenDTO {
  refreshToken: string;
}

export interface ITokenPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponseUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface IAuthResponseData {
  user: IAuthResponseUser;
  tokens: IAuthTokens;
}
