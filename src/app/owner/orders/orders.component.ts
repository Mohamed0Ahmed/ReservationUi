import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '../../core/services/order.service';
import { MenuService } from '../../core/services/menu.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Order, Item } from '../../interface/interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnDestroy {
  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  items = signal<Item[]>([]);
  showPendingOnly = signal(false);
  showModal = signal(false);
  modalAction = signal<'reject'>('reject');
  selectedOrderId = signal<number | null>(null);
  rejectionReason = signal('');
  storeId = signal<number | null>(null);
  totalOrders = signal<number>(0);
  private subscription: Subscription | null = null;

  constructor(
    private orderService: OrderService,
    private menuService: MenuService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.storeId.set(parseInt(this.authService.getStoreId() || '0'));
    this.loadOrders();
    this.loadTotalOrdersCount();
    this.loadItems();

    this.subscription = this.notificationService.notification$.subscribe(
      (message) => {
        if (message) {
          this.loadOrders();
        }
      }
    );
  }

  loadOrders() {
    if (!this.storeId()) return;
    this.orderService.getOrders(this.storeId()!).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.orders.set(res.data);
          this.filterOrders();
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
          this.filterOrders();
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء تحميل الطلبات المعلقة');
      },
    });
  }

  loadTotalOrdersCount() {
    if (!this.storeId()) return;
    this.orderService.getTotalOrdersCount(this.storeId()!).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.totalOrders.set(res.data);
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء تحميل عدد الطلبات');
      },
    });
  }

  loadItems() {
    if (!this.storeId()) return;
    this.menuService.getCategories().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const categories = res.data;
          let allItems: Item[] = [];
          let loadedCategories = 0;
          categories.forEach((category) => {
            this.menuService.getItems(category.id).subscribe({
              next: (itemRes) => {
                if (itemRes.isSuccess && itemRes.data) {
                  allItems = allItems.concat(itemRes.data);
                }
                loadedCategories++;
                if (loadedCategories === categories.length) {
                  this.items.set(allItems);
                }
              },
              error: () => {
                loadedCategories++;
                if (loadedCategories === categories.length) {
                  this.items.set(allItems);
                }
              },
            });
          });
        }
      },
      error: () => {
        this.toastr.error('حدث خطأ أثناء تحميل الأصناف');
      },
    });
  }

  toggleShowPendingOnly() {
    this.showPendingOnly.update((v) => !v);
    if (this.showPendingOnly()) {
      this.loadPendingOrders();
    } else {
      this.loadOrders();
    }
  }

  filterOrders() {
    this.filteredOrders.set(this.orders());
  }

  openModal(action: 'reject', orderId: number) {
    this.modalAction.set(action);
    this.showModal.set(true);
    this.selectedOrderId.set(orderId);
    this.rejectionReason.set('');
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedOrderId.set(null);
    this.rejectionReason.set('');
    this.modalAction.set('reject');
  }

  approveOrder(orderId: number) {
    this.orderService.approveOrder(orderId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.loadOrders();
          this.toastr.success(res.message);
        } else {
          this.toastr.error(res.message);
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  rejectOrder() {
    const orderId = this.selectedOrderId();
    const reason = this.rejectionReason();

    if (!orderId || !reason) {
      this.toastr.error('سبب الرفض مطلوب');
      return;
    }

    this.orderService.rejectOrder(orderId, reason).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.loadOrders();
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
