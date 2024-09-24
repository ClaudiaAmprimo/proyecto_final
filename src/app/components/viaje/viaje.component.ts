import { Component, OnInit } from '@angular/core';
import { ViajeService } from '../../services/viaje.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrentTripService } from '../../services/current-trip.service';

declare var bootstrap: any;

@Component({
  selector: 'app-viaje',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './viaje.component.html',
  styleUrl: './viaje.component.scss'
})
export class ViajeComponent implements OnInit {
  viajes: any[] = [];
  viajeIdToDelete: number | null = null;

  constructor(private viajeService: ViajeService, private router: Router,
  private currentTripService: CurrentTripService) {}

  ngOnInit(): void {
    this.loadViajes();
  }

  loadViajes(): void {
    this.viajeService.getUserViajes().subscribe({
      next: (response) => {
        this.viajes = response.data.sort((b: any, a: any) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());
        console.log('Viajes cargados:', this.viajes);

        if (this.viajes.length === 0) {
          this.currentTripService.setCurrentTrip('Selecciona un viaje');
          this.currentTripService.setCurrentTripId(null);
          localStorage.removeItem('currentViajeId');
          localStorage.removeItem('currentViajeTitulo');
        }
      },
      error: (error) => {
        console.error('Error al cargar los viajes:', error);
      }
    });
  }

  onSelectViaje(viajeId: number, viajeTitulo: string) {
    this.currentTripService.setCurrentTrip(viajeTitulo);
    this.currentTripService.setCurrentTripId(viajeId);
    this.router.navigate(['/event', viajeId]);
  }

  openDeleteModal(viajeId: number): void {
    this.viajeIdToDelete = viajeId;
    const modalElement = document.getElementById('deleteEventModal');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  confirmDeleteEvent(): void {
    if (this.viajeIdToDelete !== null) {
      this.viajeService.deleteViaje(this.viajeIdToDelete).subscribe({
        next: () => {
          console.log(`Viaje con ID ${this.viajeIdToDelete} eliminado exitosamente`);

          const currentTripId = this.currentTripService.getCurrentTripId();
          if (currentTripId === this.viajeIdToDelete) {
            this.loadViajes();
            if (this.viajes.length > 0) {
              this.currentTripService.setLastTripAsCurrent(this.viajes);
            } else {
              this.currentTripService.setCurrentTrip('Selecciona un viaje');
              this.currentTripService.setCurrentTripId(null);
            }
          }

          this.loadViajes(); 
          this.viajeIdToDelete = null;
          this.router.navigate(['/viaje']);
        },
        error: (error) => {
          console.error('Error al eliminar el viaje:', error);
        }
      });
    }
  }
}
