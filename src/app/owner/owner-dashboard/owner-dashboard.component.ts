import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OwnerNavbarComponent } from "../owner-navbar/owner-navbar.component";

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [RouterOutlet, OwnerNavbarComponent],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.css',
})
export class OwnerDashboardComponent {}
