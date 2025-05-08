// room.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/enviroment';
import { ApiResponse, Room } from '../../interface/interfaces';
import { CreateRoomRequest, UpdateRoomRequest } from '../../interface/DTOs';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  getRooms(storeId: number): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(
      `${this.apiUrl}/store/${storeId}`
    );
  }

  getDeletedRooms(storeId: number): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(
      `${this.apiUrl}/store/deleted/${storeId}`
    );
  }

  createRoom(request: CreateRoomRequest): Observable<ApiResponse<Room>> {
    return this.http.post<ApiResponse<Room>>(this.apiUrl, request);
  }

  updateRoom(
    id: number,
    request: UpdateRoomRequest
  ): Observable<ApiResponse<Room>> {
    return this.http.put<ApiResponse<Room>>(`${this.apiUrl}/${id}`, request);
  }

  deleteRoom(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  restoreRoom(id: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiUrl}/restore/${id}`,
      {}
    );
  }
}
