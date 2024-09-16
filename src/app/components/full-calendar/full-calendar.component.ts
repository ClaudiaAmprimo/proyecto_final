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
import { AmigoService } from '../../services/amigo.service';

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
    height: 'auto',
    contentHeight: 'auto',
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
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    select: this.handleDateSelect.bind(this)
  };

  editEventForm: FormGroup;
  selectedEventId: number = 0;
  viajes: any[] = [];
  friendsList: any[] = [];
  selectedFriendsForDistribution: any[] = [];
  isEditing: boolean = false;
  operacion: string = 'Agregar ';

  constructor(
    private eventService: EventService,
    private viajeService: ViajeService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private amigoService: AmigoService
  ) {
    this.editEventForm = new FormGroup({
      titulo: new FormControl('', Validators.required),
      categoria: new FormControl('', Validators.required),
      ubicacion: new FormControl('', Validators.required),
      fechaInicio: new FormControl('', Validators.required),
      fechaFin: new FormControl('', Validators.required),
      costo: new FormControl('', Validators.required),
      comentarios: new FormControl(''),
      viajeId: new FormControl('', Validators.required),
      user_id_paid: new FormControl('', Validators.required),
      cost_distribution: new FormControl('', Validators.required)
    });

    this.editEventForm.get('costo')?.valueChanges.subscribe(() => {
      this.calculateCostDistribution();
    });

    if (!this.viajeId) {
      this.viajeId = Number(this.route.snapshot.paramMap.get('id_viaje'));
      if (this.viajeId) {
        this.editEventForm.patchValue({ viajeId: this.viajeId });
        this.loadFriends(this.viajeId);
      }
    }
  }

  ngOnInit(): void {
    this.eventService.eventChanges$.subscribe(() => {
      this.loadEvents();
    });

    if (this.viajeId) {
      this.loadFriends(this.viajeId);
    }
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
        console.log('Viajes cargados:', this.viajes);
      },
      error: (error) => {
        console.error('Error al obtener los viajes:', error);
      }
    });
  }

  loadFriends(viajeId: number) {
    if (viajeId) {
      this.amigoService.getFriendsByViaje(viajeId).subscribe({
        next: (response: any) => {
          console.log('Cargando amigos para el viaje:', viajeId);
          this.friendsList = response;
          console.log('Amigos cargados:', this.friendsList);
          this.selectedFriendsForDistribution = [];

          if (this.friendsList.length > 0) {
            this.editEventForm.get('user_id_paid')?.setValue(this.friendsList[0].id_user);
          }
        },
        error: (error: any) => {
          console.error('Error al obtener los amigos:', error);
        }
      });
    }
  }

  addToCostDistribution(friend: any) {
    const alreadyIncluded = this.selectedFriendsForDistribution.find(
      (f) => f.user_id === friend.id_user
    );

    if (!alreadyIncluded) {
      this.selectedFriendsForDistribution.push({
        user_id: friend.id_user,
        amount: 0,
        name: friend.name,
        surname: friend.surname,
      });
    } else {
      this.selectedFriendsForDistribution = this.selectedFriendsForDistribution.filter(
        (f) => f.user_id !== friend.id_user
      );
    }
  }

  isFriendSelected(friend: any): boolean {
    return this.selectedFriendsForDistribution.some(
      (f) => f.user_id === friend.id_user
    );
  }

  calculateCostDistribution() {
    const totalCost = this.editEventForm.get('costo')?.value || 0;
    const friendsCount = this.selectedFriendsForDistribution.length;

    if (friendsCount > 0) {
      const amountPerFriend = totalCost / friendsCount;

      this.selectedFriendsForDistribution = this.selectedFriendsForDistribution.map((friend) => ({
        ...friend,
        amount: amountPerFriend
      }));
    } else {
      console.warn('No hay amigos seleccionados para dividir el costo.');
    }
  }

  confirmDistribution() {
    this.calculateCostDistribution();
    console.log('Distribución calculada:', this.selectedFriendsForDistribution);

    this.editEventForm.controls['cost_distribution'].setValue(this.selectedFriendsForDistribution);
    this.closeModal('cost-distribution-modal');
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
        viajeId: data.viaje_id,
        user_id_paid: data.user_id_paid,
        cost_distribution: data.cost_distribution
      });

      if (data.viaje_id !== undefined) {
        this.loadFriends(data.viaje_id);
      } else {
        console.warn('Viaje ID is undefined');
      }

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
      const editModalElement = document.getElementById('editEventModal');
      const editModalInstance = bootstrap.Modal.getInstance(editModalElement!);
      editModalInstance?.hide();

      const modalElement = document.getElementById('confirmDeleteModal');
      const modalInstance = new bootstrap.Modal(modalElement!);
      modalInstance.show();
    }
  }

  confirmDeleteEvent() {
    if (this.selectedEventId) {
      this.eventService.deleteEvent(this.selectedEventId).subscribe({
        next: () => {
          const modalElement = document.getElementById('confirmDeleteModal');
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
      this.calculateCostDistribution();

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
            this.closeModal('editEventModal');
            this.loadEvents();
          },
          error: (error) => {
            console.error('Error al actualizar el evento:', error);
          }
        });
      } else {
        this.eventService.createEvent(eventToSend).subscribe({
          next: () => {
            this.closeModal('editEventModal');
            this.loadEvents();
          },
          error: (error) => {
            console.error('Error al crear el evento:', error);
          }
        });
      }
    }
  }

  openFriendSelectionModal() {
    const modalElement = document.getElementById('cost-distribution-modal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  onViajeSelected(event: any) {
    const selectedViajeId = event.target.value;
    if (selectedViajeId) {
      this.loadFriends(selectedViajeId);
    }
  }
}
