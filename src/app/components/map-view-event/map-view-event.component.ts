import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { PlacesService } from '../../services/places.service';
import { HttpClient } from '@angular/common/http';
import mapboxgl, { LngLatBounds, Marker, Popup } from 'mapbox-gl';
import { MapService } from '../../services/map.service';
import { EventService } from '../../services/event.service';
import { Event as CustomEvent } from '../../interfaces/event.ts';
import { BtnMapLocationEventComponent } from "../btn-map-location-event/btn-map-location-event.component";
import { ActivatedRoute } from '@angular/router';
import { CurrentTripService } from '../../services/current-trip.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map-view-event',
  standalone: true,
  templateUrl: './map-view-event.component.html',
  styleUrl: './map-view-event.component.scss',
  imports: [BtnMapLocationEventComponent]
})
export class MapViewEventComponent implements OnInit, OnDestroy {
  public baseUrl: string = environment.endpoint;

  events: CustomEvent[] = [];
  filteredEvents: CustomEvent[] = [];
  selectedCategories: string[] = ['Hospedaje', 'Transporte', 'Turismo', 'Comida'];
  viajeId: number | null = null;
  markers: Marker[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private http: HttpClient,
    private placesService: PlacesService,
    private mapService: MapService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private currentTripService: CurrentTripService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.currentTripService.currentTripId$.subscribe((id) => {
        this.viajeId = id;
        this.loadEvents();
      })
    );

    this.placesService.getUserLocation().then(() => {
      if (!this.placesService.useLocation) {
        console.error("No user location available");
        return;
      }

      this.subscription.add(
        this.eventService.eventChanges$.subscribe(() => {
          this.loadEvents();
        })
      );

      this.initializeMap();
      this.loadEvents();
    }).catch((error) => {
      console.error("Error al obtener la ubicación del usuario:", error);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initializeMap() {
    this.http.get<{ token: string }>(`${this.baseUrl}mapbox/token`).subscribe({
      next: (response) => {
        mapboxgl.accessToken = response.token;

        const map = new mapboxgl.Map({
          container: 'map',
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
      this.events = this.viajeId ? events.filter(event => event.viaje_id === this.viajeId) : [];
      this.clearEventMarkers();
      this.applyFilters();
    });
  }

  clearEventMarkers() {
    if (!this.mapService.isMapReady) return;

    this.markers.forEach(marker => marker.remove());
    this.markers = [];
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
              const marker = new Marker({ color: 'blue' })
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map);

              this.markers.push(marker);
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
