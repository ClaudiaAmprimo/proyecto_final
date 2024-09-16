import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AddEditEventComponent } from './components/add-edit-event/add-edit-event.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { FullCalendarComponent } from './components/full-calendar/full-calendar.component';
import { GraficosComponent } from './components/graficos/graficos.component';
import { MapaComponent } from './components/mapa-screen/mapa.component';
import { RegisterComponent } from './components/register/register.component';
import { EventComponent } from './components/event/event.component';
import { ViajeComponent } from './components/viaje/viaje.component';
import { AddFriendComponent } from './components/add-friend/add-friend.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { AddEditViajeComponent } from './components/add-edit-viaje/add-edit-viaje.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'viaje', component: ViajeComponent, canActivate: [AuthGuard] },
  { path: 'add-viaje', component: AddEditViajeComponent, canActivate: [AuthGuard] },
  { path: 'edit-viaje/:id', component: AddEditViajeComponent, canActivate: [AuthGuard] },
  { path: 'event/:id_viaje', component: EventComponent, canActivate: [AuthGuard] },
  { path: 'add/:id_viaje', component: AddEditEventComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id/:id_viaje', component: AddEditEventComponent, canActivate: [AuthGuard] },
  { path: 'map', component: MapaComponent, canActivate: [AuthGuard] },
  { path: 'calendar', component: FullCalendarComponent, canActivate: [AuthGuard] },
  { path: 'chart', component: GraficosComponent, canActivate: [AuthGuard] },
  { path: 'amigos', component: AddFriendComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full'}
];
