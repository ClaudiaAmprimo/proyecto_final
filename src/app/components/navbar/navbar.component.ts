import { Component, ElementRef, OnInit } from '@angular/core';
import { HomeComponent } from "../home/home.component";
import { LoginComponent } from "../login/login.component";
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CurrentTripService } from '../../services/current-trip.service';
import { Collapse } from 'bootstrap';
import { EventService } from '../../services/event.service';
import { ViajeService } from '../../services/viaje.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [HomeComponent, LoginComponent, RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  public baseUrl: string = environment.endpoint;
  
  isAuthenticated$: Observable<boolean> = new Observable<boolean>();
  userPhotoUrl$: Observable<string | null>;
  viajeTitulo: string = '';
  viajeId: number | null = null;

  constructor(private authService: AuthService, private router: Router, private elementRef: ElementRef,
    private currentTripService: CurrentTripService, private eventService: EventService, private viajeService: ViajeService ) {
    this.userPhotoUrl$ = this.authService.userPhotoUrl$;
  }

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentTripService.currentTripTitle$.subscribe(title => {
      this.viajeTitulo = title || 'Selecciona un viaje';
    });

    const currentTripId = localStorage.getItem('currentViajeId');
    if (currentTripId) {
      this.viajeId = Number(currentTripId);

      this.viajeService.getViajeById(this.viajeId).subscribe({
        next: (response) => {
          const viaje = response.data;
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

          if (!viaje.Users.some((user: any) => user.id_user === currentUser.id_user)) {
            this.currentTripService.setCurrentTrip('Selecciona un viaje');
            this.currentTripService.setCurrentTripId(null);
            localStorage.removeItem('currentViajeId');
            localStorage.removeItem('currentViajeTitulo');
          }
        },
        error: () => {
          this.currentTripService.setCurrentTrip('Selecciona un viaje');
          this.currentTripService.setCurrentTripId(null);
          localStorage.removeItem('currentViajeId');
          localStorage.removeItem('currentViajeTitulo');
        }
      });
    }
  }

  toggleNavbar() {
    const navbar = this.elementRef.nativeElement.querySelector('.navbar-collapse');
    if (navbar.classList.contains('show')) {
      navbar.classList.remove('show');
    } else {
      navbar.classList.add('show');
    }
  }

  closeNavbar() {
    const navbar = this.elementRef.nativeElement.querySelector('.navbar-collapse');
    if (navbar) {
      navbar.classList.remove('show');
    }
  }

  navigateToEvent() {
    const viajeId = this.currentTripService.getCurrentTripId();
    if (viajeId) {
      this.router.navigate(['/event', viajeId]);
    } else {
      console.warn('No se ha seleccionado un viaje.');
    }
  }

  navigateToCalendar() {
    const viajeId = this.currentTripService.getCurrentTripId();
    if (viajeId) {
      this.router.navigate(['/calendar', viajeId]);
    } else {
      console.warn('No se ha seleccionado un viaje.');
    }
  }

  navigateToCost() {
    const viajeId = this.currentTripService.getCurrentTripId();
    if (viajeId) {
      this.router.navigate(['/chart', viajeId]).then(() => {
        this.eventService.notifyEventChanges();
      });
    } else {
      console.warn('No se ha seleccionado un viaje.');
    }
  }

  onSelectViaje(viajeId: number, viajeTitulo: string) {
    if (viajeId === 0) {
      console.warn('No se ha seleccionado un viaje.');
      return;
    }
    this.currentTripService.setCurrentTrip(viajeTitulo);
    localStorage.setItem('currentViajeId', viajeId.toString());
    this.router.navigate(['/calendar', viajeId]);
  }

  onLogout() {
    this.currentTripService.setCurrentTrip('Selecciona un viaje');
    this.currentTripService.setCurrentTripId(null);

    localStorage.removeItem('currentViajeId');
    localStorage.removeItem('currentViajeTitulo');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
