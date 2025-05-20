import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { ownerGuard } from './core/guards/owner.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'room',
    loadComponent: () =>
      import('./room/room-layout/room-layout.component').then(
        (m) => m.RoomLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./room/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./room/room-login/room-login.component').then(
            (m) => m.RoomLoginComponent
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    children: [
      { path: '', redirectTo: 'stores', pathMatch: 'full' },
      {
        path: 'stores',
        loadComponent: () =>
          import('./admin/store-list/store-list.component').then(
            (m) => m.StoreListComponent
          ),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./admin/room-list/room-list.component').then(
            (m) => m.RoomListComponent
          ),
      },
      {
        path: 'default-assistance',
        loadComponent: () =>
          import(
            './admin/default-assistance/default-assistance.component'
          ).then((m) => m.DefaultAssistanceComponent),
      },
    ],
  },
  {
    path: 'owner',
    loadComponent: () =>
      import('./owner/owner-dashboard/owner-dashboard.component').then(
        (m) => m.OwnerDashboardComponent
      ),
    canActivate: [ownerGuard],
    children: [
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
      {
        path: 'assistance',
        loadComponent: () =>
          import('./owner/assistance/assistance.component').then(
            (m) => m.AssistanceComponent
          ),
      },
      {
        path: 'category',
        loadComponent: () =>
          import('./owner/category/category.component').then(
            (m) => m.CategoryComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./owner/orders/orders.component').then(
            (m) => m.OrdersComponent
          ),
      },
      {
        path: 'gifts',
        loadComponent: () =>
          import('./owner/gift/gift.component').then((m) => m.GiftComponent),
      },
    ],
  },
];
