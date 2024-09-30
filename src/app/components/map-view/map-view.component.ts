import { AfterViewInit, Component } from '@angular/core';
import { PlacesService } from '../../services/places.service';
import { HttpClient } from '@angular/common/http';
import mapboxgl, { LngLatBounds, Marker, Popup } from 'mapbox-gl';
import { MapService } from '../../services/map.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../interfaces/event.ts';

@Component({
  selector: 'app-map-view',
  standalone: true,
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements AfterViewInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  selectedCategories: string[] = ['Hospedaje', 'Transporte', 'Turismo', 'Comida'];

  constructor(
    private http: HttpClient,
    private placesService: PlacesService,
    private mapService: MapService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.placesService.useLocation) {
      console.error("No user location available");
      return;
    }

    this.initializeMap();
    this.loadEvents();
  }

  initializeMap() {
    this.http.get<{ token: string }>('http://localhost:3000/mapbox/token').subscribe({
      next: (response) => {
        mapboxgl.accessToken = response.token;

        const map = new mapboxgl.Map({
          container: 'map-view',
          style: 'mapbox://styles/mapbox/streets-v11',
          center: this.placesService.useLocation as [number, number],
          zoom: 14
        });

        const popup = new Popup().setHTML(`
          <h6>Aquí estoy</h6>
          <span>Estoy en este lugar del mundo</span>
        `);

        new Marker({ color: 'red' })
          .setLngLat(this.placesService.useLocation as [number, number])
          .setPopup(popup)
          .addTo(map);

        this.mapService.setMap(map);
      },
      error: (err) => {
        console.error('Error al obtener el token de Mapbox:', err);
      }
    });
  }

  loadEvents() {
    this.eventService.getListEvents().subscribe(events => {
      this.events = events;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredEvents = this.events.filter(event =>
      this.selectedCategories.includes(event.categoria)
    );
    this.addEventMarkers();
  }

  addEventMarkers() {
    if (!this.mapService.isMapReady) return;

    const bounds = new LngLatBounds();

    this.filteredEvents.forEach(event => {
      if (event.ubicacion) {
        this.mapService.geocodeLocation(event.ubicacion).subscribe({
          next: ([lng, lat]) => {
            const popup = new Popup().setHTML(`
              <h6>${event.titulo}</h6>
              <span>${event.ubicacion}</span>
            `);

            const map = this.mapService.getMap();
            if (map) {
              new Marker({ color: 'blue' })
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map);

              bounds.extend([lng, lat]);
            }
          },
          error: (err) => {
            console.error(`Invalid coordinates for event ${event.titulo}: ${event.ubicacion}`, err);
          },
          complete: () => {
            const map = this.mapService.getMap();
            if (map && !bounds.isEmpty()) {
              map.fitBounds(bounds, { padding: 50 });
            }
          }
        });
      }
    });

    const map = this.mapService.getMap();
    if (map && !bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50 });
    }
  }

  onCategorySelectionChange(event: any) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedCategories.push(checkbox.value);
    } else {
      this.selectedCategories = this.selectedCategories.filter(cat => cat !== checkbox.value);
    }
    this.applyFilters();
  }

  onCategoryChange(selectedCategories: string[]) {
    this.selectedCategories = selectedCategories;
    this.applyFilters();
  }
}
