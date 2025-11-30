import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { UserProfile } from '../interfaces/user-profile';
import { ExecutionResponse } from '../interfaces/execution-response';


@Injectable({
  providedIn: 'root'
})
export class UserService {
    apiUrl: string = environment.apiUrl;
     constructor(private http: HttpClient) {}

  getProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}User/profile/${userId}`);
  }
}