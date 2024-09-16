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

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, RouterLink, MapaComponent, MapViewEventComponent, FullCalendarComponent],
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

  constructor(private eventService: EventService, private alertService: AlertService,
    private route: ActivatedRoute, private amigoService: AmigoService, private router: Router) { }

  ngOnInit(): void {
    this.viajeId = Number(this.route.snapshot.paramMap.get('id_viaje'));
    const state = history.state as { viajeTitulo: string };
    this.viajeTitulo = state?.viajeTitulo || 'Itinerario de Viaje';

    this.getListEvents();
    this.loadViajes();

    if (this.viajeId) {
      this.loadFriendsByViaje(this.viajeId);
    }

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

  deleteEvent(id_event: number) {
    this.eventService.deleteEvent(id_event).subscribe({
      next: () => {
        console.log(id_event);
        this.alertService.showAlert('El evento ha sido eliminado con éxito', 'danger');
        this.getListEvents();
        this.eventService.notifyEventChanges();
      },
      error: error => {
        console.error('Error al eliminar el evento:', error);
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
}
