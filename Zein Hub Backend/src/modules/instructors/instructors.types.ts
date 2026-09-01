export interface ICreateInstructorDTO {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  specializationTrackId?: string;
  specializations?: string[];
  bio: string;
  experienceYears?: number;
  assignedPrograms?: string[];
  photoUrl?: string;
  reelUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    portfolio?: string;
  };
}

export interface IUpdateInstructorAdminDTO {
  fullName?: string;
  phone?: string;
  password?: string;
  specializationTrackId?: string;
  specializations?: string[];
  bio?: string;
  experienceYears?: number;
  assignedPrograms?: string[];
  photoUrl?: string;
  reelUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    portfolio?: string;
  };
  isActive?: boolean;
}

export interface IUpdateInstructorSelfDTO {
  fullName?: string;
  phone?: string;
  password?: string;
  newPassword?: string;
  currentPassword?: string;
  avatarUrl?: string;
  photoUrl?: string;
  bio?: string;
  specializations?: string[];
  experienceYears?: number;
  reelUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    portfolio?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
    github?: string;
  };
}

export interface IInstructorFilterQuery {
  trackId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
