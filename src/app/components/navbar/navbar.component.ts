import { Component, OnInit } from '@angular/core';
import { HomeComponent } from "../home/home.component";
import { LoginComponent } from "../login/login.component";
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [HomeComponent, LoginComponent, RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  isAuthenticated$: Observable<boolean> = new Observable<boolean>(); 
  userPhotoUrl: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated$;

    this.isAuthenticated$.subscribe((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.photo) {
          this.userPhotoUrl = `http://localhost:3000/uploads/${user.photo}`;
        }
      } else {
        this.userPhotoUrl = null;
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
