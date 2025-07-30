export interface Family {
  id: number;
  name: string;
  description?: string;
  location?: string;
  establishedDate?: Date;
  createdAt: Date;
  memberCount?: number;
  isOwner?: boolean;
}

export interface FamilyMember {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth?: Date;
  dateOfDeath?: Date;
  gender: string;
  biography?: string;
  placeOfBirth?: string;
  placeOfDeath?: string;
  familyId: number;
  familyName: string;
  age?: number;
}

export interface CreateFamilyRequest {
  name: string;
  description?: string;
  location?: string;
  establishedDate?: Date;
}

export interface CreateMemberRequest {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth?: Date;
  dateOfDeath?: Date;
  gender: string;
  biography?: string;
  placeOfBirth?: string;
  placeOfDeath?: string;
  familyId: number;
}