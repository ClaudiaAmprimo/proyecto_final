import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { format } from 'date-fns';
import { EventService } from '../../services/event.service';
import { CostDistribution, Event } from '../../interfaces/event.ts';
import { ViajeService } from '../../services/viaje.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';
import { AmigoService } from '../../services/amigo.service';

@Component({
  selector: 'app-add-edit-event',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './add-edit-event.component.html',
  styleUrl: './add-edit-event.component.scss'
})
export class AddEditEventComponent implements OnInit {
  eventForm: FormGroup;
  user_id_paid: FormControl;
  cost_distribution: FormControl;
  titulo: FormControl;
  categoria: FormControl;
  ubicacion: FormControl;
  fechaInicio: FormControl;
  fechaFin: FormControl;
  costo: FormControl;
  comentarios: FormControl;
  viaje: FormControl;
  viajes: any[] = [];
  friendsList: any[] = [];
  eventAddedSuccess: boolean = false;
  eventUpdatedSuccess: boolean = false;
  id_event: number;
  operacion: string = 'Agregar ';
  selectedFriendsForDistribution: CostDistribution[] = [];
  selectedPayer: number | null = null;
  viajeId: number | null = null;

  constructor(private eventService: EventService, private viajeService: ViajeService,
    private authService: AuthService, private route: ActivatedRoute, private router: Router,
    private alertService: AlertService, private amigoService: AmigoService ){

    this.titulo = new FormControl('', Validators.required);
    this.categoria = new FormControl('', Validators.required);
    this.ubicacion = new FormControl('', Validators.required);
    this.fechaInicio = new FormControl('', Validators.required);
    this.fechaFin = new FormControl('', Validators.required);
    this.costo = new FormControl('', Validators.required);
    this.comentarios = new FormControl('');
    this.viaje = new FormControl('', Validators.required);
    this.user_id_paid = new FormControl('', Validators.required);
    this.cost_distribution = new FormControl('', Validators.required);

    this.eventForm = new FormGroup({
      titulo: this.titulo,
      categoria: this.categoria,
      ubicacion: this.ubicacion,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      costo: this.costo,
      comentarios: this.comentarios,
      viajeId: this.viaje,
      user_id_paid: this.user_id_paid,
      cost_distribution: this.cost_distribution
    });

    this.viajeId = Number(route.snapshot.paramMap.get('id_viaje'));
    console.log('Viaje ID desde la ruta:', this.viajeId);

    if (this.viajeId) {
      this.eventForm.patchValue({ viajeId: this.viajeId });
    }

    this.id_event = Number(route.snapshot.paramMap.get('id'));
    console.log('ID del evento:', this.id_event);
  }

  ngOnInit() {
    if (this.id_event !== 0) {
      this.operacion = 'Editar ';
      this.getEvent(this.id_event);
    } else if (this.viajeId) {
      this.eventForm.patchValue({ viajeId: this.viajeId });
      this.loadFriends(this.viajeId);
    }
    this.loadViajes();
  }

  loadViajes() {
    console.log('Cargando lista de viajes');
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
            this.user_id_paid.setValue(this.friendsList[0].id_user);
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
    const totalCost = this.eventForm.get('costo')?.value || 0;
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

    this.eventForm.controls['cost_distribution'].setValue(this.selectedFriendsForDistribution);

    this.closeModal();
  }

  onViajeSelected(event: any) {
    const selectedViajeId = event.target.value;
    if (selectedViajeId) {
      this.loadFriends(selectedViajeId);
    }
  }

  openFriendSelectionModal() {
    const modal = document.getElementById('cost-distribution-modal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeModal() {
    const modal = document.getElementById('cost-distribution-modal');
    if (modal) {
      modal.style.display = 'none';
    }
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
      this.calculateCostDistribution();

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
        user_id_create: userIdCreate,
        user_id_paid: formValue.user_id_paid,
        cost_distribution: this.selectedFriendsForDistribution
      };

      if (this.id_event !== 0) {
        this.updateEvent(this.id_event, event);
      } else {
        console.log('Event:', event);
        this.addEvent(event);
      }
    } else {
      console.error('Formulario inválido:', this.eventForm.errors);
    }
  }

  addEvent(event: Event) {
    this.eventService.createEvent(event).subscribe({
      next: () => {
        console.log("evento agregado");
        this.eventForm.reset();
        this.alertService.showAlert('El evento ha sido agregado con éxito', 'success');
        this.router.navigate(['/event', event.viaje_id]);
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
        this.router.navigate(['/event', event.viaje_id]);
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
