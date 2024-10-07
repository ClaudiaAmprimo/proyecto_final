import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { Event } from '../interfaces/event.ts';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl: string;
  private eventUrl: string;

  private eventChangeSubject = new BehaviorSubject<void>(undefined);
  eventChanges$ = this.eventChangeSubject.asObservable();

  constructor(private http: HttpClient){
    this.baseUrl = environment.endpoint;
    this.eventUrl = 'event/'
  }

  notifyEventChanges() {
    this.eventChangeSubject.next();
  }

  getListEvents(): Observable<Event[]> {
    return this.http.get<{ data: Event[] }>(`${this.baseUrl}${this.eventUrl}`).pipe(
      map(response => response.data.map(event => ({
        ...event,
        fecha_inicio: new Date(event.fecha_inicio ?? ''),
        fecha_fin: new Date(event.fecha_fin ?? ''),
        created_at: new Date(event.created_at ?? ''),
        updated_at: new Date(event.updated_at ?? '')
      })))
    );
  }

  getEventsByViaje(viajeId: number): Observable<Event[]> {
    return this.http.get<{ data: Event[] }>(`${this.baseUrl}${this.eventUrl}viaje/${viajeId}`).pipe(
      map(response => response.data.map(event => ({
        ...event,
        fecha_inicio: new Date(event.fecha_inicio ?? ''),
        fecha_fin: new Date(event.fecha_fin ?? ''),
        created_at: new Date(event.created_at ?? ''),
        updated_at: new Date(event.updated_at ?? '')
      })))
    );
  }

  getCalendarEvents(): Observable<any[]> {
    return this.getListEvents().pipe(
      map(events => events.map(event => ({
        title: event.titulo,
        start: event.fecha_inicio,
        end: event.fecha_fin
      })))
    );
  }

  deleteEvent(id_event: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${this.eventUrl}${id_event}`).pipe(
      map(() => {
        this.notifyEventChanges();
      })
    );
  }


  createEvent(event: Event): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}${this.eventUrl}`, event).pipe(
      map(() => {
        this.notifyEventChanges();
      })
    );
  }

  getEvent(id_event: number): Observable<Event>{
    return this.http.get<{ data: Event }>(`${this.baseUrl}${this.eventUrl}${id_event}`).pipe(
      map(response => {
        const event = response.data;
        return {
          ...event,
          fecha_inicio: new Date(event.fecha_inicio ?? ''),
          fecha_fin: new Date(event.fecha_fin ?? ''),
          created_at: new Date(event.created_at ?? ''),
          updated_at: new Date(event.updated_at ?? '')
        };
      })
    );
  }

  updateEvent(id_event: number, event: Partial<Event>): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}${this.eventUrl}${id_event}`, event).pipe(
      map(() => {
        this.notifyEventChanges();
      })
    );
  }

  getUserViajes(): Observable<any> {
    return this.http.get(`${this.baseUrl}viaje`);
  }
}
