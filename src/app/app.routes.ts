import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AddEditEventComponent } from './components/add-edit-event/add-edit-event.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { FullCalendarComponent } from './components/full-calendar/full-calendar.component';
import { GraficosComponent } from './components/graficos/graficos.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { RegisterComponent } from './components/register/register.component';
import { EventComponent } from './components/event/event.component';
import { ViajeComponent } from './components/viaje/viaje.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddFriendComponent } from './components/add-friend/add-friend.component';
import { PerfilComponent } from './components/perfil/perfil.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]  },
  { path: 'viaje', component: ViajeComponent, canActivate: [AuthGuard] },
  { path: 'event', component: EventComponent, canActivate: [AuthGuard] },
  { path: 'add', component: AddEditEventComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: AddEditEventComponent, canActivate: [AuthGuard] },
  { path: 'map', component: MapaComponent, canActivate: [AuthGuard] },
  { path: 'calendar', component: FullCalendarComponent, canActivate: [AuthGuard] },
  { path: 'chart', component: GraficosComponent, canActivate: [AuthGuard] },
  { path: 'amigos', component: AddFriendComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full'}
];
