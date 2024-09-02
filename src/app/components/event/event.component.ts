import { Component, OnInit } from '@angular/core';
import { Event } from '../../interfaces/event.ts';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnInit {
  listEvents: Event[] = [];
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | 'warning' = 'success';
  sortAsc: boolean = true;
  viajeId: number | null = null;

  constructor(private eventService: EventService, private alertService: AlertService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.viajeId = Number(this.route.snapshot.paramMap.get('id_viaje'));

    this.getListEvents();
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

  toggleSortOrder() {
    this.sortAsc = !this.sortAsc;
    this.sortEvents();
  }

  sortEvents() {
    this.listEvents.sort((a, b) => {
      const dateA = new Date(a.fecha_inicio).getTime();
      const dateB = new Date(b.fecha_inicio).getTime();
      return this.sortAsc ? dateA - dateB : dateB - dateA;
    });
  }

  getListEvents() {
    this.eventService.getListEvents().subscribe({
      next: data => {
        this.listEvents = this.viajeId ? data.filter(event => event.viaje_id === this.viajeId) : data;
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
      },
      error: error => {
        console.error('Error al eliminar el evento:', error);
      }
    });
  }
}
