export interface ICreateModuleDTO {
  title: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface IUpdateModuleDTO {
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface IReorderModuleDTO {
  order: number;
}
