import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmigoService {

  private baseUrl = `${environment.endpoint}friends`;

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

  getFriendsByViaje(viajeId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/by-viaje/${viajeId}`);
  }
}
