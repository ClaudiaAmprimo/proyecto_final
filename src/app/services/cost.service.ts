import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CostDistribution } from '../interfaces/event.ts';

@Injectable({
  providedIn: 'root'
})
export class CostService {
  private baseUrl = 'http://localhost:3000/cost-distributions';

  constructor(private http: HttpClient) {}

  getCostDistributionsByViajeId(viajeId: number): Observable<{ data: CostDistribution[] }> {
    return this.http.get<{ data: CostDistribution[] }>(`${this.baseUrl}/viaje/${viajeId}`);
  }

  getTotalPaidByUsers(viajeId: number): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/total-paid/${viajeId}`);
  }

  getSumCostDistributionsByUser(viajeId: number): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/sum-by-user/${viajeId}`);
  }

  getUserBalanceByTrip(viajeId: number): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/user-balance/${viajeId}`);
  }

  getUserBalanceByUser(viajeId: number, userId: number): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/balance-by-user/${viajeId}/${userId}`);
  }

  payDebt(debtId: number, paymentAmount: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${debtId}/pay`, { paymentAmount })
    .pipe(
      catchError(error => {
        console.error('Error al pagar la deuda:', error);
        return throwError(() => error);
      })
    );
  }
}
