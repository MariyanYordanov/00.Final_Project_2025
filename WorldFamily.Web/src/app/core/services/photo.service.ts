import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Photo, CreatePhotoRequest, UpdatePhotoRequest } from '../models/photo.interface';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private readonly apiUrl = `${environment.apiUrl}/api/photo`;
  private photosSubject = new BehaviorSubject<Photo[]>([]);
  private selectedPhotoSubject = new BehaviorSubject<Photo | null>(null);

  // Public observables
  public photos$ = this.photosSubject.asObservable();
  public selectedPhoto$ = this.selectedPhotoSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all photos
   */
  getPhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.apiUrl).pipe(
      tap(photos => this.photosSubject.next(photos)),
      catchError(this.handleError<Photo[]>('getPhotos', []))
    );
  }

  /**
   * Get photos by family ID
   */
  getPhotosByFamily(familyId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}?familyId=${familyId}`).pipe(
      tap(photos => this.photosSubject.next(photos)),
      catchError(this.handleError<Photo[]>('getPhotosByFamily', []))
    );
  }

  /**
   * Get photo by ID
   */
  getPhotoById(id: number): Observable<Photo> {
    return this.http.get<Photo>(`${this.apiUrl}/${id}`).pipe(
      tap(photo => this.selectedPhotoSubject.next(photo)),
      catchError(this.handleError<Photo>('getPhotoById'))
    );
  }

  /**
   * Upload new photo
   */
  uploadPhoto(photo: CreatePhotoRequest): Observable<Photo> {
    return this.http.post<Photo>(this.apiUrl, photo).pipe(
      tap(newPhoto => {
        const currentPhotos = this.photosSubject.value;
        this.photosSubject.next([newPhoto, ...currentPhotos]);
      }),
      catchError(this.handleError<Photo>('uploadPhoto'))
    );
  }

  /**
   * Update photo details
   */
  updatePhoto(id: number, photo: UpdatePhotoRequest): Observable<Photo> {
    return this.http.put<Photo>(`${this.apiUrl}/${id}`, photo).pipe(
      tap(updatedPhoto => {
        const currentPhotos = this.photosSubject.value;
        const index = currentPhotos.findIndex(p => p.id === id);
        if (index !== -1) {
          currentPhotos[index] = updatedPhoto;
          this.photosSubject.next([...currentPhotos]);
        }
        if (this.selectedPhotoSubject.value?.id === id) {
          this.selectedPhotoSubject.next(updatedPhoto);
        }
      }),
      catchError(this.handleError<Photo>('updatePhoto'))
    );
  }

  /**
   * Delete photo
   */
  deletePhoto(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        const currentPhotos = this.photosSubject.value;
        const filteredPhotos = currentPhotos.filter(p => p.id !== id);
        this.photosSubject.next(filteredPhotos);
        if (this.selectedPhotoSubject.value?.id === id) {
          this.selectedPhotoSubject.next(null);
        }
        return true;
      }),
      catchError(this.handleError<boolean>('deletePhoto', false))
    );
  }

  /**
   * Get recent photos (last 30 days)
   */
  getRecentPhotos(limit: number = 10): Observable<Photo[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.photos$.pipe(
      map(photos => photos
        .filter(photo => new Date(photo.uploadedAt) >= thirtyDaysAgo)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, limit)
      )
    );
  }

  /**
   * Get photos by location
   */
  getPhotosByLocation(location: string): Observable<Photo[]> {
    return this.photos$.pipe(
      map(photos => photos.filter(photo => 
        photo.location && photo.location.toLowerCase().includes(location.toLowerCase())
      ))
    );
  }

  /**
   * Get photos by date range
   */
  getPhotosByDateRange(startDate: Date, endDate: Date): Observable<Photo[]> {
    return this.photos$.pipe(
      map(photos => photos.filter(photo => {
        if (!photo.dateTaken) return false;
        const photoDate = new Date(photo.dateTaken);
        return photoDate >= startDate && photoDate <= endDate;
      }))
    );
  }

  /**
   * Search photos by title or description
   */
  searchPhotos(searchTerm: string): Observable<Photo[]> {
    if (!searchTerm.trim()) {
      return this.photos$;
    }

    return this.photos$.pipe(
      map(photos => photos.filter(photo => 
        photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (photo.description && photo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      ))
    );
  }

  /**
   * Get photos with most likes
   */
  getPopularPhotos(limit: number = 10): Observable<Photo[]> {
    return this.photos$.pipe(
      map(photos => photos
        .sort((a, b) => b.likesCount - a.likesCount)
        .slice(0, limit)
      )
    );
  }

  /**
   * Like/Unlike photo
   */
  toggleLikePhoto(id: number): Observable<Photo> {
    return this.http.post<Photo>(`${this.apiUrl}/${id}/like`, {}).pipe(
      tap(updatedPhoto => {
        const currentPhotos = this.photosSubject.value;
        const index = currentPhotos.findIndex(p => p.id === id);
        if (index !== -1) {
          currentPhotos[index] = updatedPhoto;
          this.photosSubject.next([...currentPhotos]);
        }
        if (this.selectedPhotoSubject.value?.id === id) {
          this.selectedPhotoSubject.next(updatedPhoto);
        }
      }),
      catchError(this.handleError<Photo>('toggleLikePhoto'))
    );
  }

  /**
   * Clear selected photo
   */
  clearSelectedPhoto(): void {
    this.selectedPhotoSubject.next(null);
  }

  /**
   * Clear all photos
   */
  clearPhotos(): void {
    this.photosSubject.next([]);
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