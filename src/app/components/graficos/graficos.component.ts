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

        if (this.costDistributions.length > 0) {
          console.log('Distribuciones de costos disponibles:', this.costDistributions);
        } else {
          console.warn('No hay distribuciones de costos disponibles');
        }
      },
      error: (error) => {
        console.error('Error al obtener las distribuciones de costos:', error);
      }
    });
  }
}
