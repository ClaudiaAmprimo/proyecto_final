import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserResponse, User } from '../../interfaces/user';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class DashboardComponent implements OnInit {
  userPhotoUrl: string | null = null;
  userName: string | null = null;
  userSurname: string | null = null;
  userEmail: string | null = null;
  showModal: boolean = false;
  editForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private authService: AuthService, private router: Router) {
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
        },
        error: error => {
          console.error('Error updating profile', error);
        }
      });
    }
  }

  onDeleteProfile() {
    if (confirm('Está seguro que quiere eliminar el perfil? Esta acción no se puede deshacer.')) {
      this.authService.deleteUserProfile().subscribe({
        next: () => {
          console.log('Profile deleted successfully');
          this.authService.logout();
          this.router.navigate(['/register']); 
        },
        error: error => {
          console.error('Error deleting profile', error);
        }
      });
    }
  }

  onImageError() {
    this.userPhotoUrl = 'http://localhost:3000/uploads/Profile_avatar_placeholder.png';
  }
}
