import { Component, Input, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { EventService } from '../../services/event.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { Event } from '../../interfaces/event.ts';
import { ViajeService } from '../../services/viaje.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-full-calendar',
  standalone: true,
  imports: [FullCalendarModule, ReactiveFormsModule],
  templateUrl: './full-calendar.component.html',
  styleUrl: './full-calendar.component.scss'
})
export class FullCalendarComponent implements OnInit {
  @Input() viajeId: number | null = null;

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    events: [],
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    timeZone: 'local',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    views: {
      timeGridWeek: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
      },
    },
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    select: this.handleDateSelect.bind(this)
  };

  editEventForm: FormGroup;
  selectedEventId: number = 0;
  viajes: any[] = [];
  isEditing: boolean = false;
  operacion: string = 'Agregar ';

  constructor(
    private eventService: EventService,
    private viajeService: ViajeService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.editEventForm = new FormGroup({
      titulo: new FormControl('', Validators.required),
      categoria: new FormControl('', Validators.required),
      ubicacion: new FormControl('', Validators.required),
      fechaInicio: new FormControl('', Validators.required),
      fechaFin: new FormControl('', Validators.required),
      costo: new FormControl('', Validators.required),
      comentarios: new FormControl(''),
      viajeId: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadViajes();
  }

  loadEvents() {
    this.eventService.getListEvents().subscribe(events => {
      const filteredEvents = this.viajeId ? events.filter(event => event.viaje_id === this.viajeId) : events;

      const calendarEvents = filteredEvents.map(event => ({
        id: event.id_event?.toString(),
        title: `${event.titulo} - ${event.comentarios}`,
        start: event.fecha_inicio,
        end: event.fecha_fin,
        backgroundColor: '#b0c4b1',
        borderColor: '#b0c4b1',
        textColor: 'black'
      }));

      this.calendarOptions = {
        ...this.calendarOptions,
        events: calendarEvents
      };
    });
  }

  loadViajes() {
    this.viajeService.getUserViajes().subscribe({
      next: (response) => {
        this.viajes = response.data;
      },
      error: (error) => {
        console.error('Error al obtener los viajes:', error);
      }
    });
  }

  handleEventClick(info: any) {
    const event = info.event;
    this.selectedEventId = Number(event.id);
    this.isEditing = true;
    this.operacion = 'Editar ';

    this.eventService.getEvent(this.selectedEventId).subscribe((data: Event) => {
        this.editEventForm.patchValue({
            titulo: data.titulo,
            categoria: data.categoria,
            ubicacion: data.ubicacion,
            fechaInicio: this.formatForDatetimeLocal(data.fecha_inicio),
            fechaFin: this.formatForDatetimeLocal(data.fecha_fin),
            costo: data.costo,
            comentarios: data.comentarios,
            viajeId: data.viaje_id
        });

        const modalElement = document.getElementById('editEventModal');
        const modalInstance = new bootstrap.Modal(modalElement!);
        modalInstance.show();
    });
  }

  handleEventDrop(info: any) {
    this.updateEventDate(info.event);
  }

  handleEventResize(info: any) {
    this.updateEventDate(info.event);
  }

  updateEventDate(event: any) {
    const updatedEvent = {
      id_event: Number(event.id),
      fecha_inicio: event.start.toISOString(),
      fecha_fin: event.end?.toISOString(),
    };

    this.eventService.updateEvent(Number(event.id), updatedEvent).subscribe({
      next: () => {
        this.loadEvents();
      },
      error: (error) => {
        console.error('Error al actualizar el evento:', error);
      }
    });
  }

  deleteEvent() {
    if (this.selectedEventId) {
      if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
        this.eventService.deleteEvent(this.selectedEventId).subscribe({
          next: () => {
            const modalElement = document.getElementById('editEventModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement!);
            modalInstance?.hide();
            this.loadEvents();
          },
          error: (error) => {
            console.error('Error al eliminar el evento:', error);
          }
        });
      }
    }
  }

  formatForDatetimeLocal(date: Date | string): string {
    const fecha = new Date(date);
    const timezoneOffset = fecha.getTimezoneOffset() * 60000;
    const localISOTime = new Date(fecha.getTime() - timezoneOffset).toISOString().slice(0, -1);
    return localISOTime;
  }

  handleDateSelect(selectInfo: any) {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    this.editEventForm.reset();
    this.editEventForm.patchValue({
      fechaInicio: selectInfo.startStr,
      fechaFin: selectInfo.endStr,
      viajeId: this.viajeId
    });

    this.isEditing = false;
    this.operacion = 'Agregar ';

    const modalElement = document.getElementById('editEventModal');
    const modalInstance = new bootstrap.Modal(modalElement!);
    modalInstance.show();
  }

  onSubmit() {
    if (this.editEventForm.valid) {
      const formValue = this.editEventForm.value;
      const fechaInicioUTC = new Date(formValue.fechaInicio).toISOString();
      const fechaFinUTC = new Date(formValue.fechaFin).toISOString();

      const userIdCreate = this.authService.getUserId();
      if (userIdCreate === null) {
        console.error('Error: No se pudo obtener el ID del usuario.');
        return;
      }

      const eventToSend = {
        ...formValue,
        fecha_inicio: fechaInicioUTC,
        fecha_fin: fechaFinUTC,
        user_id_create: userIdCreate,
        viaje_id: this.viajeId ?? formValue.viajeId
      };

      if (this.isEditing && this.selectedEventId) {
        this.eventService.updateEvent(this.selectedEventId, eventToSend).subscribe({
          next: () => {
            this.closeModal();
            this.loadEvents();
          },
          error: (error) => {
            console.error('Error al actualizar el evento:', error);
          }
        });
      } else {
        this.eventService.createEvent(eventToSend).subscribe({
          next: () => {
            this.closeModal();
            this.loadEvents();
          },
          error: (error) => {
            console.error('Error al crear el evento:', error);
          }
        });
      }
    }
  }

  closeModal() {
    const modalElement = document.getElementById('editEventModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement!);
    modalInstance?.hide();
    this.isEditing = false;
    this.selectedEventId = 0;
    this.operacion = 'Agregar '; 
  }
}
