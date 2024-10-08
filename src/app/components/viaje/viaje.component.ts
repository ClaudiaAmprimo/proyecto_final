import { Component, OnInit, ViewChild } from '@angular/core';
import { ViajeService } from '../../services/viaje.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrentTripService } from '../../services/current-trip.service';
import { AlertService } from '../../services/alert.service';
import { ConfirmModalComponent } from '../shared/confirm-modal/confirm-modal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-viaje',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, ConfirmModalComponent],
  templateUrl: './viaje.component.html',
  styleUrls: ['./viaje.component.scss']
})
export class ViajeComponent implements OnInit {
  public baseUrl: string = environment.endpoint;
  
  viajes: any[] = [];
  viajeIdToDelete: number | null = null;
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | 'warning' = 'success';

  @ViewChild('confirmModal') confirmModal!: ConfirmModalComponent;

  constructor(
    private viajeService: ViajeService,
    private router: Router,
    private currentTripService: CurrentTripService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadViajes();

    this.alertService.alertMessage$.subscribe(alert => {
      if (alert) {
        this.alertMessage = alert.message;
        this.alertType = alert.type;
        setTimeout(() => {
          this.alertService.clearAlert();
        }, 5000);
      } else {
        this.alertMessage = null;
      }
    });
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
        this.alertService.showAlert('Error al cargar los viajes', 'danger');
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
    this.confirmModal.openModal();
  }

  onConfirmDelete() {
    if (this.viajeIdToDelete !== null) {
      this.viajeService.deleteViaje(this.viajeIdToDelete).subscribe({
        next: () => {
          console.log(`Viaje con ID ${this.viajeIdToDelete} eliminado exitosamente`);
          this.alertService.showAlert('Viaje eliminado exitosamente', 'danger');

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
          this.alertService.showAlert('Error al eliminar el viaje', 'danger');
        }
      });
    }
  }

  onCancelDelete() {
    this.viajeIdToDelete = null;
  }
}
