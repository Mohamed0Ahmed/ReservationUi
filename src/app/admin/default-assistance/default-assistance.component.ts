import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AssistanceService } from '../../core/services/Assistance.service';
import { CommonModule } from '@angular/common';
import { Assistance } from '../../interface/interfaces';

@Component({
  selector: 'app-default-assistance',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './default-assistance.component.html',
  styleUrls: ['./default-assistance.component.css'],
})
export class DefaultAssistanceComponent {
  activeAssistanceTypes = signal<Assistance[]>([]);
  deletedAssistanceTypes = signal<Assistance[]>([]);
  showDeleted = signal(false);
  modalError = signal('');
  showModal = signal(false);
  modalAction = signal<'add' | 'edit' | 'delete' | 'restore'>('add');
  selectedAssistanceId = signal<number | null>(null);
  newAssistanceName = signal('');

  constructor(
    private assistanceService: AssistanceService,
    private toastr: ToastrService
  ) {
    this.loadAssistanceTypes();
  }

  loadAssistanceTypes() {
    this.assistanceService.getDefaultAssistanceTypes().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.activeAssistanceTypes.set(res.data);
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء تحميل أنواع المساعدة، حاول مرة أخرى');
      },
    });
  }

  loadDeletedAssistanceTypes() {
    this.assistanceService.getDefaultDeletedAssistanceTypes().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.deletedAssistanceTypes.set(res.data);
        }
      },
      error: () => {
        this.toastr.error(
          'حدث خطأ أثناء تحميل أنواع المساعدة المحذوفة، حاول مرة أخرى'
        );
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
    this.modalError.set('');

    if (action === 'edit' && assistanceId != null) {
      const assistance = this.showDeleted()
        ? this.deletedAssistanceTypes().find((a) => a.id === assistanceId)
        : this.activeAssistanceTypes().find((a) => a.id === assistanceId);
      if (assistance) {
        this.newAssistanceName.set(assistance.name);
      }
    } else {
      this.newAssistanceName.set('');
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.modalError.set('');
    this.newAssistanceName.set('');
    this.selectedAssistanceId.set(null);
    this.modalAction.set('add');
  }

  saveAssistance() {
    const name = this.newAssistanceName();
    const action = this.modalAction();
    const assistanceId = this.selectedAssistanceId();

    if (!name) {
      this.modalError.set('اسم المساعدة مطلوب');
      return;
    }

    const request =
      action === 'add'
        ? this.assistanceService.createDefaultAssistanceType({ Name: name })
        : this.assistanceService.updateDefaultAssistanceType(assistanceId!, {
            Name: name,
          });

    request.subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.loadAssistanceTypes();
          this.toastr.success(res.message || 'تمت العملية بنجاح');
          this.closeModal();
        } else {
          this.modalError.set(res.message || 'فشل العملية');
          this.toastr.error(res.message || 'فشل العملية، حاول مرة أخرى');
        }
      },
      error: () => {
        this.modalError.set('حدث خطأ أثناء الحفظ، حاول مرة أخرى');
        this.toastr.error('حدث خطأ أثناء الحفظ');
      },
    });
  }

  confirmAction() {
    const action = this.modalAction();
    const assistanceId = this.selectedAssistanceId();

    if (!assistanceId) return;

    const request =
      action === 'delete'
        ? this.assistanceService.deleteDefaultAssistanceType(assistanceId)
        : this.assistanceService.restoreDefaultAssistanceType(assistanceId);

    request.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          if (action === 'delete') {
            this.activeAssistanceTypes.update((types) =>
              types.filter((a) => a.id !== assistanceId)
            );
            this.loadDeletedAssistanceTypes();
          } else {
            this.deletedAssistanceTypes.update((types) =>
              types.filter((a) => a.id !== assistanceId)
            );
            this.loadAssistanceTypes();
          }
          this.toastr.success(res.message || 'تمت العملية بنجاح');
          this.closeModal();
        } else {
          this.modalError.set(res.message || 'فشل العملية');
          this.toastr.error(res.message || 'فشل العملية، حاول مرة أخرى');
        }
      },
      error: () => {
        this.modalError.set('حدث خطأ أثناء العملية، حاول مرة أخرى');
        this.toastr.error('حدث خطأ أثناء العملية');
      },
    });
  }
}
