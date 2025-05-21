import { Component, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
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
  GiftRedemptionDto,
} from '../../interface/interfaces';
import { Subscription } from 'rxjs';
import { AssistanceService } from '../../core/services/Assistance.service';
import { GiftRedemptionService } from '../../core/services/giftRedem.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnDestroy {
  orders = signal<Order[]>([]);
  items = signal<Item[]>([]);
  assistanceRequests = signal<RequestDto[]>([]);
  redemptions = signal<GiftRedemptionDto[]>([]);
  assistanceTypes = signal<Assistance[]>([]);
  showModal = signal(false);
  modalAction = signal<'rejectOrder' | 'rejectAssistance' | 'rejectRedemption'>(
    'rejectOrder'
  );
  selectedId = signal<number | null>(null);
  rejectionReason = signal('');
  storeId = signal<number | null>(null);
  currentFilter = signal<'orders' | 'assistance' | 'redemptions'>('orders');
  orderView = signal<'pendingOrders' | 'allOrders'>('pendingOrders');
  assistanceView = signal<'pendingAssistance' | 'allAssistance'>(
    'pendingAssistance'
  );
  redemptionView = signal<'pendingRedemptions' | 'allRedemptions'>(
    'pendingRedemptions'
  );
  activeTab = signal<{ [key: number]: 'details' | 'items' }>({});

  filteredOrders = computed(() => {
    const allOrders = this.orders();
    if (this.orderView() === 'pendingOrders') {
      return allOrders.filter((order) => order.status === 0);
    }
    return allOrders;
  });

  filteredAssistanceRequests = computed(() => {
    const allRequests = this.assistanceRequests();
    if (this.assistanceView() === 'pendingAssistance') {
      return allRequests.filter((req) => req.status === 0);
    }
    return allRequests;
  });

  filteredRedemptions = computed(() => {
    const allRedemptions = this.redemptions();
    if (this.redemptionView() === 'pendingRedemptions') {
      return allRedemptions.filter((redemption) => redemption.status === 0);
    }
    return allRedemptions;
  });

  totalOrders = computed(() => {
    return this.filteredOrders().length;
  });

  totalAssistanceRequests = computed(() => {
    return this.filteredAssistanceRequests().length;
  });

  totalRedemptions = computed(() => {
    return this.filteredRedemptions().length;
  });

  pendingOrdersCount = computed(
    () => this.orders().filter((order) => order.status === 0).length
  );

  pendingAssistanceCount = computed(
    () => this.assistanceRequests().filter((req) => req.status === 0).length
  );

  pendingRedemptionsCount = computed(
    () =>
      this.redemptions().filter((redemption) => redemption.status === 0).length
  );

  private subscription: Subscription | null = null;

  constructor(
    private orderService: OrderService,
    private menuService: MenuService,
    private assistanceService: AssistanceService,
    private requestService: RequestService,
    private giftRedemptionService: GiftRedemptionService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.storeId.set(parseInt(this.authService.getStoreId() || '0'));
    this.loadPendingOrders();
    this.loadItems();
    this.loadAssistanceTypes();
    this.loadPendingAssistanceRequests();
    this.loadPendingRedemptions();

    this.subscription = this.notificationService.notification$.subscribe(
      (message) => {
        if (message) {
          this.refreshData(message);
        }
      }
    );
  }

  setActiveTab(id: number, tab: 'details' | 'items') {
    this.activeTab.update((tabs) => ({ ...tabs, [id]: tab }));
  }

  loadOrders() {
    if (!this.storeId()) return;
    this.orderService.getOrders(this.storeId()!).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.orders.set(res.data.reverse());
          const updatedTabs = { ...this.activeTab() };
          res.data.forEach((order) => {
            if (!updatedTabs[order.id]) {
              updatedTabs[order.id] = 'details';
            }
          });
          this.activeTab.set(updatedTabs);
        }
      },
      error: () => {
        this.toastr.error('تحقق من الانترنت الخاص بك');
      },
    });
  }

  loadPendingOrders() {
    if (!this.storeId()) return;
    this.orderService.getPendingOrders(this.storeId()!).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.orders.set(res.data);
          const updatedTabs = { ...this.activeTab() };
          res.data.forEach((order) => {
            if (!updatedTabs[order.id]) {
              updatedTabs[order.id] = 'details';
            }
          });
          this.activeTab.set(updatedTabs);
        }
      },
      error: () => {},
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
      error: () => {},
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
        error: () => {},
      });
  }

  loadRedemptions() {
    if (!this.storeId()) return;
    this.giftRedemptionService.getAllRedemptions().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.redemptions.set(res.data.reverse());
        }
      },
      error: () => {
        this.toastr.error('تحقق من الانترنت الخاص بك');
      },
    });
  }

  loadPendingRedemptions() {
    if (!this.storeId()) return;
    this.giftRedemptionService.getPendingRedemptions().subscribe({
      next: (res) => {
        console.log(res);

        if (res.isSuccess && res.data) {
          this.redemptions.set(res.data);
        }
      },
      error: () => {},
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
      error: () => {},
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
      error: () => {},
    });
  }

  setFilter(filter: 'orders' | 'assistance' | 'redemptions') {
    this.currentFilter.set(filter);
    if (filter === 'orders') {
      this.orderView() === 'pendingOrders'
        ? this.loadPendingOrders()
        : this.loadOrders();
    } else if (filter === 'assistance') {
      this.assistanceView() === 'pendingAssistance'
        ? this.loadPendingAssistanceRequests()
        : this.loadAssistanceRequests();
    } else {
      this.redemptionView() === 'pendingRedemptions'
        ? this.loadPendingRedemptions()
        : this.loadRedemptions();
    }
  }

  toggleView(
    view:
      | 'pendingOrders'
      | 'allOrders'
      | 'pendingAssistance'
      | 'allAssistance'
      | 'pendingRedemptions'
      | 'allRedemptions'
  ) {
    if (view === 'pendingOrders' || view === 'allOrders') {
      this.orderView.set(view);
      view === 'pendingOrders' ? this.loadPendingOrders() : this.loadOrders();
    } else if (view === 'pendingAssistance' || view === 'allAssistance') {
      this.assistanceView.set(view);
      view === 'pendingAssistance'
        ? this.loadPendingAssistanceRequests()
        : this.loadAssistanceRequests();
    } else {
      this.redemptionView.set(view);
      view === 'pendingRedemptions'
        ? this.loadPendingRedemptions()
        : this.loadRedemptions();
    }
  }

  refreshData(message: string) {
    if (message.includes('طلب جديد') && this.currentFilter() === 'orders') {
      this.orderView() === 'pendingOrders'
        ? this.loadPendingOrders()
        : this.loadOrders();
    } else if (
      message.includes('طلب مساعدة') &&
      this.currentFilter() === 'assistance'
    ) {
      this.assistanceView() === 'pendingAssistance'
        ? this.loadPendingAssistanceRequests()
        : this.loadAssistanceRequests();
    } else if (
      (message.includes('طلب استبدال') || message === 'redemption_updated') &&
      this.currentFilter() === 'redemptions'
    ) {
      this.redemptionView() === 'pendingRedemptions'
        ? this.loadPendingRedemptions()
        : this.loadRedemptions();
    }
  }

  openModal(
    action: 'rejectOrder' | 'rejectAssistance' | 'rejectRedemption',
    id: number
  ) {
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
    this.selectedId.set(orderId);
    this.orderService.approveOrder(orderId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.orders.update((orders) => {
            return orders.map((order) => {
              if (order.id === orderId) {
                return { ...order, status: 1 };
              }
              return order;
            });
          });
          const pendingCount = this.pendingOrdersCount();
          if (pendingCount === 0) {
            this.loadPendingOrders();
          }
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
    this.selectedId.set(requestId);
    this.requestService.approveAssistanceRequest(requestId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.assistanceRequests.update((requests) => {
            return requests.map((req) => {
              if (req.id === requestId) {
                return { ...req, status: 1 };
              }
              return req;
            });
          });
          const pendingCount = this.pendingAssistanceCount();
          if (pendingCount === 0) {
            this.loadPendingAssistanceRequests();
          }
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

  approveRedemption(redemptionId: number) {
    this.selectedId.set(redemptionId);
    const dto = { isApproved: true, rejectionReason: '' };
    this.giftRedemptionService
      .updateRedemptionStatus(redemptionId, dto)
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.redemptions.update((redemptions) => {
              return redemptions.map((redemption) => {
                if (redemption.id === redemptionId) {
                  return { ...redemption, status: 1 };
                }
                return redemption;
              });
            });
            const pendingCount = this.pendingRedemptionsCount();
            if (pendingCount === 0) {
              this.loadPendingRedemptions();
            }
            this.toastr.success(
              res.message || 'تم الموافقة على طلب الاستبدال بنجاح'
            );
          } else {
            this.toastr.error(res.message || 'فشل العملية');
          }
        },
        error: () => {
          this.toastr.error('حدث خطأ أثناء الموافقة على طلب الاستبدال');
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

  rejectRedemption() {
    const redemptionId = this.selectedId();
    const reason = this.rejectionReason();
    if (!redemptionId || !reason) {
      this.toastr.error('سبب الرفض مطلوب');
      return;
    }
    const dto = { isApproved: false, rejectionReason: reason };
    this.giftRedemptionService
      .updateRedemptionStatus(redemptionId, dto)
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.refreshData('redemption_updated');
            this.toastr.success(res.message || 'تم رفض طلب الاستبدال بنجاح');
            this.closeModal();
          } else {
            this.toastr.error(res.message || 'فشل العملية');
          }
        },
        error: () => {
          this.toastr.error('حدث خطأ أثناء رفض طلب الاستبدال');
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

  trackByRedemption(_: number, redemption: GiftRedemptionDto): number {
    return redemption.id!;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
