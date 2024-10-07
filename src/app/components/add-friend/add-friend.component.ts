import { Component, OnInit, ViewChild } from '@angular/core';
import { AmigoService } from '../../services/amigo.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, switchMap } from 'rxjs/operators';
import { User } from '../../interfaces/user';
import { AlertService } from '../../services/alert.service';
import { ConfirmModalComponent } from '../shared/confirm-modal/confirm-modal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-add-friend',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.scss']
})
export class AddFriendComponent implements OnInit{
  public baseUrl: string = environment.endpoint;
  
  searchControl = new FormControl('');
  searchResults: User[] = [];
  friendsList: User[] = [];
  currentUser: User | null = null;
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | 'warning' = 'success';
  friendIdToDelete: number | null = null;

  @ViewChild('confirmModal') confirmModal!: ConfirmModalComponent;

  constructor(private amigoService: AmigoService, private alertService: AlertService) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadFriends();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          this.searchResults = [];
          return [];
        } else {
          return this.amigoService.searchUsers(query);
        }
      })
    ).subscribe((results: User[]) => {
      this.searchResults = results.filter(user =>
        user.id_user !== this.currentUser?.id_user &&
        !this.friendsList.some(friend => friend.id_user === user.id_user)
      );
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

  loadCurrentUser() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
    }
  }

  loadFriends() {
    this.amigoService.getFriends().subscribe((friends: User[]) => {
      console.log('Amigos cargados:', friends);
      this.friendsList = friends;
    });
  }

  addFriend(amigo_id: number): void {
    this.amigoService.addFriend(amigo_id).subscribe({
      next: () => {
        this.loadFriends();
        this.searchControl.setValue('');
        this.alertService.showAlert('Amigo agregado con éxito', 'success');
      },
      error: (error) => {
        console.error('Error al agregar amigo:', error);
        this.alertService.showAlert('Hubo un problema al agregar al amigo. Intenta de nuevo.', 'danger');
      }
    });
  }

  removeFriend(amigo_id: number): void {
    this.friendIdToDelete = amigo_id;
    this.confirmModal.openModal();
  }

  onConfirmDelete(): void {
    if (this.friendIdToDelete !== null) {
      this.amigoService.removeFriend(this.friendIdToDelete).subscribe({
        next: () => {
          this.loadFriends();
          this.alertService.showAlert('Amigo eliminado con éxito', 'danger');
        },
        error: (error) => {
          console.error('Error al eliminar amigo:', error);
          this.alertService.showAlert('Hubo un problema al eliminar al amigo. Intenta de nuevo.', 'danger');
        }
      });
    }
    this.friendIdToDelete = null;
  }

  onCancelDelete(): void {
    this.friendIdToDelete = null;
  }
}
