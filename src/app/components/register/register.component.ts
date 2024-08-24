import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  email: FormControl;
  password: FormControl;
  confirmPassword: FormControl;
  name: FormControl;
  surname: FormControl;

  constructor(private router: Router, private authService: AuthService) {
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.password = new FormControl('', Validators.required);
    this.confirmPassword = new FormControl('', Validators.required);
    this.name = new FormControl('', Validators.required);
    this.surname = new FormControl('', Validators.required);

    this.registerForm = new FormGroup({
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      name: this.name,
      surname: this.surname,
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register({
        email: this.email.value,
        password: this.password.value,
        name: this.name.value,
        surname: this.surname.value
      }).subscribe({
        next: response => {
          if (response.code === 1) {
            console.log('Registration successful');
            if (response.token) {
              localStorage.setItem('token', response.token);
            }

            if (response.data && response.data.user) {
              localStorage.setItem('user', JSON.stringify(response.data.user));
              const userObj = response.data.user;
              this.authService.setUserId(userObj.id_user);
            }

            this.authService.setAuthenticated(true);
            this.router.navigate(['/']);
          } else {
            console.error('Registration failed', response.message);
          }
        },
        error: error => {
          console.error('Registration error', error);
        }
      });
    }
  }
}
