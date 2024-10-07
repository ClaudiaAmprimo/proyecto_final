import { Injectable } from '@angular/core';
import { LngLatLike, Map } from 'mapbox-gl';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Event as CustomEvent } from '../interfaces/event.ts';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private map?: Map;
  private baseUrl: string = environment.endpoint;

  constructor(private http: HttpClient) { }

  get isMapReady(){
    return !!this.map
  }

  setMap(map: Map){
    this.map = map;
  }

  getMap(): Map | undefined {
    return this.map;
  }

  flyTo(coords: LngLatLike){
    if(!this.isMapReady) throw new Error("El mapa no está inicializado");

    this.map?.flyTo({
      zoom: 14,
      center: coords
    });
  }

  geocodeLocation(location: string): Observable<[number, number]> {
    return this.http.get<{ features: any[] }>(`${this.baseUrl}mapbox/geocode`, { params: { location } }).pipe(
      map(response => {
        const features = response.features;
        if (features && features.length > 0) {
          const [lng, lat] = features[0].center;
          return [lng, lat] as [number, number];
        } else {
          throw new Error('Location not found');
        }
      })
    );
  }
}
