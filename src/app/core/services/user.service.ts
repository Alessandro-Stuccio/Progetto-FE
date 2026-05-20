import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
  DashboardData,
  ClientBasicInfo,
  ProStats,
  UserProfile,
  ProfileEditData,
  ActivityFeedItem,
  UserManagementMode,
  ManagedUserPayload
} from '../../shared/models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/api/users/dashboard`);
  }

  updateProfile(profileData: ProfileEditData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/users/profile`, profileData);
  }

  getAdmin(): Observable<ClientBasicInfo> {
    return this.http.get<ClientBasicInfo>(`${this.apiUrl}/api/users/admin`);
  }

  getModerator(): Observable<ClientBasicInfo> {
    return this.http.get<ClientBasicInfo>(`${this.apiUrl}/api/users/moderator`);
  }

  getMyClients(): Observable<ClientBasicInfo[]> {
    return this.http.get<ClientBasicInfo[]>(`${this.apiUrl}/api/users/clients`);
  }

  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/api/admin/users`);
  }

  getInsuranceUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/api/insurance/users`);
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/admin/users`, data);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/admin/users/${userId}`);
  }

  updateUser(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/admin/users/${userId}`, data);
  }

  private usersBaseByMode(mode: UserManagementMode): string {
    return mode === 'moderator'
      ? `${this.apiUrl}/api/moderator/users`
      : `${this.apiUrl}/api/admin/users`;
  }

  getUsersByMode(mode: UserManagementMode): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.usersBaseByMode(mode));
  }

  getModeratorChatContacts(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/api/moderator/chat-contacts`);
  }

  createUserByMode(mode: UserManagementMode, data: ManagedUserPayload): Observable<any> {
    return this.http.post(this.usersBaseByMode(mode), data);
  }

  updateUserByMode(mode: UserManagementMode, userId: number, data: Partial<ManagedUserPayload>): Observable<any> {
    return this.http.put(`${this.usersBaseByMode(mode)}/${userId}`, data);
  }

  deleteUserByMode(mode: UserManagementMode, userId: number): Observable<any> {
    return this.http.delete(`${this.usersBaseByMode(mode)}/${userId}`);
  }

  getProfessionalStats(): Observable<ProStats> {
    return this.http.get<ProStats>(`${this.apiUrl}/api/professional/stats`);
  }

  getActivityFeed(days: number = 14, size: number = 15): Observable<ActivityFeedItem[]> {
    return this.http.get<ActivityFeedItem[]>(`${this.apiUrl}/api/activity/feed?days=${days}&size=${size}`);
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/admin/stats`);
  }
}
