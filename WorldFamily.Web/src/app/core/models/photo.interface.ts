export interface Photo {
  id: number;
  title: string;
  description?: string;
  url: string;
  familyId: number;
  uploadedByUserId: string;
  uploadedAt: Date;
  dateTaken?: Date;
  location?: string;
  fileSize: number;
  contentType: string;
  likesCount: number;
}

export interface CreatePhotoRequest {
  title: string;
  description?: string;
  imageUrl: string;
  familyId: number;
  dateTaken?: Date;
  location?: string;
}

export interface UpdatePhotoRequest {
  title?: string;
  description?: string;
  dateTaken?: Date;
  location?: string;
}

