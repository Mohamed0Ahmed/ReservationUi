import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { MenuService } from '../../core/services/menu.service';
import { CustomerService } from '../../core/services/customer.service';
import { OrderService } from '../../core/services/order.service';
import { Category, Item, ApiResponse } from '../../interface/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  categories = signal<Category[]>([]);
  items = signal<Item[]>([]);
  selectedCategory = signal<number | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  cart = signal<
    { menuItemId: number; quantity: number; name: string; price: number }[]
  >([]);
  showCartModal = signal<boolean>(false);
  showLoginModal = signal<boolean>(false);
  phoneNumber = signal<string>('');
  storeId: number;
  roomId: number;

  constructor(
    private menuService: MenuService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.storeId = this.authService.getStoreId()
      ? parseInt(this.authService.getStoreId()!)
      : 0;
    this.roomId = this.authService.getRoomId()
      ? parseInt(this.authService.getRoomId()!)
      : 0;
  }

  ngOnInit(): void {
    if (!this.storeId || !this.roomId) {
      this.toastr.error('فشل تحميل بيانات الغرفة، سجل دخول مرة أخرى', 'خطأ');
      this.authService.logout();
      return;
    }
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);
    this.menuService.getCategories().subscribe({
      next: (response: ApiResponse<Category[]>) => {
        if (response.isSuccess && response.data) {
          this.categories.set(response.data);
          this.loadAllItems();
        } else {
          this.error.set(response.message || 'فشل تحميل الأقسام');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('خطأ في الاتصال بالخادم');
        this.loading.set(false);
      },
    });
  }

  loadAllItems(): void {
    const allItems: Item[] = [];
    const categories = this.categories();
    if (!categories.length) return;

    let loadedCategories = 0;
    categories.forEach((category) => {
      this.menuService.getItems(category.id).subscribe({
        next: (response: ApiResponse<Item[]>) => {
          if (response.isSuccess && response.data) {
            allItems.push(...response.data);
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

  selectCategory(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
  }

  getFilteredItems(): Item[] {
    const selectedCategoryId = this.selectedCategory();
    if (!selectedCategoryId) return this.items();
    return this.items().filter(
      (item) => item.categoryId === selectedCategoryId
    );
  }

  addToCart(item: Item): void {
    const currentCart = this.cart();
    const cartItem = currentCart.find(
      (cartItem) => cartItem.menuItemId === item.id
    );
    if (cartItem) {
      cartItem.quantity++;
      this.cart.set([...currentCart]);
    } else {
      this.cart.set([
        ...currentCart,
        {
          menuItemId: item.id,
          quantity: 1,
          name: item.name,
          price: item.price,
        },
      ]);
    }
  }

  openCartModal(): void {
    this.showCartModal.set(true);
  }

  closeCartModal(): void {
    this.showCartModal.set(false);
  }

  openLoginModal(): void {
    this.showLoginModal.set(true);
    this.showCartModal.set(false);
  }

  closeLoginModal(): void {
    this.showLoginModal.set(false);
    this.showCartModal.set(true);
  }

  updateQuantity(itemId: number, change: number): void {
    const currentCart = this.cart();
    const cartItem = currentCart.find(
      (cartItem) => cartItem.menuItemId === itemId
    );
    if (cartItem) {
      cartItem.quantity = Math.max(1, cartItem.quantity + change);
      this.cart.set([...currentCart]);
    }
  }

  removeItem(itemId: number): void {
    const currentCart = this.cart();
    this.cart.set(
      currentCart.filter((cartItem) => cartItem.menuItemId !== itemId)
    );
  }

  clearCart(): void {
    this.cart.set([]);
    this.showCartModal.set(false);
  }

  submitLogin(): void {
    if (!this.phoneNumber().trim()) {
      this.toastr.error('يرجى إدخال رقم التليفون', 'خطأ');
      return;
    }
    this.customerService
      .loginCustomer(this.phoneNumber(), this.storeId)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.submitOrder();
          } else {
            this.toastr.error(response.message || 'فشل تسجيل الدخول', 'خطأ');
          }
        },
        error: () => {
          this.toastr.error('خطأ في الاتصال بالخادم', 'خطأ');
        },
      });
  }

  submitOrder(): void {
    const cartItems = this.cart();
    if (!cartItems.length) {
      this.toastr.error('لا توجد طلبات لإرسالها', 'خطأ');
      return;
    }
    this.orderService
      .createOrder(this.phoneNumber(), this.roomId, cartItems)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.toastr.success('تم إرسال الطلب بنجاح', 'نجاح');
            this.clearCart();
            this.closeLoginModal();
          } else {
            this.toastr.error(response.message || 'فشل إرسال الطلب', 'خطأ');
            this.showLoginModal.set(true);
          }
        },
        error: () => {
          this.toastr.error('خطأ في الاتصال بالخادم', 'خطأ');
          this.showLoginModal.set(true);
        },
      });
  }

  getTotalAmount(): number {
    return this.cart().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }
}
