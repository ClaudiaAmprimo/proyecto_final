import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserResponse, User } from '../../interfaces/user';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';

declare var bootstrap: any;

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  userPhotoUrl: string | null = null;
  userName: string | null = null;
  userSurname: string | null = null;
  userEmail: string | null = null;
  showModal: boolean = false;
  editForm: FormGroup;
  selectedFile: File | null = null;
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | 'warning' = 'success';

  constructor(private authService: AuthService, private router: Router, private alertService: AlertService) {
    this.editForm = new FormGroup({
      name: new FormControl('', Validators.required),
      surname: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (response: UserResponse) => {
        const user = response.data;
        this.userPhotoUrl = `http://localhost:3000/uploads/${user.photo}`;
        this.userName = user.name;
        this.userSurname = user.surname;
        this.userEmail = user.email;

        this.editForm.patchValue({
          email: user.email,
          name: user.name,
          surname: user.surname,
        });
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      }
    });

    this.alertService.alertMessage$.subscribe(alert => {
      if (alert) {
        this.alertMessage = alert.message;
        this.alertType = alert.type;
        setTimeout(() => {
          this.alertService.clearAlert();
        }, 5000);
      } else {
        this.alertMessage = null;
      }
    });
  }

  openEditModal() {
    this.showModal = true;
  }

  closeEditModal() {
    this.showModal = false;
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
    }
  }

  onEditSubmit() {
    if (this.editForm.valid) {
      const formData = new FormData();
      formData.append('name', this.editForm.get('name')?.value);
      formData.append('surname', this.editForm.get('surname')?.value);

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.authService.updateUserProfile(formData).subscribe({
        next: response => {
          console.log('Profile updated successfully');

          this.userPhotoUrl = `http://localhost:3000/uploads/${response.data.photo}`;
          this.userName = response.data.name;
          this.userSurname = response.data.surname;
          this.closeEditModal();
          this.alertService.showAlert('Perfil actualizado con éxito', 'success');
        },
        error: error => {
          console.error('Error updating profile', error);
          this.alertService.showAlert('Error al actualizar el perfil', 'danger');
        }
      });
    }
  }

  confirmDeleteProfile() {
    this.authService.deleteUserProfile().subscribe({
      next: () => {
        console.log('Profile deleted successfully');

        const modalElement = document.getElementById('deleteProfileModal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) {
            modalInstance.hide();
          }
        }

        this.authService.logout();
        this.router.navigate(['/register']);
      },
      error: error => {
        console.error('Error deleting profile', error);
        this.alertService.showAlert('Error al eliminar el perfil', 'danger');
      }
    });
  }



  onImageError() {
    this.userPhotoUrl = 'http://localhost:3000/uploads/Profile_avatar_placeholder.png';
  }
}
