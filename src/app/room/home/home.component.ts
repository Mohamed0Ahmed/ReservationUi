import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { MenuService } from '../../core/services/menu.service';
import { CustomerService } from '../../core/services/customer.service';
import { OrderService } from '../../core/services/order.service';
import {
  Category,
  Item,
  ApiResponse,
  GiftDto,
  Customer,
} from '../../interface/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { Router } from '@angular/router';
import { GiftRedemptionService } from '../../core/services/giftRedem.service';
import { CreateGiftRedemptionDto } from '../../interface/DTOs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CarouselModule, SidenavComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  categories = signal<Category[]>([]);
  items = signal<Item[]>([]);
  gifts = signal<GiftDto[]>([]);
  error = signal<string | null>(null);
  cart = signal<
    { menuItemId: number; quantity: number; name: string; price: number }[]
  >([]);
  showCartModal = signal<boolean>(false);
  showLoginModal = signal<boolean>(false);
  showPointsModal = signal<boolean>(false);
  phoneNumber = signal<string>('');
  pointsPhoneNumber = signal<string>('');
  points = signal<number | null>(null);
  pointsError = signal<string | null>(null);
  storeId: number;
  roomId: number;
  sortOption = signal<'price-desc' | 'price-asc'>('price-desc');
  viewMode = signal<'byCategory' | 'allItems'>('byCategory');
  currentTab = signal<'orders' | 'gifts'>('orders');
  selectedGift = signal<GiftDto | null>(null);

  carouselOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: ['<', '>'],
    items: 1,
    nav: true,
    autoWidth: false,
    rtl: true,
  };

  constructor(
    private menuService: MenuService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private giftRedemptionService: GiftRedemptionService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
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
      this.router.navigate(['/room/login']);
      return;
    }
    this.loadCategories();
    this.loadGifts();
  }

  setTab(tab: 'orders' | 'gifts') {
    this.currentTab.set(tab);
  }

  loadCategories(): void {
    this.error.set(null);
    this.menuService.getCategories().subscribe({
      next: (response: ApiResponse<Category[]>) => {
        if (response.isSuccess && response.data) {
          this.categories.set(response.data);
          this.loadAllItems();
        } else {
          this.error.set(response.message || 'فشل تحميل الأقسام');
        }
      },
      error: () => this.toastr.error('تحقق من الانترنت الخاص بك'),
    });
  }

  loadAllItems(): void {
    const allItems: Item[] = [];
    const categories = this.categories();
    if (!categories.length) {
      this.items.set([]);
      return;
    }
    let loadedCategories = 0;
    categories.forEach((category) => {
      this.menuService.getItems(category.id).subscribe({
        next: (response: ApiResponse<Item[]>) => {
          if (response.isSuccess && response.data) {
            allItems.push(
              ...response.data.map((item) => ({
                ...item,
                categoryId: category.id,
                categoryName: category.name,
              }))
            );
          }
          loadedCategories++;
          if (loadedCategories === categories.length) {
            this.sortAndSetItems(allItems);
          }
        },
        error: () => {
          loadedCategories++;
          if (loadedCategories === categories.length) {
            this.sortAndSetItems(allItems);
          }
        },
      });
    });
  }

  loadGifts(): void {
    this.giftRedemptionService.getAvailableGifts(this.storeId).subscribe({
      next: (response: ApiResponse<GiftDto[]>) => {
        if (response.isSuccess && response.data) {
          this.gifts.set(response.data);
        } else {
          this.toastr.error(response.message || 'فشل تحميل الهدايا');
        }
      },
      error: () => this.toastr.error('تحقق من الانترنت الخاص بك'),
    });
  }

  sortAndSetItems(items: Item[]): void {
    let sortedItems: Item[] = [];
    if (this.viewMode() === 'byCategory') {
      const categories = this.categories();
      categories.forEach((category) => {
        const categoryItems = items
          .filter((item) => item.categoryId === category.id)
          .sort((a, b) => {
            return this.sortOption() === 'price-desc'
              ? b.price - a.price
              : a.price - b.price;
          });
        sortedItems.push(...categoryItems);
      });
    } else {
      sortedItems = [...items].sort((a, b) => {
        return this.sortOption() === 'price-desc'
          ? b.price - a.price
          : a.price - b.price;
      });
    }
    this.items.set(sortedItems);
  }

  sortItems(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sortOption.set(selectElement.value as 'price-desc' | 'price-asc');
    this.sortAndSetItems(this.items());
  }

  toggleView(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.viewMode.set(selectElement.value as 'byCategory' | 'allItems');
    this.sortAndSetItems(this.items());
  }

  getItemChunks(): {
    groups?: { categoryId: number; categoryName: string; items: Item[] }[];
    items?: Item[];
  }[] {
    const chunks: {
      groups?: { categoryId: number; categoryName: string; items: Item[] }[];
      items?: Item[];
    }[] = [];

    if (this.viewMode() === 'byCategory') {
      let currentChunk: {
        categoryId: number;
        categoryName: string;
        items: Item[];
      }[] = [];
      let currentCount = 0;
      let itemIndex = 0;
      const allItems = this.items();

      while (itemIndex < allItems.length) {
        const item = allItems[itemIndex];
        const category = this.categories().find(
          (cat) => cat.id === item.categoryId
        );
        if (!category) {
          itemIndex++;
          continue;
        }

        let currentGroup = currentChunk.find(
          (group) => group.categoryId === item.categoryId
        );
        if (!currentGroup) {
          currentGroup = {
            categoryId: item.categoryId,
            categoryName: category.name || '',
            items: [],
          };
          currentChunk.push(currentGroup);
        }

        if (currentCount < 12) {
          currentGroup.items.push(item);
          currentCount++;
          itemIndex++;
        } else {
          chunks.push({ groups: [...currentChunk] });
          currentChunk = [
            {
              categoryId: item.categoryId,
              categoryName: category.name || '',
              items: [],
            },
          ];
          currentCount = 0;
        }
      }

      if (currentChunk.length > 0 && currentCount > 0) {
        chunks.push({ groups: [...currentChunk] });
      }
    } else {
      const allItems = this.items();
      for (let i = 0; i < allItems.length; i += 12) {
        chunks.push({ items: allItems.slice(i, i + 12) });
      }
    }

    return chunks;
  }

  getGiftChunks(): GiftDto[][] {
    const chunks: GiftDto[][] = [];
    const allGifts = this.gifts();
    for (let i = 0; i < allGifts.length; i += 12) {
      chunks.push(allGifts.slice(i, i + 12));
    }
    return chunks;
  }

  addToCart(item: Item): void {
    const currentCart = this.cart();
    const cartItem = currentCart.find(
      (cartItem) => cartItem.menuItemId === item.id
    );
    if (cartItem) {
      cartItem.quantity++;
      this.cart.set([...currentCart]);
      this.toastr.success('تم إضافة الصنف إلى السلة');
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
      this.toastr.success('تم إضافة الصنف إلى السلة');
    }
  }

  requestGift(gift: GiftDto): void {
    this.selectedGift.set(gift);
    this.openLoginModal();
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
    if (this.currentTab() === 'orders') {
      this.showCartModal.set(true);
    }
    this.selectedGift.set(null);
  }

  openPointsModal(): void {
    this.showPointsModal.set(true);
    this.pointsPhoneNumber.set('');
    this.points.set(null);
    this.pointsError.set(null);
  }

  closePointsModal(): void {
    this.showPointsModal.set(false);
    this.pointsPhoneNumber.set('');
    this.points.set(null);
    this.pointsError.set(null);
  }

  checkPoints(): void {
    const phone = this.pointsPhoneNumber().trim();
    const egyptianPhoneRegex = /^(010|011|012|015)[0-9]{8}$/;

    if (!phone) {
      this.pointsError.set('يرجى إدخال رقم التليفون');
      return;
    }

    if (!egyptianPhoneRegex.test(phone)) {
      this.pointsError.set('من فضلك أدخل رقم تليفون صحيح');
      return;
    }

    this.customerService.loginCustomer(phone, this.storeId).subscribe({
      next: (response: ApiResponse<Customer>) => {
        if (response.isSuccess && response.data) {
          this.points.set(response.data.points);
          this.pointsError.set(null);
        } else {
          this.pointsError.set(response.message || 'رقم التليفون غير موجود');
          this.points.set(null);
        }
      },
      error: () => {
        this.pointsError.set('تحقق من الانترنت الخاص بك');
        this.points.set(null);
      },
    });
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
    this.toastr.success('تم إزالة الصنف من السلة');
  }

  clearCart(): void {
    this.cart.set([]);
    this.showCartModal.set(false);
  }

  submitLogin(): void {
    const phone = this.phoneNumber().trim();
    const egyptianPhoneRegex = /^(010|011|012|015)[0-9]{8}$/;

    if (!phone) {
      this.toastr.error('يرجى إدخال رقم التليفون', 'خطأ');
      return;
    }

    if (!egyptianPhoneRegex.test(phone)) {
      this.toastr.error('من فضلك أدخل رقم تليفون صحيح', 'خطأ');
      return;
    }

    this.customerService.loginCustomer(phone, this.storeId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          if (this.currentTab() === 'orders') {
            this.submitOrder();
          } else if (this.currentTab() === 'gifts' && this.selectedGift()) {
            this.submitGiftRedemption();
          }
        } else {
          this.toastr.error(response.message || 'فشل تسجيل الدخول', 'خطأ');
        }
      },
      error: () => this.toastr.error('تحقق من الانترنت الخاص بك'),
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
            this.closeCartModal();
          } else {
            this.toastr.error('فشل إرسال الطلب', 'خطأ');
            this.showLoginModal.set(true);
          }
        },
        error: () => {
          this.toastr.error('تحقق من الانترنت الخاص بك');
          this.showLoginModal.set(true);
        },
      });
  }

  submitGiftRedemption(): void {
    const gift = this.selectedGift();
    if (!gift) {
      this.toastr.error('لم يتم اختيار هدية', 'خطأ');
      return;
    }
    const dto: CreateGiftRedemptionDto = {
      giftId: gift.id!,
      customerNumber: this.phoneNumber(),
      roomId: this.roomId,
    };
    this.giftRedemptionService.requestGiftRedemption(dto).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.toastr.success('تم إرسال طلب الهدية بنجاح', 'نجاح');
          this.closeLoginModal();
          this.selectedGift.set(null);
        } else {
          this.toastr.error(response.message || 'فشل إرسال طلب الهدية', 'خطأ');
          this.showLoginModal.set(true);
        }
      },
      error: () => {
        this.toastr.error('تحقق من الانترنت الخاص بك');
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
