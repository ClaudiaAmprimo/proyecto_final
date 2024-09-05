import { Component, OnInit } from '@angular/core';
import { PlacesService } from '../../services/places.service';
import { LoadingComponent } from "../loading/loading.component";
import { MapViewComponent } from "../map-view/map-view.component";
import { ViewChild } from '@angular/core';
import { BtnMapLocationComponent } from '../btn-map-location/btn-map-location.component';
import { Event as CustomEvent } from '../../interfaces/event.ts';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [LoadingComponent, MapViewComponent, BtnMapLocationComponent],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss'
})

export class MapaComponent {
  selectedCategories: string[] = ['Hospedaje', 'Transporte', 'Turismo', 'Comida'];

  @ViewChild(MapViewComponent) mapViewComponent!: MapViewComponent;

  constructor(private placesService: PlacesService) {}

  get isUserLocationReady() {
    return this.placesService.isUserLocationReady;
  }

  onCategorySelectionChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedCategories.push(checkbox.value);
    } else {
      this.selectedCategories = this.selectedCategories.filter(cat => cat !== checkbox.value);
    }
    this.mapViewComponent.onCategoryChange(this.selectedCategories);
  }

  loadFilteredEvents(events: CustomEvent[]) {
    this.mapViewComponent.filteredEvents = events;
    this.mapViewComponent.applyFilters();
  }
}
