import { Component, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '../../core/services/order.service';
import { MenuService } from '../../core/services/menu.service';
import { RequestService } from '../../core/services/request.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Order,
  Item,
  RequestDto,
  Assistance,
  OrderItem,
} from '../../interface/interfaces';
import { Subscription } from 'rxjs';
import { AssistanceService } from '../../core/services/Assistance.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnDestroy {
  orders = signal<Order[]>([]);
  items = signal<Item[]>([]);
  assistanceRequests = signal<RequestDto[]>([]);
  assistanceTypes = signal<Assistance[]>([]);
  showModal = signal(false);
  modalAction = signal<'rejectOrder' | 'rejectAssistance'>('rejectOrder');
  selectedId = signal<number | null>(null);
  rejectionReason = signal('');
  storeId = signal<number | null>(null);
  currentFilter = signal<
    'orders' | 'pendingOrders' | 'assistance' | 'assistancePending'
  >('pendingOrders');
  filteredOrders = computed(() => {
    if (this.currentFilter() === 'orders') {
      return this.orders();
    }
    return this.orders().filter((order) => order.status === 0);
  });
  filteredAssistanceRequests = computed(() => {
    if (this.currentFilter() === 'assistance') {
      return this.assistanceRequests();
    }
    return this.assistanceRequests().filter((req) => req.status === 0);
  });
  totalOrders = computed(() => this.orders().length);
  totalAssistanceRequests = computed(() => this.assistanceRequests().length);
  private subscription: Subscription | null = null;

  constructor(
    private orderService: OrderService,
    private menuService: MenuService,
    private assistanceService: AssistanceService,
    private requestService: RequestService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.storeId.set(parseInt(this.authService.getStoreId() || '0'));
    this.loadPendingOrders();
    this.loadItems();
    this.loadAssistanceTypes();
    this.loadPendingAssistanceRequests();

    this.subscription = this.notificationService.notification$.subscribe(
      (message) => {
        if (message) {
          this.refreshData(message);
        }
      }
    );
  }

  loadOrders() {
    if (!this.storeId()) return;
    this.orderService.getOrders(this.storeId()!).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.orders.set(res.data.reverse());
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء تحميل الطلبات');
      },
    });
  }

  loadPendingOrders() {
    if (!this.storeId()) return;
    this.orderService.getPendingOrders(this.storeId()!).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.orders.set(res.data);
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء تحميل الطلبات المعلقة');
      },
    });
  }

  loadAssistanceRequests() {
    if (!this.storeId()) return;
    this.requestService.getAllAssistanceRequests(this.storeId()!).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.assistanceRequests.set(res.data.reverse());
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء تحميل طلبات المساعدة');
      },
    });
  }

  loadPendingAssistanceRequests() {
    if (!this.storeId()) return;
    this.requestService
      .getPendingAssistanceRequests(this.storeId()!)
      .subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.assistanceRequests.set(res.data);
          }
        },
        error: () => {
          this.toastr.error('حدث خطأ أثناء تحميل طلبات المساعدة المعلقة');
        },
      });
  }

  loadItems() {
    if (!this.storeId()) return;
    this.menuService.getAllItems(this.storeId()!).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.items.set(res.data);
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء تحميل الأصناف');
      },
    });
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

  setFilter(
    filter: 'orders' | 'pendingOrders' | 'assistance' | 'assistancePending'
  ) {
    this.currentFilter.set(filter);
    if (filter === 'orders') {
      this.loadOrders();
    } else if (filter === 'pendingOrders') {
      this.loadPendingOrders();
    } else if (filter === 'assistance') {
      this.loadAssistanceRequests();
    } else {
      this.loadPendingAssistanceRequests();
    }
  }

  refreshData(message: string) {
    if (message.includes('طلب جديد')) {
      if (this.currentFilter() === 'orders') {
        this.loadOrders();
      } else if (this.currentFilter() === 'pendingOrders') {
        this.loadPendingOrders();
      }
    } else if (message.includes('طلب مساعدة')) {
      if (this.currentFilter() === 'assistance') {
        this.loadAssistanceRequests();
      } else if (this.currentFilter() === 'assistancePending') {
        this.loadPendingAssistanceRequests();
      }
    }
  }

  openModal(action: 'rejectOrder' | 'rejectAssistance', id: number) {
    this.modalAction.set(action);
    this.showModal.set(true);
    this.selectedId.set(id);
    this.rejectionReason.set('');
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedId.set(null);
    this.rejectionReason.set('');
    this.modalAction.set('rejectOrder');
  }

  approveOrder(orderId: number) {
    this.orderService.approveOrder(orderId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.refreshData('طلب جديد');
          this.toastr.success(res.message || 'تم الموافقة على الطلب بنجاح');
        } else {
          this.toastr.error(res.message || 'فشل العملية');
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء الموافقة على الطلب');
      },
    });
  }

  approveAssistanceRequest(requestId: number) {
    this.requestService.approveAssistanceRequest(requestId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.refreshData('طلب مساعدة');
          this.toastr.success(
            res.message || 'تم الموافقة على طلب المساعدة بنجاح'
          );
        } else {
          this.toastr.error(res.message || 'فشل العملية');
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء الموافقة على طلب المساعدة');
      },
    });
  }

  rejectOrder() {
    const orderId = this.selectedId();
    const reason = { reason: this.rejectionReason() };

    if (!orderId || !reason.reason) {
      this.toastr.error('سبب الرفض مطلوب');
      return;
    }

    this.orderService.rejectOrder(orderId, reason).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.refreshData('طلب جديد');
          this.toastr.success(res.message || 'تم رفض الطلب بنجاح');
          this.closeModal();
        } else {
          this.toastr.error(res.message || 'فشل العملية');
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء رفض الطلب');
      },
    });
  }

  rejectAssistanceRequest() {
    const requestId = this.selectedId();
    const reason = { reason: this.rejectionReason() };

    if (!requestId || !reason.reason) {
      this.toastr.error('سبب الرفض مطلوب');
      return;
    }

    this.requestService.rejectAssistanceRequest(requestId, reason).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.refreshData('طلب مساعدة');
          this.toastr.success(res.message || 'تم رفض طلب المساعدة بنجاح');
          this.closeModal();
        } else {
          this.toastr.error(res.message || 'فشل العملية');
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء رفض طلب المساعدة');
      },
    });
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'معلق';
      case 1:
        return 'مقبول';
      case 2:
        return 'مرفوض';
      default:
        return 'غير معروف';
    }
  }

  getItemName(menuItemId: number): string {
    const item = this.items().find((i) => i.id === menuItemId);
    return item ? item.name : 'غير معروف';
  }

  getAssistanceTypeName(requestTypeId: number): string {
    const type = this.assistanceTypes().find((t) => t.id === requestTypeId);
    return type ? type.name : 'غير معروف';
  }

  convertToEgyptTime(utcDate: string): string {
    const date = new Date(utcDate);
    date.setHours(date.getHours() + 3);
    const dayName = new Intl.DateTimeFormat('ar-EG', {
      timeZone: 'Africa/Cairo',
      weekday: 'long',
    }).format(date);
    const time = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Cairo',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
    return `${dayName} ${time}`;
  }

  trackByOrder(_: number, order: Order): number {
    return order.id;
  }

  trackByRequest(_: number, request: RequestDto): number {
    return request.roomId * 1000 + request.requestTypeId;
  }

  trackByItem(_: number, item: OrderItem): number {
    return item.menuItemId;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
