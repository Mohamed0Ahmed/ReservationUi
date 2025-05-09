import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { Routes } from '@angular/router';
import { StoreListComponent } from './admin/store-list/store-list.component';
import { adminGuard } from './core/guards/admin.guard';
import { RoomListComponent } from './admin/room-list/room-list.component';
import { DefaultAssistanceComponent } from './admin/default-assistance/default-assistance.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'stores', pathMatch: 'full' },
      { path: 'stores', component: StoreListComponent },
      { path: 'rooms', component: RoomListComponent },
      { path: 'default-assistance', component: DefaultAssistanceComponent },
    ],
  },
  {
    path: 'owner',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'stores', pathMatch: 'full' },
      { path: 'stores', component: StoreListComponent },
      { path: 'rooms', component: StoreListComponent },
    ],
  },
];
