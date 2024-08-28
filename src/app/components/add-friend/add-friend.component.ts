import { Component } from '@angular/core';
import { AmigoService } from '../../services/amigo.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, switchMap } from 'rxjs/operators';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-add-friend',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.scss']
})
export class AddFriendComponent {
  searchControl = new FormControl('');
  searchResults: User[] = [];
  friendsList: User[] = [];

  constructor(private amigoService: AmigoService) { }

  ngOnInit() {
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
      this.searchResults = results;
    });

    this.loadFriends();
  }

  loadFriends() {
    this.amigoService.getFriends().subscribe((friends: User[]) => {
      console.log('Amigos cargados:', friends);
      this.friendsList = friends;
    });
  }

  addFriend(amigo_id: number) {
    this.amigoService.addFriend(amigo_id).subscribe(() => {
      this.loadFriends();
      this.searchControl.setValue('');
    });
  }

  removeFriend(amigo_id: number) {
    this.amigoService.removeFriend(amigo_id).subscribe(() => {
      this.loadFriends();
    });
  }
}
