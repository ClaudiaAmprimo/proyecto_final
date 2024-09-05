import { Component } from '@angular/core';
import { MapService } from '../../services/map.service';
import { PlacesService } from '../../services/places.service';

@Component({
  selector: 'app-btn-map-location',
  standalone: true,
  imports: [],
  templateUrl: './btn-map-location.component.html',
  styleUrl: './btn-map-location.component.scss'
})
export class BtnMapLocationComponent {

  constructor( private mapService: MapService, private placesService: PlacesService){

  }

  goToMyLocation(){
    if (!this.placesService.isUserLocationReady) throw Error("No hay ubicacion de usuario")
    if (!this.mapService.isMapReady) throw Error("No hay mapa disponible")

    this.mapService.flyTo(this.placesService.useLocation!)
  }
}
