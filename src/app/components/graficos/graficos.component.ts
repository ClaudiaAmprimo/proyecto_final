import { Component, OnInit } from '@angular/core';
import { CurrentTripService } from '../../services/current-trip.service';
import { CostService } from '../../services/cost.service';

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [],
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.scss'
})
export class GraficosComponent implements OnInit {
  viajeId: number | null = null;
  costDistributions: any[] = [];
  userPaidBalances: any[] = [];
  userCostSums: any[] = [];
  userBalances: any[] = [];

  constructor(
    private currentTripService: CurrentTripService,
    private costService: CostService
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit: Subscribing to currentTripId$');
    console.log('currentTripId from localStorage:', localStorage.getItem('currentViajeId'));

    this.currentTripService.currentTripId$.subscribe((id: number | null) => {
      console.log('Subscription to currentTripId$: received id:', id);

      this.viajeId = id;

      if (this.viajeId) {
        console.log('viajeId found, loading cost distributions for viajeId:', this.viajeId);
        this.loadCostDistributions(this.viajeId);
        this.loadTotalPaidByUsers(this.viajeId);
        this.loadSumCostDistributionsByUser(this.viajeId);
        this.loadUserBalances(this.viajeId);
      } else {
        console.warn('No hay viaje seleccionado');
      }
    });
  }

  loadCostDistributions(viajeId: number) {
    console.log('Cargando distribuciones de costos para el viajeId:', viajeId);

    this.costService.getCostDistributionsByViajeId(viajeId).subscribe({
      next: (response) => {
        this.costDistributions = response.data;
        console.log('Distribuciones de costos recibidas:', this.costDistributions);
      },
      error: (error) => {
        console.error('Error al obtener las distribuciones de costos:', error);
      }
    });
  }

  loadTotalPaidByUsers(viajeId: number) {
    this.costService.getTotalPaidByUsers(viajeId).subscribe({
      next: (response) => {
        this.userPaidBalances = response.data;
        console.log('Total pagado por usuarios:', this.userPaidBalances);
      },
      error: (error) => {
        console.error('Error al obtener el total pagado por usuarios:', error);
      }
    });
  }

  loadSumCostDistributionsByUser(viajeId: number) {
    this.costService.getSumCostDistributionsByUser(viajeId).subscribe({
      next: (response) => {
        this.userCostSums = response.data;
        console.log('Suma de distribuciones de costos por usuario:', this.userCostSums);
      },
      error: (error) => {
        console.error('Error al obtener la suma de las distribuciones de costos:', error);
      }
    });
  }

  loadUserBalances(viajeId: number) {  
    this.costService.getUserBalanceByTrip(viajeId).subscribe({
      next: (response) => {
        this.userBalances = response.data;
        console.log('Balances por usuario:', this.userBalances);
      },
      error: (error) => {
        console.error('Error al obtener los balances por usuario:', error);
      }
    });
  }
}
