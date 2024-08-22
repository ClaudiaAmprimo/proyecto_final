import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Alert {
  message: string;
  type: 'success' | 'danger' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertMessageSource = new BehaviorSubject<Alert | null>(null);
  alertMessage$ = this.alertMessageSource.asObservable();

  showAlert(message: string, type: 'success' | 'danger' | 'warning' = 'success') {
    this.alertMessageSource.next({ message, type });
  }

  clearAlert() {
    this.alertMessageSource.next(null);
  }
}
