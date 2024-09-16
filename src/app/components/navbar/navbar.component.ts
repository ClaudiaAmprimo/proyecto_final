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

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [HomeComponent, LoginComponent, RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  isAuthenticated$: Observable<boolean> = new Observable<boolean>();
  userPhotoUrl$: Observable<string | null>;
  viajeTitulo: string = '';
  viajeId: number | null = null;

  constructor(private authService: AuthService, private router: Router, private elementRef: ElementRef,
    private currentTripService: CurrentTripService ) {
    this.userPhotoUrl$ = this.authService.userPhotoUrl$;
  }

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentTripService.currentTripTitle$.subscribe(title => {
      this.viajeTitulo = title;
    });

    this.viajeId = Number(localStorage.getItem('currentViajeId'));
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

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
