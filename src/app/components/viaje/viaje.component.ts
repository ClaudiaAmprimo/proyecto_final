import { Component, OnInit } from '@angular/core';
import { ViajeService } from '../../services/viaje.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-viaje',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './viaje.component.html',
  styleUrl: './viaje.component.scss'
})
export class ViajeComponent implements OnInit {
  viajes: any[] = [];

  constructor(private viajeService: ViajeService) {}

  ngOnInit(): void {
    this.loadViajes();
  }

  loadViajes(): void {
    this.viajeService.getUserViajes().subscribe({
      next: (response) => {
        this.viajes = response.data.sort((b: any, a: any) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());
        console.log('Viajes cargados:', this.viajes);
      },
      error: (error) => {
        console.error('Error al cargar los viajes:', error);
      }
    });
  }
}
