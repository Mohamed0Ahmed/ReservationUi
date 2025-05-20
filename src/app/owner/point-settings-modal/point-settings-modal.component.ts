import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PointSettingsService } from '../../core/services/point-setting.service';

@Component({
  selector: 'app-point-settings-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './point-settings-modal.component.html',
  styleUrls: ['./point-settings-modal.component.css'],
})
export class PointSettingsModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  amount: number = 0;
  points: number = 0;
  settingId: number | null = null;
  isEditing: boolean = false;

  constructor(
    private pointSettingsService: PointSettingsService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadPointSettings();
  }

  loadPointSettings() {
    this.pointSettingsService.getPointSettings().subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          const setting = response.data[0];
          this.settingId = setting.id;
          this.amount = setting.amount;
          this.points = setting.points;
          this.isEditing = true;
        } else {
          this.isEditing = false;
          this.amount = 0;
          this.points = 0;
          console.log('No point settings found, ready to create new.');
        }
      },
      error: () => this.toastr.error('تحقق من الانترنت الخاص بك'),
    });
  }

  save() {
    if (this.amount <= 0 || this.points <= 0) {
      this.toastr.error('القيم يجب أن تكون أكبر من صفر', 'خطأ');
      return;
    }

    if (this.isEditing && this.settingId) {
      this.pointSettingsService
        .updatePointSetting(this.settingId, this.amount, this.points)
        .subscribe({
          next: () => {
            this.toastr.success('تم تعديل إعدادات النقاط بنجاح', 'نجاح');
            this.closeModal();
          },
          error: () => {
            this.toastr.error('فشل تعديل إعدادات النقاط', 'خطأ');
          },
        });
    } else {
      this.pointSettingsService
        .createPointSetting(this.amount, this.points)
        .subscribe({
          next: () => {
            this.toastr.success('تم إضافة إعدادات النقاط بنجاح', 'نجاح');
            this.closeModal();
          },
          error: (err) => {
            console.error('Failed to create point settings:', err);
            if (
              err.status === 201 &&
              err.error.message === 'بالفعل لديك نظام للنقاط'
            ) {
              this.toastr.error(
                'لديك بالفعل نظام نقاط، يمكنك تعديله فقط',
                'خطأ'
              );
              this.loadPointSettings();
            } else {
              this.toastr.error('فشل إضافة إعدادات النقاط', 'خطأ');
            }
          },
        });
    }
  }

  closeModal() {
    this.close.emit();
  }
}
