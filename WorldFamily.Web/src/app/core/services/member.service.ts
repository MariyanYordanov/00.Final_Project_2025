import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, switchMap, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FamilyMember, CreateMemberRequest, UpdateMemberRequest } from '../models/family.interface';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private readonly apiUrl = `${environment.apiUrl}/api/member`;
  private membersSubject = new BehaviorSubject<FamilyMember[]>([]);
  private selectedMemberSubject = new BehaviorSubject<FamilyMember | null>(null);

  // Public observables
  public members$ = this.membersSubject.asObservable();
  public selectedMember$ = this.selectedMemberSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all members for a specific family
   */
  getMembersByFamily(familyId: number): Observable<FamilyMember[]> {
    return this.http.get<FamilyMember[]>(`${this.apiUrl}/family/${familyId}`).pipe(
      tap(members => this.membersSubject.next(members)),
      catchError(this.handleError<FamilyMember[]>('getMembersByFamily', []))
    );
  }

  /**
   * Get member by ID
   */
  getMemberById(id: number): Observable<FamilyMember> {
    return this.http.get<FamilyMember>(`${this.apiUrl}/${id}`).pipe(
      tap(member => this.selectedMemberSubject.next(member)),
      catchError(this.handleError<FamilyMember>('getMemberById'))
    );
  }

  /**
   * Create new family member
   */
  createMember(member: CreateMemberRequest): Observable<FamilyMember> {
    return this.http.post<FamilyMember>(this.apiUrl, member).pipe(
      tap(newMember => {
        const currentMembers = this.membersSubject.value;
        this.membersSubject.next([...currentMembers, newMember]);
      }),
      catchError(this.handleError<FamilyMember>('createMember'))
    );
  }

  /**
   * Update existing member
   */
  updateMember(id: number, member: UpdateMemberRequest): Observable<FamilyMember> {
    return this.http.put<FamilyMember>(`${this.apiUrl}/${id}`, member).pipe(
      tap(updatedMember => {
        const currentMembers = this.membersSubject.value;
        const index = currentMembers.findIndex(m => m.id === id);
        if (index !== -1) {
          currentMembers[index] = updatedMember;
          this.membersSubject.next([...currentMembers]);
        }
        if (this.selectedMemberSubject.value?.id === id) {
          this.selectedMemberSubject.next(updatedMember);
        }
      }),
      catchError(this.handleError<FamilyMember>('updateMember'))
    );
  }

  /**
   * Delete member
   */
  deleteMember(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        const currentMembers = this.membersSubject.value;
        const filteredMembers = currentMembers.filter(m => m.id !== id);
        this.membersSubject.next(filteredMembers);
        if (this.selectedMemberSubject.value?.id === id) {
          this.selectedMemberSubject.next(null);
        }
        return true;
      }),
      catchError(this.handleError<boolean>('deleteMember', false))
    );
  }

  /**
   * Get living members (no death date)
   */
  getLivingMembers(): Observable<FamilyMember[]> {
    return this.members$.pipe(
      map(members => members.filter(member => !member.dateOfDeath))
    );
  }

  /**
   * Get deceased members (has death date)
   */
  getDeceasedMembers(): Observable<FamilyMember[]> {
    return this.members$.pipe(
      map(members => members.filter(member => member.dateOfDeath))
    );
  }

  /**
   * Filter members by gender
   */
  getMembersByGender(gender: string): Observable<FamilyMember[]> {
    return this.members$.pipe(
      map(members => members.filter(member => 
        member.gender.toLowerCase() === gender.toLowerCase()
      ))
    );
  }

  /**
   * Search members by name
   */
  searchMembers(searchTerm: string): Observable<FamilyMember[]> {
    if (!searchTerm.trim()) {
      return this.members$;
    }

    return this.members$.pipe(
      map(members => members.filter(member => {
        const fullName = `${member.firstName} ${member.middleName || ''} ${member.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      }))
    );
  }

  /**
   * Get members by age range
   */
  getMembersByAgeRange(minAge: number, maxAge: number): Observable<FamilyMember[]> {
    return this.members$.pipe(
      map(members => members.filter(member => {
        if (!member.dateOfBirth) return false;
        const age = this.calculateAge(new Date(member.dateOfBirth), member.dateOfDeath ? new Date(member.dateOfDeath) : new Date());
        return age >= minAge && age <= maxAge;
      }))
    );
  }

  /**
   * Get members with birthdays this month
   */
  getBirthdaysThisMonth(): Observable<FamilyMember[]> {
    const currentMonth = new Date().getMonth();
    return this.members$.pipe(
      map(members => members.filter(member => {
        if (!member.dateOfBirth) return false;
        const birthMonth = new Date(member.dateOfBirth).getMonth();
        return birthMonth === currentMonth;
      }))
    );
  }

  /**
   * Calculate age helper function
   */
  private calculateAge(birthDate: Date, referenceDate: Date = new Date()): number {
    const age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }

  /**
   * Clear selected member
   */
  clearSelectedMember(): void {
    this.selectedMemberSubject.next(null);
  }

  /**
   * Clear all members
   */
  clearMembers(): void {
    this.membersSubject.next([]);
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