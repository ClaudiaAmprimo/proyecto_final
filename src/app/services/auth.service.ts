import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private userId: number | null = null;

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user) {
      const userObj = JSON.parse(user);
      console.log('User object from localStorage:', userObj);
      this.userId = userObj.id_user;
    }
  }

  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('email', email);
    body.set('password', password);

    return this.http.post<any>(`${this.baseUrl}/login`, body.toString(), { headers, withCredentials: true }).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response.code === 1) {
          localStorage.setItem('token', response.token);
          console.log('User data received:', response.data);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.isAuthenticatedSubject.next(true);
          const userObj = response.data.user;
          this.userId = userObj.id_user;
          console.log('User ID set in service:', this.userId);
        } else {
          console.error('Login failed:', response.message);
        }
      })
    );
  }

  register(userData: { email: string; password: string; name: string; surname: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('email', userData.email);
    body.set('password', userData.password);
    body.set('name', userData.name);
    body.set('surname', userData.surname);

    return this.http.post<any>(`${this.baseUrl}/register`, body.toString(), { headers, withCredentials: true }).pipe(
      tap(response => {
        console.log('Registration response:', response);
        if (response.code === 1) {
          if (response.token) {
            localStorage.setItem('token', response.token);
          }

          if (response.data && response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            const userObj = response.data.user;
            this.userId = userObj.id_user;
          } else {
            console.warn('No user data in registration response');
          }

          this.isAuthenticatedSubject.next(true);
        } else {
          console.error('Registration failed:', response.message);
        }
      })
    );
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number | null {
    return this.userId;
  }

  public setUserId(id: number): void {
    this.userId = id;
  }

  public setAuthenticated(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}
