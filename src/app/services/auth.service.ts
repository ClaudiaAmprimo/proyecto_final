import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { User, UserResponse } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';
  private userBaseUrl = 'http://localhost:3000/user';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private userId: number | null = null;
  private userPhotoUrlSubject = new BehaviorSubject<string | null>(null);
  public userPhotoUrl$ = this.userPhotoUrlSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user) {
      const userObj: User = JSON.parse(user);
      console.log('User object from localStorage:', userObj);
      this.userId = userObj.id_user;

      if (userObj.photo) {
        this.userPhotoUrlSubject.next(`http://localhost:3000/uploads/${userObj.photo}`);
      }
    }
  }

  getUserProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.userBaseUrl}/`, { withCredentials: true })
      .pipe(
        tap({
          next: (response) => {
            console.log('User profile fetched:', response);
            if (response.data && response.data.photo) {
              this.userPhotoUrlSubject.next(`http://localhost:3000/uploads/${response.data.photo}`);
            }
          },
          error: (error) => console.error('Error fetching user profile:', error)
        })
      );
  }

  updateUserProfile(formData: FormData): Observable<any> {
    return this.http.put<UserResponse>(`${this.userBaseUrl}/profile`, formData, { withCredentials: true })
      .pipe(
        tap({
          next: (response) => {
            console.log('Profile updated:', response);
            if (response.data && response.data.photo) {
              const newPhotoUrl = `http://localhost:3000/uploads/${response.data.photo}`;
              this.userPhotoUrlSubject.next(newPhotoUrl);

              const user = JSON.parse(localStorage.getItem('user') || '{}');
              user.photo = response.data.photo;
              localStorage.setItem('user', JSON.stringify(user));
            }
          },
          error: (error) => console.error('Error updating profile:', error)
        })
      );
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

          if (userObj.photo) {
            this.userPhotoUrlSubject.next(`http://localhost:3000/uploads/${userObj.photo}`);
          }
        } else {
          console.error('Login failed:', response.message);
        }
      })
    );
  }

  register(userData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, userData, { withCredentials: true }).pipe(
      tap(response => {
        if (response.code === 1) {
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          if (response.data && response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            this.isAuthenticatedSubject.next(true);

            if (response.data.user.photo) {
              this.userPhotoUrlSubject.next(`http://localhost:3000/uploads/${response.data.user.photo}`);
            }
          }
        } else {
          console.error('Registration failed:', response.message);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentViajeId');
    localStorage.removeItem('currentViajeTitulo');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
    this.userPhotoUrlSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number | null {
    return this.userId;
  }

  deleteUserProfile(): Observable<any> {
    return this.http.delete(`${this.userBaseUrl}/profile`, { withCredentials: true }).pipe(
      tap({
        next: () => {
          console.log('User profile deleted');
          this.logout();
        },
        error: error => console.error('Error deleting user profile:', error)
      })
    );
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
