import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { MenuService } from '../../core/services/menu.service';
import { Category, Item, ApiResponse } from '../../interface/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  categories = signal<Category[]>([]);
  items = signal<Item[]>([]);
  selectedCategory = signal<number | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
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
}
