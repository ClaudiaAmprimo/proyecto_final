import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentTripService  {
  private currentTripTitle = new BehaviorSubject<string>(localStorage.getItem('currentViajeTitulo') || 'Selecciona un viaje');
  private currentTripId = new BehaviorSubject<number | null>(Number(localStorage.getItem('currentViajeId')) || null);

  currentTripTitle$ = this.currentTripTitle.asObservable();
  currentTripId$ = this.currentTripId.asObservable();

  setCurrentTrip(title: string) {
    this.currentTripTitle.next(title);
    localStorage.setItem('currentViajeTitulo', title);
  }

  setCurrentTripId(id: number | null) {
    this.currentTripId.next(id);
    localStorage.setItem('currentViajeId', id ? id.toString() : '');
  }

  getCurrentTripTitle(): string {
    return this.currentTripTitle.getValue();
  }

  getCurrentTripId(): number | null {
    return this.currentTripId.getValue();
  }

  setLastTripAsCurrent(viajes: any[]) {
    if (viajes.length > 0) {
      const lastViaje = viajes[0];
      this.setCurrentTrip(lastViaje.titulo);
      this.setCurrentTripId(lastViaje.id_viaje);
    } else {
      this.setCurrentTrip('Selecciona un viaje');
      this.setCurrentTripId(null);
    }
  }
}
