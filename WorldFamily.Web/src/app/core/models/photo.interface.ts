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
}

export interface Story {
  id: number;
  title: string;
  content: string;
  familyId: number;
  authorId: string;
  authorName: string;
  createdAt: Date;
  isPublished: boolean;
  eventDate?: Date;
}