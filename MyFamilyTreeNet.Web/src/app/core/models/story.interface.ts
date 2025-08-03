export interface Story {
  id: number;
  title: string;
  content: string;
  familyId: number;
  authorId: string;
  authorName: string;
  createdAt: Date;
  isPublic: boolean;
  eventDate?: Date;
  likesCount: number;
}

export interface CreateStoryRequest {
  title: string;
  content: string;
  familyId: number;
  isPublic?: boolean;
  eventDate?: Date;
}

export interface UpdateStoryRequest {
  title?: string;
  content?: string;
  isPublic?: boolean;
  eventDate?: Date;
}