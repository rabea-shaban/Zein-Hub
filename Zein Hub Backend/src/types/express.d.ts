import { UserRole } from '../constants/roles.enum.js';

export interface IAuthUser {
  id: string;
  role: UserRole;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
    }
  }
}
