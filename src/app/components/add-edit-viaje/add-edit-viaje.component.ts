import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ViajeService } from '../../services/viaje.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';
import { AmigoService } from '../../services/amigo.service';
import { AddFriendComponent } from "../add-friend/add-friend.component";

declare var bootstrap: any;

@Component({
  selector: 'app-add-edit-viaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AddFriendComponent],
  templateUrl: './add-edit-viaje.component.html',
  styleUrl: './add-edit-viaje.component.scss'
})
export class AddEditViajeComponent implements OnInit {
  viajeForm: FormGroup;
  amigos: any[] = [];

  constructor(private viajeService: ViajeService, private router: Router,
    private alertService: AlertService, private amigoService: AmigoService) {
    this.viajeForm = new FormGroup({
      titulo: new FormControl('', Validators.required),
      ubicacion: new FormControl('', Validators.required),
      fecha_inicio: new FormControl('', Validators.required),
      fecha_fin: new FormControl('', Validators.required),
      amigos: new FormControl([])
    });
  }

  ngOnInit(): void {
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

  onSubmit(): void {
    if (this.viajeForm.valid) {
      const viajeData = this.viajeForm.value;

      this.viajeService.createViaje(viajeData).subscribe({
        next: (response) => {
          console.log('Viaje creado exitosamente', response);

          const viajeId = response.data.id_viaje;
          const amigosSeleccionados = this.viajeForm.get('amigos')?.value;

          if (amigosSeleccionados && amigosSeleccionados.length > 0) {
            amigosSeleccionados.forEach((amigoId: number) => {
              this.viajeService.asociarAmigo(viajeId, amigoId).subscribe({
                next: () => {
                  console.log(`Amigo con ID ${amigoId} asociado exitosamente al viaje`);
                },
                error: (error) => {
                  console.error('Error al asociar el amigo al viaje:', error);
                  this.alertService.showAlert('Error al asociar el amigo al viaje', 'danger');
                }
              });
            });
          }

          this.alertService.showAlert('Viaje creado exitosamente', 'success');
          this.viajeForm.reset();
          this.router.navigate(['/event']);
        },
        error: (error) => {
          console.error('Error al crear el viaje:', error);
          this.alertService.showAlert('Error al crear el viaje', 'danger');
        }
      });
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
}
