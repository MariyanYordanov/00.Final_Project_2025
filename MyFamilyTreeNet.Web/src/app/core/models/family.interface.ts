export interface Family {
  id: number;
  name: string;
  description?: string;
  location?: string;
  establishedDate?: Date;
  createdAt: Date;
  createdByUserId?: string;
  memberCount?: number;
  isOwner?: boolean;
  isPublic: boolean;
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
  profileImageUrl?: string;
  familyId: number;
  familyName: string;
  age?: number;
}

export interface CreateFamilyRequest {
  name: string;
  description?: string;
  location?: string;
  establishedDate?: Date;
  isPublic?: boolean;
}

export interface UpdateFamilyRequest {
  name?: string;
  description?: string;
  location?: string;
  establishedDate?: Date;
  isPublic?: boolean;
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

export interface UpdateMemberRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  dateOfDeath?: Date;
  gender?: string;
  biography?: string;
  placeOfBirth?: string;
  placeOfDeath?: string;
}

export interface Relationship {
  id: number;
  primaryMemberId: number;
  relatedMemberId: number;
  relationshipType: RelationshipType;
  notes?: string;
  createdAt: Date;
  
  // Additional fields for display
  primaryMemberName?: string;
  relatedMemberName?: string;
  relationshipTypeName?: string;
}

export interface CreateRelationshipRequest {
  primaryMemberId: number;
  relatedMemberId: number;
  relationshipType: RelationshipType;
  notes?: string;
}

export enum RelationshipType {
  Parent = 1,
  Child = 2,
  Spouse = 3,
  Sibling = 4,
  Grandparent = 5,
  Grandchild = 6,
  Uncle = 7,
  Aunt = 8,
  Nephew = 9,
  Niece = 10,
  Cousin = 11,
  GreatGrandparent = 12,
  GreatGrandchild = 13,
  StepParent = 14,
  StepChild = 15,
  StepSibling = 16,
  HalfSibling = 17,
  Other = 99
}