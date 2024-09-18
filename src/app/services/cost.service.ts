import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CostService {
  private baseUrl = 'http://localhost:3000/cost-distributions';

  constructor(private http: HttpClient) {}

  getCostDistributionsByViajeId(viajeId: number): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/viaje/${viajeId}`);
  }

}
