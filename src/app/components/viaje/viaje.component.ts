import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ViajeService } from '../../services/viaje.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-viaje',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './viaje.component.html',
  styleUrl: './viaje.component.scss'
})
export class ViajeComponent implements OnInit {
  viajeForm: FormGroup;

  constructor(private viajeService: ViajeService, private router: Router, private alertService: AlertService) {
    this.viajeForm = new FormGroup({
      titulo: new FormControl('', Validators.required),
      ubicacion: new FormControl('', Validators.required),
      fecha_inicio: new FormControl('', Validators.required),
      fecha_fin: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.viajeForm.valid) {
      this.viajeService.createViaje(this.viajeForm.value).subscribe({
        next: (response) => {
          this.alertService.showAlert('Viaje creado y asociado exitosamente', 'success');
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
