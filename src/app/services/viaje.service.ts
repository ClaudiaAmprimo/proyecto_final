import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViajeService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.endpoint;
  }

  getUserViajes(): Observable<any> {
    return this.http.get(`${this.baseUrl}viaje`);
  }
}
