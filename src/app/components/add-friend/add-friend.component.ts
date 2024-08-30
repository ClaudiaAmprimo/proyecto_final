import { Component, OnInit } from '@angular/core';
import { AmigoService } from '../../services/amigo.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, switchMap } from 'rxjs/operators';
import { User } from '../../interfaces/user';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-add-friend',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.scss']
})
export class AddFriendComponent implements OnInit{
  searchControl = new FormControl('');
  searchResults: User[] = [];
  friendsList: User[] = [];
  currentUser: User | null = null;
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | 'warning' = 'success';

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

  addFriend(amigo_id: number) {
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

  removeFriend(amigo_id: number) {
    this.amigoService.removeFriend(amigo_id).subscribe({
      next: () => {
        this.loadFriends();
        this.alertService.showAlert('Amigo eliminado con éxito', 'warning');
      },
      error: (error) => {
        console.error('Error al eliminar amigo:', error);
        this.alertService.showAlert('Hubo un problema al eliminar al amigo. Intenta de nuevo.', 'danger');
      }
    });
  }
}
