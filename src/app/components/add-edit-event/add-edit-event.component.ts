import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { format } from 'date-fns';
import { EventService } from '../../services/event.service';
import { Event } from '../../interfaces/event.ts';
import { ViajeService } from '../../services/viaje.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-add-edit-event',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './add-edit-event.component.html',
  styleUrl: './add-edit-event.component.scss'
})
export class AddEditEventComponent implements OnInit {
  eventForm: FormGroup;
  titulo: FormControl;
  categoria: FormControl;
  ubicacion: FormControl;
  fechaInicio: FormControl;
  fechaFin: FormControl;
  costo: FormControl;
  comentarios: FormControl;
  viaje: FormControl;
  viajes: any[] = [];
  eventAddedSuccess: boolean = false;
  eventUpdatedSuccess: boolean = false;
  id_event: number;
  operacion: string = 'Agregar '

  constructor(private eventService: EventService, private viajeService: ViajeService,
    private authService: AuthService, private route: ActivatedRoute, private router: Router,
    private alertService: AlertService ){
    this.titulo = new FormControl('', Validators.required);
    this.categoria = new FormControl('', Validators.required);
    this.ubicacion = new FormControl('', Validators.required);
    this.fechaInicio = new FormControl('', Validators.required);
    this.fechaFin = new FormControl('', Validators.required);
    this.costo = new FormControl('', Validators.required);
    this.comentarios = new FormControl('');
    this.viaje = new FormControl('', Validators.required);

    this.eventForm = new FormGroup({
      titulo: this.titulo,
      categoria: this.categoria,
      ubicacion: this.ubicacion,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      costo: this.costo,
      comentarios: this.comentarios,
      viajeId: this.viaje
    })

  this.id_event = Number(route.snapshot.paramMap.get('id'));
  console.log(this.id_event)
  }

  ngOnInit() {
    if (this.id_event != 0){
      this.operacion = 'Editar ';
      this.getEvent(this.id_event);
    }
    this.loadViajes();
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

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '';

    const formattedDateTime = format(new Date(dateTime), 'yyyy-MM-dd HH:mm:ss');
    return formattedDateTime;
  }

  formatForDatetimeLocal(date: Date | string): string {
    const fecha = new Date(date);
    return [
      fecha.getFullYear(),
      ('0' + (fecha.getMonth() + 1)).slice(-2),
      ('0' + fecha.getDate()).slice(-2)
    ].join('-') + 'T' + [
      ('0' + fecha.getHours()).slice(-2),
      ('0' + fecha.getMinutes()).slice(-2)
    ].join(':');
  }

  onSubmit() {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      console.log('Form Value:', formValue);

      const fechaInicioFormatted = this.formatDateTime(formValue.fechaInicio);
      const fechaFinFormatted = this.formatDateTime(formValue.fechaFin);

      const userIdCreate = this.authService.getUserId();
      console.log('User ID:', userIdCreate);
      if (userIdCreate === null) {
        console.error('Error: No se pudo obtener el ID del usuario.');
        return;
      }

      const event: Event = {
        id_event: this.id_event,
        categoria: formValue.categoria,
        titulo: formValue.titulo,
        ubicacion: formValue.ubicacion,
        fecha_inicio: fechaInicioFormatted,
        fecha_fin: fechaFinFormatted,
        costo: formValue.costo,
        comentarios: formValue.comentarios,
        viaje_id: parseInt(formValue.viajeId, 10),
        user_id_create: userIdCreate
      };

      if(this.id_event != 0){
        this.updateEvent(this.id_event, event);
      } else{
        console.log('Event:', event);
        this.addEvent(event);
      }
    }
  }

  addEvent(event: Event) {
    this.eventService.saveEvent(event).subscribe({
      next: () => {
        console.log("evento agregado");
        this.eventForm.reset();
        this.alertService.showAlert('El evento ha sido agregado con éxito', 'success');
        this.router.navigate(['/event']);
      },
      error: (error) => {
        console.error('Error al agregar evento:', error);
      }
    });
  }

  updateEvent(id_event: number, event: Event) {
    this.eventService.updateEvent(id_event, event).subscribe({
      next: () => {
        console.log("evento actualizado");
        this.eventForm.reset();
        this.alertService.showAlert('El evento ha sido actualizado con éxito', 'warning');
        this.router.navigate(['/event']);
      },
      error: (error) => {
        console.error('Error al actualizar el evento:', error);
      }
    });
  }

  getEvent(id_event: number) {
    this.eventService.getEvent(id_event).subscribe((data: Event) => {
      console.log(data);

      this.eventForm.patchValue({
        titulo: data.titulo,
        categoria: data.categoria,
        ubicacion: data.ubicacion,
        fechaInicio: this.formatForDatetimeLocal(data.fecha_inicio),
        fechaFin: this.formatForDatetimeLocal(data.fecha_fin),
        costo: data.costo,
        comentarios: data.comentarios,
        viajeId: data.viaje_id
      });
    });
  }
}
