import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  email: FormControl;
  password: FormControl;

  constructor(private router: Router, private authService: AuthService){
    this.email = new FormControl('', Validators.required);
    this.password = new FormControl('', Validators.required);

    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password,

    })
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.email.value, this.password.value).subscribe({
        next: response => {
          if (response.code === 1) {
            console.log('Login successful');
            this.router.navigate(['/']);
          } else {
            console.error('Login failed', response.message);
          }
        },
        error: error => {
          console.error('Login error', error);
        }
      });
    }
  }
}
