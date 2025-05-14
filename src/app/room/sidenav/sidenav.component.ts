import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { RequestService } from '../../core/services/request.service';
import { ToastrService } from 'ngx-toastr';
import { Assistance } from '../../interface/interfaces';
import { AssistanceService } from '../../core/services/Assistance.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent implements OnInit {
  assistances: Assistance[] = [];
  selectedAssistance?: Assistance;
  showConfirmModal = false;

  constructor(
    private assistanceService: AssistanceService,
    private authService: AuthService,
    private requestService: RequestService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadAssistances();
  }

  loadAssistances() {
    this.assistanceService.getDefaultAssistanceTypes().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.assistances = response.data;
          console.log('Loaded assistances:', this.assistances);
        } else {
          this.toastr.error(
            response.message || 'فشل تحميل أنواع المساعدة',
            'خطأ'
          );
        }
      },
      error: (err) => {
        console.error('Failed to load assistances:', err);
        this.toastr.error('فشل تحميل أنواع المساعدة', 'خطأ');
      },
    });
  }

  confirmRequest(assistance: Assistance) {
    this.selectedAssistance = assistance;
    this.showConfirmModal = true;
  }

  proceedWithRequest() {
    if (!this.selectedAssistance) return;

    const roomId = parseInt(this.authService.getRoomId() || '0');
    if (!roomId) {
      this.toastr.error('لم يتم العثور على معرف الغرفة', 'خطأ');
      return;
    }

    this.requestService
      .createAssistanceRequest({
        roomId,
        requestTypeId: this.selectedAssistance.id,
      })
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastr.success('تم إرسال طلب المساعدة بنجاح', 'نجاح');
          } else {
            this.toastr.error(
              response.message || 'فشل إرسال طلب المساعدة',
              'خطأ'
            );
          }
        },
        error: (err) => {
          console.error('Failed to send assistance request:', err);
          this.toastr.error('فشل إرسال طلب المساعدة', 'خطأ');
        },
      });

    this.showConfirmModal = false;
    this.selectedAssistance = undefined;
  }

  cancelRequest() {
    this.showConfirmModal = false;
    this.selectedAssistance = undefined;
  }
}
