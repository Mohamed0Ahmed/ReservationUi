import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { GiftDto, ApiResponse } from '../../interface/interfaces';
import { AuthService } from '../../core/services/auth.service';
import { GiftService } from '../../core/services/gift.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gift',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './gift.component.html',
  styleUrls: ['./gift.component.css'],
})
export class GiftComponent {
  gifts = signal<GiftDto[]>([]);
  deletedGifts = signal<GiftDto[]>([]);
  showDeleted = signal(false);
  showModal = signal(false);
  modalAction = signal<'add' | 'edit' | 'delete' | 'restore'>('add');
  selectedGiftId = signal<number | null>(null);
  newGiftName = signal('');
  newGiftPoints = signal<number | null>(null);
  storeId = signal<number | null>(null);

  constructor(
    private giftService: GiftService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.storeId.set(parseInt(this.authService.getStoreId() || '0'));
    this.loadGifts();
  }

  loadGifts() {
    if (!this.storeId()) {
      this.toastr.error('معرف المتجر غير موجود');
      return;
    }

    this.giftService.getAllGifts().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.gifts.set(res.data);
          console.log(res);

        }
      },
      error: (error) => {
        this.toastr.error('حدث خطأ أثناء تحميل الهدايا');
      }
    });
  }

  loadDeletedGifts() {
    if (!this.storeId()) {
      this.toastr.error('معرف المتجر غير موجود');
      return;
    }
    this.giftService.getAllDeletedGifts().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.deletedGifts.set(res.data);
        }
      },
      error: (error) => {
        this.toastr.error('حدث خطأ أثناء تحميل الهدايا المحذوفة');
      }
    });
  }

  toggleShowDeleted() {
    this.showDeleted.update((v) => !v);
    if (this.showDeleted() && this.deletedGifts().length === 0) {
      this.loadDeletedGifts();
    }
  }

  openModal(action: 'add' | 'edit' | 'delete' | 'restore', giftId?: number) {
    this.modalAction.set(action);
    this.showModal.set(true);
    this.selectedGiftId.set(giftId ?? null);

    if (action === 'edit' && giftId != null) {
      const giftList = this.showDeleted() ? this.deletedGifts() : this.gifts();
      const gift = giftList.find((g) => g.id === giftId);
      if (gift) {
        this.newGiftName.set(gift.name);
        this.newGiftPoints.set(gift.pointsRequired);
      }
    } else {
      this.newGiftName.set('');
      this.newGiftPoints.set(null);
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.newGiftName.set('');
    this.newGiftPoints.set(null);
    this.selectedGiftId.set(null);
    this.modalAction.set('add');
  }

  saveGift() {
    const name = this.newGiftName();
    const points = this.newGiftPoints();
    const action = this.modalAction();
    const giftId = this.selectedGiftId();

    if (!name || points == null || points < 0) {
      this.toastr.error(
        'يرجى إدخال اسم الهدية والنقاط المطلوبة (يجب ألا تكون سالبة)'
      );
      return;
    }

    if (!this.storeId()) {
      this.toastr.error('معرف المتجر غير موجود');
      return;
    }

    let request: Observable<ApiResponse<GiftDto>>;
    if (action === 'add') {
      request = this.giftService.createGift(name, points);
    } else if (action === 'edit' && giftId != null) {
      request = this.giftService.updateGift(giftId, name, points);
    } else {
      this.closeModal();
      return;
    }

    request.subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.loadGifts();
          if (this.showDeleted()) this.loadDeletedGifts();
          this.toastr.success(res.message || 'تمت العملية بنجاح');
          this.closeModal();
        } else {
          this.toastr.error(res.message || 'فشل العملية');
        }
      },
      error: (err) =>
        this.toastr.error(err.message || 'تحقق من الانترنت الخاص بك'),
    });
  }

  confirmAction() {
    const action = this.modalAction();
    const giftId = this.selectedGiftId();

    if (!giftId) {
      this.toastr.error('معرف الهدية غير موجود');
      return;
    }

    let request: Observable<ApiResponse<boolean>>;
    if (action === 'delete') {
      request = this.giftService.deleteGift(giftId);
    } else if (action === 'restore') {
      request = this.giftService.restoreGift(giftId);
    } else {
      this.closeModal();
      return;
    }

    request.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          if (action === 'restore') {
            this.deletedGifts.set(
              this.deletedGifts().filter((g) => g.id !== giftId)
            );
          }
          this.loadGifts();
          this.loadDeletedGifts();
          setTimeout(() => {
            if (this.deletedGifts().length === 0 && this.showDeleted()) {
              this.loadDeletedGifts();
            }
          }, 0);
          this.toastr.success(res.message || 'تمت العملية بنجاح');
          this.closeModal();
        } else {
          this.toastr.error(res.message || 'فشل العملية');
        }
      },
      error: (err) => this.toastr.error(err.message || 'حدث خطأ أثناء العملية'),
    });
  }
}
