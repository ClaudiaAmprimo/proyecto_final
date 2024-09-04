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

  createViaje(viajeData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}viaje`, viajeData);
  }

  updateViaje(id: number, viajeData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}viaje/${id}`, viajeData);
  }

  getViajeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}viaje/${id}`);
  }

  asociarAmigo(viajeId: number, amigoId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}users-viajes`, { user_id: amigoId, viaje_id: viajeId });
  }

  deleteViaje(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}viaje/${id}`);
  }
}
