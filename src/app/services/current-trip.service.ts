import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentTripService  {
  private currentTripTitle = new BehaviorSubject<string>(localStorage.getItem('currentViajeTitulo') || 'Selecciona un viaje');
  currentTripTitle$ = this.currentTripTitle.asObservable();

  setCurrentTrip(title: string) {
    this.currentTripTitle.next(title);
    localStorage.setItem('currentViajeTitulo', title);
  }

  getCurrentTripTitle(): string {
    return this.currentTripTitle.getValue();
  }
}
