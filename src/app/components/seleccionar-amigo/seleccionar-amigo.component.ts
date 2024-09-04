import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AmigoService } from '../../services/amigo.service';
import { debounceTime, switchMap, of } from 'rxjs';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-seleccionar-amigo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seleccionar-amigo.component.html',
  styleUrl: './seleccionar-amigo.component.scss'
})
export class SeleccionarAmigoComponent implements OnInit {
  searchControl = new FormControl('');
  searchResults: User[] = [];
  selectedFriends: User[] = [];
  @Output() amigosSeleccionados = new EventEmitter<User[]>();

  constructor(private amigoService: AmigoService) { }

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          this.searchResults = [];
          return of([]);
        } else {
          return this.amigoService.getFriends().pipe(
            switchMap(friends => {
              const filteredFriends = friends.filter(friend => friend.name.toLowerCase().includes(query.toLowerCase()));
              return of(filteredFriends);
            })
          );
        }
      })
    ).subscribe((results: User[]) => {
      this.searchResults = results;
    });
  }

  addFriend(amigo: User) {
    if (!this.selectedFriends.some(f => f.id_user === amigo.id_user)) {
      this.selectedFriends.push(amigo);
      this.emitSelectedFriends();
      this.clearSearch();
    }
  }

  removeFriend(amigo: User) {
    this.selectedFriends = this.selectedFriends.filter(f => f.id_user !== amigo.id_user);
    this.emitSelectedFriends();
  }

  emitSelectedFriends() {
    this.amigosSeleccionados.emit(this.selectedFriends);
  }

  clearSearch() {
    this.searchControl.setValue(''); 
  }
}
