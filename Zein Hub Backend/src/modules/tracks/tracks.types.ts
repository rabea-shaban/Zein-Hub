export interface ICreateTrackDTO {
  nameAr: string;
  nameEn: string;
  slug?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  iconUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface IUpdateTrackDTO {
  nameAr?: string;
  nameEn?: string;
  slug?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  iconUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface ITrackFilterQuery {
  isActive?: boolean;
  search?: string;
}
