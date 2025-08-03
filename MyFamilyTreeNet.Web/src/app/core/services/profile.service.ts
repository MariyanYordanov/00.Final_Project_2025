import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UpdateProfileRequest, ChangePasswordRequest } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Получаване на профила на текущия потребител
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/api/profile`);
  }

  /**
   * Актуализиране на профила на текущия потребител
   */
  updateProfile(profileData: UpdateProfileRequest): Observable<User> {
    console.log('ProfileService: Sending PUT request to', `${this.API_URL}/api/profile`);
    console.log('ProfileService: Request body:', profileData);
    return this.http.put<User>(`${this.API_URL}/api/profile`, profileData);
  }

  /**
   * Смяна на парола
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/api/profile/change-password`, passwordData);
  }
}