import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, debounceTime, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Story, CreateStoryRequest, UpdateStoryRequest } from '../models/story.interface';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/story`;
  private storiesSubject = new BehaviorSubject<Story[]>([]);
  private selectedStorySubject = new BehaviorSubject<Story | null>(null);

  // Public observables
  public stories$ = this.storiesSubject.asObservable();
  public selectedStory$ = this.selectedStorySubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all stories
   */
  getStories(): Observable<Story[]> {
    return this.http.get<Story[]>(this.apiUrl).pipe(
      tap(stories => this.storiesSubject.next(stories)),
      catchError(this.handleError<Story[]>('getStories', []))
    );
  }

  /**
   * Get stories by family ID
   */
  getStoriesByFamily(familyId: number): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.apiUrl}?familyId=${familyId}`).pipe(
      tap(stories => this.storiesSubject.next(stories)),
      catchError(this.handleError<Story[]>('getStoriesByFamily', []))
    );
  }

  /**
   * Get story by ID
   */
  getStoryById(id: number): Observable<Story> {
    return this.http.get<Story>(`${this.apiUrl}/${id}`).pipe(
      tap(story => this.selectedStorySubject.next(story)),
      catchError(this.handleError<Story>('getStoryById'))
    );
  }

  /**
   * Create new story
   */
  createStory(story: CreateStoryRequest): Observable<Story> {
    return this.http.post<Story>(this.apiUrl, story).pipe(
      tap(newStory => {
        const currentStories = this.storiesSubject.value;
        this.storiesSubject.next([newStory, ...currentStories]);
      }),
      catchError(this.handleError<Story>('createStory'))
    );
  }

  /**
   * Update existing story
   */
  updateStory(id: number, story: UpdateStoryRequest): Observable<Story> {
    return this.http.put<Story>(`${this.apiUrl}/${id}`, story).pipe(
      tap(updatedStory => {
        const currentStories = this.storiesSubject.value;
        const index = currentStories.findIndex(s => s.id === id);
        if (index !== -1) {
          currentStories[index] = updatedStory;
          this.storiesSubject.next([...currentStories]);
        }
        if (this.selectedStorySubject.value?.id === id) {
          this.selectedStorySubject.next(updatedStory);
        }
      }),
      catchError(this.handleError<Story>('updateStory'))
    );
  }

  /**
   * Delete story
   */
  deleteStory(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        const currentStories = this.storiesSubject.value;
        const filteredStories = currentStories.filter(s => s.id !== id);
        this.storiesSubject.next(filteredStories);
        if (this.selectedStorySubject.value?.id === id) {
          this.selectedStorySubject.next(null);
        }
        return true;
      }),
      catchError(this.handleError<boolean>('deleteStory', false))
    );
  }

  /**
   * Search stories with debounce
   */
  searchStories(searchTerm: Observable<string>): Observable<Story[]> {
    return searchTerm.pipe(
      debounceTime(300),
      switchMap(term => 
        term.length === 0 
          ? this.getStories()
          : this.stories$.pipe(
              map(stories => stories.filter(story => 
                story.title.toLowerCase().includes(term.toLowerCase()) ||
                story.content.toLowerCase().includes(term.toLowerCase())
              ))
            )
      )
    );
  }

  /**
   * Get recent stories (last 30 days)
   */
  getRecentStories(limit: number = 10): Observable<Story[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.stories$.pipe(
      map(stories => stories
        .filter(story => new Date(story.createdAt) >= thirtyDaysAgo)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
      )
    );
  }

  /**
   * Get popular stories (most liked)
   */
  getPopularStories(limit: number = 10): Observable<Story[]> {
    return this.stories$.pipe(
      map(stories => stories
        .sort((a, b) => b.likesCount - a.likesCount)
        .slice(0, limit)
      )
    );
  }

  /**
   * Get stories by date range
   */
  getStoriesByDateRange(startDate: Date, endDate: Date): Observable<Story[]> {
    return this.stories$.pipe(
      map(stories => stories.filter(story => {
        const storyDate = new Date(story.createdAt);
        return storyDate >= startDate && storyDate <= endDate;
      }))
    );
  }

  /**
   * Get public stories only
   */
  getPublicStories(): Observable<Story[]> {
    return this.stories$.pipe(
      map(stories => stories.filter(story => story.isPublic))
    );
  }

  /**
   * Get stories by author
   */
  getStoriesByAuthor(authorId: string): Observable<Story[]> {
    return this.stories$.pipe(
      map(stories => stories.filter(story => story.authorId === authorId))
    );
  }

  /**
   * Like/Unlike story
   */
  toggleLikeStory(id: number): Observable<Story> {
    return this.http.post<Story>(`${this.apiUrl}/${id}/like`, {}).pipe(
      tap(updatedStory => {
        const currentStories = this.storiesSubject.value;
        const index = currentStories.findIndex(s => s.id === id);
        if (index !== -1) {
          currentStories[index] = updatedStory;
          this.storiesSubject.next([...currentStories]);
        }
        if (this.selectedStorySubject.value?.id === id) {
          this.selectedStorySubject.next(updatedStory);
        }
      }),
      catchError(this.handleError<Story>('toggleLikeStory'))
    );
  }

  /**
   * Get story timeline (chronologically ordered)
   */
  getStoryTimeline(): Observable<Story[]> {
    return this.stories$.pipe(
      map(stories => stories
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      )
    );
  }

  /**
   * Clear selected story
   */
  clearSelectedStory(): void {
    this.selectedStorySubject.next(null);
  }

  /**
   * Clear all stories
   */
  clearStories(): void {
    this.storiesSubject.next([]);
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