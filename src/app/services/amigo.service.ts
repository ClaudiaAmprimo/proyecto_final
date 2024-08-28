import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AmigoService {

  private baseUrl = 'http://localhost:3000/friends';

  constructor(private http: HttpClient) { }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/search?q=${query}`);
  }

  addFriend(amigo_id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}`, { amigo_id });
  }

  getFriends(): Observable<User[]> {  
    return this.http.get<User[]>(`${this.baseUrl}`);
  }

  removeFriend(amigo_id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${amigo_id}`);
  }
}
