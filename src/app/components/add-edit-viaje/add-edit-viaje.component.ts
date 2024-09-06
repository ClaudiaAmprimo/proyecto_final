import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ViajeService } from '../../services/viaje.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';
import { AmigoService } from '../../services/amigo.service';
import { AddFriendComponent } from "../add-friend/add-friend.component";
import { SeleccionarAmigoComponent } from "../seleccionar-amigo/seleccionar-amigo.component";
import { User } from '../../interfaces/user';

declare var bootstrap: any;

@Component({
  selector: 'app-add-edit-viaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AddFriendComponent, SeleccionarAmigoComponent],
  templateUrl: './add-edit-viaje.component.html',
  styleUrl: './add-edit-viaje.component.scss'
})
export class AddEditViajeComponent implements OnInit {
  viajeForm: FormGroup;
  amigos: User[] = [];
  viajeId: number | null = null;
  operacion: string = 'Crear ';

  constructor(private viajeService: ViajeService, private router: Router,
    private alertService: AlertService, private amigoService: AmigoService, private route: ActivatedRoute) {
    this.viajeForm = new FormGroup({
      titulo: new FormControl('', Validators.required),
      ubicacion: new FormControl('', Validators.required),
      fecha_inicio: new FormControl('', Validators.required),
      fecha_fin: new FormControl('', Validators.required),
      amigos: new FormControl([])
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.viajeId = Number(id);
        this.operacion = 'Editar';
        this.loadViaje();
      } else {
        this.operacion = 'Crear';
      }
    });
    this.loadAmigos();
    this.initializeModalCloseListener();
  }

  loadAmigos() {
    this.amigoService.getFriends().subscribe({
      next: (response) => {
        this.amigos = response;
      },
      error: (error) => {
        console.error('Error al obtener la lista de amigos:', error);
      }
    });
  }

  onAmigosSeleccionados(amigosSeleccionados: any[]) {
    this.viajeForm.get('amigos')?.setValue(amigosSeleccionados.map(a => a.id_user));
  }

  onSubmit(): void {
    if (this.viajeForm.valid) {
      const viajeData = this.viajeForm.value;

      if (this.viajeId) {
        this.viajeService.updateViaje(this.viajeId, viajeData).subscribe({
          next: () => {
            console.log('Viaje actualizado exitosamente');
            this.alertService.showAlert('Viaje actualizado exitosamente', 'success');
            this.router.navigate(['/viaje']);
          },
          error: (error) => {
            console.error('Error al actualizar el viaje:', error);
            this.alertService.showAlert('Error al actualizar el viaje', 'danger');
          }
        });
      } else {
        this.viajeService.createViaje(viajeData).subscribe({
          next: (response) => {
            console.log('Viaje creado exitosamente', response);

            const viajeId = response.data.id_viaje;
            const amigosSeleccionados = this.viajeForm.get('amigos')?.value;

            if (amigosSeleccionados && amigosSeleccionados.length > 0) {
              const asociarAmigosObservables = amigosSeleccionados.map((amigoId: number) =>
                this.viajeService.asociarAmigo(viajeId, amigoId).toPromise()
              );

              Promise.all(asociarAmigosObservables)
                .then(() => {
                  console.log('Todos los amigos asociados exitosamente al viaje');
                  this.alertService.showAlert('Viaje creado y amigos asociados exitosamente', 'success');
                  this.router.navigate(['/event', viajeId]);
                })
                .catch((error) => {
                  console.error('Error al asociar algunos amigos al viaje:', error);
                  this.alertService.showAlert('Error al asociar algunos amigos al viaje', 'danger');
                });
            } else {
              this.alertService.showAlert('Viaje creado exitosamente', 'success');
              this.router.navigate(['/event', viajeId]);
            }

            this.viajeForm.reset();
          },
          error: (error) => {
            console.error('Error al crear el viaje:', error);
            this.alertService.showAlert('Error al crear el viaje', 'danger');
          }
        });
      }
    }
  }

  openAddFriendModal() {
    const modalElement = document.getElementById('addFriendModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  initializeModalCloseListener() {
    const modalElement = document.getElementById('addFriendModal');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.loadAmigos();
      });
    }
  }

  loadViaje(): void {
    if (!this.viajeId) return;

    this.viajeService.getViajeById(this.viajeId).subscribe({
      next: (response) => {
        const viaje = response.data;

        const fechaInicio = this.formatDate(viaje.fecha_inicio);
        const fechaFin = this.formatDate(viaje.fecha_fin);

        const amigosIds = viaje.Users ? viaje.Users.map((user: any) => user.id_user) : [];

        this.viajeForm.patchValue({
          titulo: viaje.titulo,
          ubicacion: viaje.ubicacion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          amigos: amigosIds
        });
      },
      error: (error) => {
        console.error('Error al cargar los datos del viaje:', error);
        this.alertService.showAlert('Error al cargar los datos del viaje', 'danger');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}
