import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Assistance } from '../../interface/interfaces';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { AssistanceService } from '../../core/services/Assistance.service';

@Component({
  selector: 'app-assistance',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './assistance.component.html',
})
export class AssistanceComponent {
  assistanceTypes = signal<Assistance[]>([]);
  deletedAssistanceTypes = signal<Assistance[]>([]);
  showDeleted = signal(false);
  showModal = signal(false);
  modalAction = signal<'add' | 'edit' | 'delete' | 'restore'>('add');
  selectedAssistanceId = signal<number | null>(null);
  newAssistanceName = signal('');
  storeId = signal<number | null>(null);

  constructor(
    private assistanceService: AssistanceService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.storeId.set(parseInt(this.authService.getStoreId() || '0'));
    this.loadAssistanceTypes();
  }

  loadAssistanceTypes() {
    if (!this.storeId()) return;
    this.assistanceService.getAllAssistanceTypes(this.storeId()!).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.assistanceTypes.set(res.data);
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء تحميل أنواع المساعدة');
      },
    });
  }

  loadDeletedAssistanceTypes() {
    if (!this.storeId()) return;
    this.assistanceService
      .getAllDeletedAssistanceTypes(this.storeId()!)
      .subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.deletedAssistanceTypes.set(
              res.data.filter((assistance) =>
                this.isCustomAssistance(assistance)
              )
            );
          }
        },
        error: () => {
          this.toastr.error('حدث خطأ أثناء تحميل أنواع المساعدة المحذوفة');
        },
      });
  }

  toggleShowDeleted() {
    this.showDeleted.update((v) => !v);
    if (this.showDeleted() && this.deletedAssistanceTypes().length === 0) {
      this.loadDeletedAssistanceTypes();
    }
  }

  openModal(
    action: 'add' | 'edit' | 'delete' | 'restore',
    assistanceId?: number
  ) {
    this.modalAction.set(action);
    this.showModal.set(true);
    this.selectedAssistanceId.set(assistanceId ?? null);

    if (action === 'edit' && assistanceId != null) {
      const assistanceList = this.showDeleted()
        ? this.deletedAssistanceTypes()
        : this.assistanceTypes();
      const assistance = assistanceList.find((a) => a.id === assistanceId);
      if (assistance) {
        this.newAssistanceName.set(assistance.name);
      }
    } else {
      this.newAssistanceName.set('');
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.newAssistanceName.set('');
    this.selectedAssistanceId.set(null);
    this.modalAction.set('add');
  }

  saveAssistance() {
    const name = this.newAssistanceName();
    const action = this.modalAction();
    const assistanceId = this.selectedAssistanceId();

    if (!name && action !== 'delete' && action !== 'restore') {
      return;
    }

    if (!this.storeId()) return;

    let request: Observable<any>;
    if (action === 'add') {
      request = this.assistanceService.createAssistanceType(
        this.storeId()!,
        name
      );
    } else if (action === 'edit' && assistanceId != null) {
      request = this.assistanceService.updateAssistanceType(assistanceId, name);
    } else {
      this.closeModal();
      return;
    }

    request.subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.loadAssistanceTypes();
          if (this.showDeleted()) this.loadDeletedAssistanceTypes();
          this.toastr.success(res.message || 'تمت العملية بنجاح');
          this.closeModal();
        } else {
          this.toastr.error(res.message || 'فشل العملية');
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  confirmAction() {
    const action = this.modalAction();
    const assistanceId = this.selectedAssistanceId();

    if (!assistanceId) return;

    let request: Observable<any>;
    if (action === 'delete') {
      request = this.assistanceService.deleteAssistanceType(assistanceId);
    } else if (action === 'restore') {
      request = this.assistanceService.restoreAssistanceType(assistanceId);
    } else {
      this.closeModal();
      return;
    }

    request.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.loadAssistanceTypes();
          this.loadDeletedAssistanceTypes();
          this.toastr.success(res.message || 'تمت العملية بنجاح');
          this.closeModal();
        } else {
          this.toastr.error(res.message || 'فشل العملية');
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء العملية');
      },
    });
  }

  isCustomAssistance(assistance: Assistance): boolean {
    return assistance.id > 0 && !this.isDefaultAssistance(assistance);
  }

  isDefaultAssistance(assistance: Assistance): boolean {
    return assistance.id < 999;
  }
}
