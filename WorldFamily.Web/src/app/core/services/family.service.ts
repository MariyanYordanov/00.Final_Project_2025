import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, debounceTime, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Family, FamilyMember, CreateFamilyRequest, UpdateFamilyRequest } from '../models/family.interface';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private readonly apiUrl = `${environment.apiUrl}/api/family`;
  private familiesSubject = new BehaviorSubject<Family[]>([]);
  private selectedFamilySubject = new BehaviorSubject<Family | null>(null);

  // Public observables
  public families$ = this.familiesSubject.asObservable();
  public selectedFamily$ = this.selectedFamilySubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all families with optional filtering
   */
  getFamilies(): Observable<Family[]> {
    return this.http.get<Family[]>(this.apiUrl).pipe(
      tap(families => this.familiesSubject.next(families)),
      catchError(this.handleError<Family[]>('getFamilies', []))
    );
  }

  /**
   * Get family by ID
   */
  getFamilyById(id: number): Observable<Family> {
    return this.http.get<Family>(`${this.apiUrl}/${id}`).pipe(
      tap(family => this.selectedFamilySubject.next(family)),
      catchError(this.handleError<Family>('getFamilyById'))
    );
  }

  /**
   * Create new family
   */
  createFamily(family: CreateFamilyRequest): Observable<Family> {
    return this.http.post<Family>(this.apiUrl, family).pipe(
      tap(newFamily => {
        const currentFamilies = this.familiesSubject.value;
        this.familiesSubject.next([...currentFamilies, newFamily]);
      }),
      catchError(this.handleError<Family>('createFamily'))
    );
  }

  /**
   * Update existing family
   */
  updateFamily(id: number, family: UpdateFamilyRequest): Observable<Family> {
    return this.http.put<Family>(`${this.apiUrl}/${id}`, family).pipe(
      tap(updatedFamily => {
        const currentFamilies = this.familiesSubject.value;
        const index = currentFamilies.findIndex(f => f.id === id);
        if (index !== -1) {
          currentFamilies[index] = updatedFamily;
          this.familiesSubject.next([...currentFamilies]);
        }
        if (this.selectedFamilySubject.value?.id === id) {
          this.selectedFamilySubject.next(updatedFamily);
        }
      }),
      catchError(this.handleError<Family>('updateFamily'))
    );
  }

  /**
   * Delete family
   */
  deleteFamily(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        const currentFamilies = this.familiesSubject.value;
        const filteredFamilies = currentFamilies.filter(f => f.id !== id);
        this.familiesSubject.next(filteredFamilies);
        if (this.selectedFamilySubject.value?.id === id) {
          this.selectedFamilySubject.next(null);
        }
        return true;
      }),
      catchError(this.handleError<boolean>('deleteFamily', false))
    );
  }

  /**
   * Search families with debounce
   */
  searchFamilies(searchTerm: Observable<string>): Observable<Family[]> {
    return searchTerm.pipe(
      debounceTime(300),
      switchMap(term => 
        term.length === 0 
          ? this.getFamilies()
          : this.getFamilies().pipe(
              map(families => families.filter(family => 
                family.name.toLowerCase().includes(term.toLowerCase()) ||
                (family.description && family.description.toLowerCase().includes(term.toLowerCase()))
              ))
            )
      )
    );
  }

  /**
   * Filter public families only
   */
  getPublicFamilies(): Observable<Family[]> {
    return this.families$.pipe(
      map(families => families.filter(family => family.isPublic))
    );
  }

  /**
   * Get featured families (public families sorted by creation date)
   */
  getFeaturedFamilies(limit: number = 6): Observable<Family[]> {
    return this.getPublicFamilies().pipe(
      map(families => families
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
      )
    );
  }

  /**
   * Clear selected family
   */
  clearSelectedFamily(): void {
    this.selectedFamilySubject.next(null);
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