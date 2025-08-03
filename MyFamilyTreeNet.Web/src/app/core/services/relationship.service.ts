import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Relationship, CreateRelationshipRequest } from '../models/family.interface';

@Injectable({
  providedIn: 'root'
})
export class RelationshipService {
  private readonly apiUrl = `${environment.apiUrl}/api/relationship`;

  constructor(private http: HttpClient) {}

  /**
   * Get all relationships
   */
  getAllRelationships(): Observable<Relationship[]> {
    return this.http.get<Relationship[]>(this.apiUrl).pipe(
      catchError(this.handleError<Relationship[]>('getAllRelationships', []))
    );
  }

  /**
   * Get relationships for a specific member
   */
  getRelationshipsByMember(memberId: number): Observable<Relationship[]> {
    return this.http.get<Relationship[]>(`${this.apiUrl}/member/${memberId}`).pipe(
      catchError(this.handleError<Relationship[]>('getRelationshipsByMember', []))
    );
  }

  /**
   * Get relationships for a specific family
   */
  getRelationshipsByFamily(familyId: number): Observable<Relationship[]> {
    return this.http.get<Relationship[]>(`${this.apiUrl}/family/${familyId}`).pipe(
      catchError(this.handleError<Relationship[]>('getRelationshipsByFamily', []))
    );
  }

  /**
   * Get relationship by ID
   */
  getRelationshipById(id: number): Observable<Relationship> {
    return this.http.get<Relationship>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<Relationship>('getRelationshipById'))
    );
  }

  /**
   * Get member relationships tree
   */
  getMemberRelationshipsTree(memberId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/member/${memberId}/tree`).pipe(
      catchError(this.handleError<any>('getMemberRelationshipsTree'))
    );
  }

  /**
   * Create new relationship
   */
  createRelationship(relationship: CreateRelationshipRequest): Observable<Relationship> {
    return this.http.post<Relationship>(this.apiUrl, relationship).pipe(
      catchError(this.handleError<Relationship>('createRelationship'))
    );
  }

  /**
   * Update existing relationship
   */
  updateRelationship(id: number, relationship: Partial<CreateRelationshipRequest>): Observable<Relationship> {
    return this.http.put<Relationship>(`${this.apiUrl}/${id}`, relationship).pipe(
      catchError(this.handleError<Relationship>('updateRelationship'))
    );
  }

  /**
   * Delete relationship
   */
  deleteRelationship(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<boolean>('deleteRelationship', false))
    );
  }

  /**
   * Check if relationship exists between two members
   */
  checkRelationshipExists(primaryMemberId: number, relatedMemberId: number): Observable<{exists: boolean}> {
    return this.http.get<{exists: boolean}>(`${this.apiUrl}/check/${primaryMemberId}/${relatedMemberId}`).pipe(
      catchError(this.handleError<{exists: boolean}>('checkRelationshipExists', {exists: false}))
    );
  }

  /**
   * Error handler
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      
      // Let the app keep running by returning an empty result.
      return new Observable<T>(observer => {
        if (result !== undefined) {
          observer.next(result);
        }
        observer.complete();
      });
    };
  }
}