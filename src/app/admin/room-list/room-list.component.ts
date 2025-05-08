import { Component, signal, computed } from '@angular/core';
import { RoomService } from '../../core/services/room.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Room } from '../../interface/interfaces';
import { CreateRoomRequest, UpdateRoomRequest } from '../../interface/DTOs';
import { debounceTime } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-rooms-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
})
export class RoomListComponent {
  activeRooms = signal<Room[]>([]);
  deletedRooms = signal<Room[]>([]);
  searchQuery = signal('');
  showDeleted = signal(false);
  storeName = signal<string | null>(null);
  modalError = signal('');
  showModal = signal(false);
  modalAction = signal<'add' | 'edit' | 'delete' | 'restore'>('add');
  selectedRoomId = signal<number | null>(null);
  newRoom = signal<{ username: string; password: string }>({
    username: '',
    password: '',
  });
  storeId: number;
  private searchSubject = new Subject<string>();

  filteredRooms = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const roomsToFilter = this.showDeleted()
      ? this.deletedRooms()
      : this.activeRooms();
    return roomsToFilter.filter((room) =>
      room.username.toLowerCase().includes(query)
    );
  });

  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.storeId = Number(this.route.snapshot.queryParamMap.get('storeId'));
    this.storeName.set(
      this.route.snapshot.queryParamMap.get('storeName') || null
    );
    this.loadRooms();
    this.loadDeletedRooms();
    this.searchSubject.pipe(debounceTime(300)).subscribe((query) => {
      this.searchQuery.set(query);
    });
  }

  loadRooms() {
    if (this.storeId) {
      this.roomService.getRooms(this.storeId).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.activeRooms.set(res.data);
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطأ أثناء تحميل الغرف، حاول مرة أخرى');
        },
      });
    }
  }

  loadDeletedRooms() {
    if (this.storeId) {
      this.roomService.getDeletedRooms(this.storeId).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.deletedRooms.set(res.data);
          }
        },
        error: (err) => {
          this.toastr.error(
            'حدث خطأ أثناء تحميل الغرف المحذوفة، حاول مرة أخرى'
          );
        },
      });
    }
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  toggleShowDeleted() {
    this.showDeleted.update((v) => !v);
    if (
      this.showDeleted() &&
      this.deletedRooms().length === 0 &&
      this.storeId
    ) {
      this.loadDeletedRooms();
    }
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchSubject.next('');
  }

  openModal(action: 'add' | 'edit' | 'delete' | 'restore', roomId?: number) {
    this.modalAction.set(action);
    this.showModal.set(true);
    this.selectedRoomId.set(roomId ?? null);
    this.modalError.set('');

    if (action === 'edit' && roomId != null) {
      const room = this.showDeleted()
        ? this.deletedRooms().find((r) => r.id === roomId)
        : this.activeRooms().find((r) => r.id === roomId);
      if (room) {
        this.newRoom.set({ username: room.username, password: room.password });
      }
    } else {
      this.newRoom.set({ username: '', password: '' });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.modalError.set('');
    this.newRoom.set({ username: '', password: '' });
    this.selectedRoomId.set(null);
    this.modalAction.set('add');
  }

  saveRoom() {
    const roomData = this.newRoom();
    const action = this.modalAction();
    const roomId = this.selectedRoomId();

    if (!roomData.username || !roomData.password) {
      this.modalError.set('جميع الحقول مطلوبة');
      return;
    }

    const request: CreateRoomRequest | UpdateRoomRequest =
      action === 'add'
        ? {
            storeId: this.storeId,
            username: roomData.username,
            password: roomData.password,
          }
        : { username: roomData.username, password: roomData.password };

    const apiCall =
      action === 'add'
        ? this.roomService.createRoom(request as CreateRoomRequest)
        : this.roomService.updateRoom(roomId!, request as UpdateRoomRequest);

    apiCall.subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.loadRooms();
          this.toastr.success(res.message);
          this.closeModal();
        } else {
          this.modalError.set(res.message);
          this.toastr.error(res.message);
        }
      },
      error: (err) => {
        this.modalError.set('حدث خطأ أثناء الحفظ، حاول مرة أخرى');
        this.toastr.error('حدث خطأ أثناء الحفظ');
      },
    });
  }

  confirmAction() {
    const action = this.modalAction();
    const roomId = this.selectedRoomId();

    if (!roomId) return;

    const request =
      action === 'delete'
        ? this.roomService.deleteRoom(roomId)
        : this.roomService.restoreRoom(roomId);

    request.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          if (action === 'delete') {
            const room = this.activeRooms().find((r) => r.id === roomId);
            if (room) {
              this.activeRooms.set(
                this.activeRooms().filter((r) => r.id !== roomId)
              );
              if (this.showDeleted()) this.loadDeletedRooms();
            }
          } else {
            const room = this.deletedRooms().find((r) => r.id === roomId);
            if (room) {
              this.deletedRooms.set(
                this.deletedRooms().filter((r) => r.id !== roomId)
              );
              this.loadRooms();
            }
          }
          this.toastr.success(res.message);
          this.closeModal();
        } else {
          this.modalError.set(res.message);
          this.toastr.error(res.message);
        }
      },
      error: (err) => {
        this.modalError.set('حدث خطأ أثناء العملية، حاول مرة أخرى');
        this.toastr.error('حدث خطأ أثناء العملية');
      },
    });
  }
}
