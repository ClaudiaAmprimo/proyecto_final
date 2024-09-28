import { Component, OnInit, ViewChild } from '@angular/core';
import { Event as CustomEvent } from '../../interfaces/event.ts';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AlertService } from '../../services/alert.service';
import { AmigoService } from '../../services/amigo.service.js';
import { MapaComponent } from "../mapa-screen/mapa.component";
import { MapViewEventComponent } from "../map-view-event/map-view-event.component";
import { FullCalendarComponent } from "../full-calendar/full-calendar.component";
import { CurrentTripService } from '../../services/current-trip.service.js';
import { ConfirmModalComponent } from '../shared/confirm-modal/confirm-modal.component.js';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, RouterLink, MapaComponent, MapViewEventComponent, FullCalendarComponent, ConfirmModalComponent],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnInit {
  listEvents: CustomEvent[] = [];
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | 'warning' = 'success';
  sortAsc: boolean = true;
  viajeId: number | null = null;
  filteredEvents: CustomEvent[] = [];
  viajes: any[] = [];
  friendsList: any[] = [];
  viajeTitulo: string = '';
  eventIdToDelete: number | null = null;

  @ViewChild('confirmModal') confirmModal!: ConfirmModalComponent;

  constructor(private eventService: EventService, private alertService: AlertService,
    private route: ActivatedRoute, private amigoService: AmigoService, private router: Router,
    private currentTripService: CurrentTripService ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.viajeId = Number(params.get('id_viaje'));

      if (this.viajeId) {
        this.currentTripService.setCurrentTripId(this.viajeId);
        this.getListEvents();
        this.loadFriendsByViaje(this.viajeId);
      }

      const state = history.state as { viajeTitulo: string };
      if (state.viajeTitulo) {
        this.viajeTitulo = state.viajeTitulo;
        this.currentTripService.setCurrentTrip(this.viajeTitulo);
      } else {
        this.currentTripService.currentTripTitle$.subscribe((title) => {
          this.viajeTitulo = title || 'Itinerario de Viaje';
        });
      }
    });

    this.eventService.eventChanges$.subscribe(() => {
      this.getListEvents();
    });

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
    this.loadViajes();
  }

  loadFriendsByViaje(viajeId: number) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id_user;

    this.amigoService.getFriendsByViaje(viajeId).subscribe({
      next: (friends) => {
        this.friendsList = friends
          .filter(friend => friend.id_user !== currentUserId)
          .map(friend => ({
            ...friend,
            photoUrl: friend.photo ? `http://localhost:3000/uploads/${friend.photo}` : 'http://localhost:3000/uploads/Profile_avatar_placeholder.png'
          }));
      },
      error: (error) => {
        console.error('Error al cargar los amigos del viaje:', error);
      }
    });
  }

  toggleSortOrder() {
    this.sortAsc = !this.sortAsc;
    this.sortEvents();
  }

  sortEvents() {
    this.filteredEvents.sort((a, b) => {
      const dateA = new Date(a.fecha_inicio).getTime();
      const dateB = new Date(b.fecha_inicio).getTime();
      return this.sortAsc ? dateA - dateB : dateB - dateA;
    });
  }

  getListEvents() {
    this.eventService.getListEvents().subscribe({
      next: data => {
        this.listEvents = this.viajeId ? data.filter(event => event.viaje_id === this.viajeId) : data;
        this.filteredEvents = [...this.listEvents];
        this.sortEvents();
      },
      error: error => {
        console.error('Error al obtener los eventos:', error);
      }
    });
  }

  onFilterChange(event: Event): void {
    const selectedViajeId = (event.target as HTMLSelectElement).value;
    if (selectedViajeId) {
      this.filteredEvents = this.listEvents.filter(e => e.viaje_id === +selectedViajeId);
    } else {
      this.filteredEvents = [...this.listEvents];
    }
    this.sortEvents();
  }

  loadViajes(): void {
    this.eventService.getUserViajes().subscribe({
      next: (response) => {
        this.viajes = response.data;
      },
      error: (error) => {
        console.error('Error al obtener los viajes:', error);
      }
    });
  }

  openConfirmDeleteModal(id_event: number) {
    this.eventIdToDelete = id_event;
    this.confirmModal.modalElement.classList.add('show');
    this.confirmModal.modalElement.style.display = 'block';
    document.body.classList.add('modal-open');
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = 'custom-backdrop';
    document.body.appendChild(backdrop);
  }

  onConfirmDelete() {
    if (this.eventIdToDelete !== null) {
      this.eventService.deleteEvent(this.eventIdToDelete).subscribe({
        next: () => {
          this.alertService.showAlert('El evento ha sido eliminado con éxito', 'danger');
          this.getListEvents();
          this.eventService.notifyEventChanges();
        },
        error: error => {
          console.error('Error al eliminar el evento:', error);
        }
      });
    }
    this.closeModal();
  }

  onCancelDelete() {
    this.closeModal();
  }

  closeModal() {
    this.eventIdToDelete = null;
    this.confirmModal.modalElement.classList.remove('show');
    this.confirmModal.modalElement.style.display = 'none';
    document.body.classList.remove('modal-open');
    const backdrop = document.getElementById('custom-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }
}
