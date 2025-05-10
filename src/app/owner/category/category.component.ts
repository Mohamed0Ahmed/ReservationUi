import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../core/services/menu.service';
import { Category, Item } from '../../interface/interfaces';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UpdateMenuItemRequest } from '../../interface/DTOs';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];
  deletedCategories: Category[] = [];
  items: { [key: number]: Item[] } = {};
  deletedItems: { [key: number]: Item[] } = {};
  showDeleted = false;
  showItems: { [key: number]: boolean } = {};
  newCategoryName = '';
  editCategory: Category | null = null;
  newItem: Item = {
    id: 0,
    name: '',
    price: 0,
    pointsRequired: 0,
    categoryId: 0,
    storeId: 0,
  };
  editItem: Item | null = null;
  selectedCategoryId: number | null = null;

  constructor(
    private menuService: MenuService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.menuService.getCategories().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.categories = response.data;
          this.categories.forEach((cat) => {
            this.loadItems(cat.id);
            this.showItems[cat.id] = false;
          });
        } else {
          this.toastr.error(response.message || 'فشل في جلب الأقسام');
        }
      },
      error: () => this.toastr.error('فشل في جلب الأقسام'),
    });

    this.menuService.getDeletedCategories().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.deletedCategories = response.data;
        }
      },
      error: () => this.toastr.error('فشل في جلب الأقسام المحذوفة'),
    });
  }

  loadItems(categoryId: number): void {
    this.menuService.getItems(categoryId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.items[categoryId] = response.data;
        }
      },
      error: () => this.toastr.error('فشل في جلب الأصناف'),
    });
    this.menuService.getDeletedItems(categoryId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.deletedItems[categoryId] = response.data;
        }
      },
      error: () => this.toastr.error('فشل في جلب الأصناف المحذوفة'),
    });
  }

  toggleItems(categoryId: number): void {
    this.showItems[categoryId] = !this.showItems[categoryId];
  }

  createCategory(): void {
    if (!this.newCategoryName) {
      this.toastr.error('يرجى إدخال اسم القسم');
      return;
    }
    this.menuService.createCategory(this.newCategoryName).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.categories.push(response.data);
          this.showItems[response.data.id] = false;
          this.newCategoryName = '';
          this.toastr.success('تم إضافة القسم بنجاح');
        } else {
          this.toastr.error(response.message || 'فشل في إضافة القسم');
        }
      },
      error: () => this.toastr.error('فشل في إضافة القسم'),
    });
  }

  startEditCategory(category: Category): void {
    this.editCategory = { ...category };
  }

  updateCategory(): void {
    if (!this.editCategory || !this.editCategory.name) {
      this.toastr.error('يرجى إدخال اسم القسم');
      return;
    }
    this.menuService
      .updateCategory(this.editCategory.id, this.editCategory.name)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            const index = this.categories.findIndex(
              (cat) => cat.id === this.editCategory!.id
            );
            this.categories[index] = response.data;
            this.editCategory = null;
            this.toastr.success('تم تعديل القسم بنجاح');
          } else {
            this.toastr.error(response.message || 'فشل في تعديل القسم');
          }
        },
        error: () => this.toastr.error('فشل في تعديل القسم'),
      });
  }

  deleteCategory(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      this.menuService.deleteCategory(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.categories = this.categories.filter((cat) => cat.id !== id);
            this.loadCategories();
            this.toastr.success('تم حذف القسم بنجاح');
          } else {
            this.toastr.error(response.message || 'فشل في حذف القسم');
          }
        },
        error: () => this.toastr.error('فشل في حذف القسم'),
      });
    }
  }

  restoreCategory(id: number): void {
    if (confirm('هل أنت متأكد من استرجاع هذا القسم؟')) {
      this.menuService.restoreCategory(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.deletedCategories = this.deletedCategories.filter(
              (cat) => cat.id !== id
            );
            this.loadCategories();
            this.toastr.success('تم استرجاع القسم بنجاح');
          } else {
            this.toastr.error(response.message || 'فشل في استرجاع القسم');
          }
        },
        error: () => this.toastr.error('فشل في استرجاع القسم'),
      });
    }
  }

  createItem(categoryId: number): void {
    if (
      !this.newItem.name ||
      this.newItem.price <= 0 ||
      this.newItem.pointsRequired < 0
    ) {
      this.toastr.error('يرجى إدخال بيانات الصنف بشكل صحيح');
      return;
    }
    this.newItem.categoryId = categoryId;
    this.newItem.storeId = parseInt(this.menuService['getStoreId']() || '0');
    this.menuService.createItem(this.newItem).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.items[categoryId].push(response.data);
          this.newItem = {
            id: 0,
            name: '',
            price: 0,
            pointsRequired: 0,
            categoryId: 0,
            storeId: 0,
          };
          this.toastr.success('تم إضافة الصنف بنجاح');
        } else {
          this.toastr.error(response.message || 'فشل في إضافة الصنف');
        }
      },
      error: () => this.toastr.error('فشل في إضافة الصنف'),
    });
  }

  startEditItem(item: Item): void {
    this.editItem = { ...item };
    this.selectedCategoryId = item.categoryId;
  }

  updateItem(): void {
    if (
      !this.editItem ||
      !this.editItem.name ||
      this.editItem.price <= 0 ||
      this.editItem.pointsRequired < 0
    ) {
      this.toastr.error('يرجى إدخال بيانات الصنف بشكل صحيح');
      return;
    }
    const updateRequest: UpdateMenuItemRequest = {
      name: this.editItem.name,
      price: this.editItem.price,
      pointsRequired: this.editItem.pointsRequired,
    };
    this.menuService.updateItem(this.editItem.id, updateRequest).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          const categoryId = this.editItem!.categoryId;
          const index = this.items[categoryId].findIndex(
            (i) => i.id === this.editItem!.id
          );
          this.items[categoryId][index] = response.data;
          this.editItem = null;
          this.toastr.success('تم تعديل الصنف بنجاح');
        } else {
          this.toastr.error(response.message || 'فشل في تعديل الصنف');
        }
      },
      error: () => this.toastr.error('فشل في تعديل الصنف'),
    });
  }

  deleteItem(categoryId: number, id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      this.menuService.deleteItem(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.items[categoryId] = this.items[categoryId].filter(
              (i) => i.id !== id
            );
            this.loadItems(categoryId);
            this.toastr.success('تم حذف الصنف بنجاح');
          } else {
            this.toastr.error(response.message || 'فشل في حذف الصنف');
          }
        },
        error: () => this.toastr.error('فشل في حذف الصنف'),
      });
    }
  }

  restoreItem(categoryId: number, id: number): void {
    if (confirm('هل أنت متأكد من استرجاع هذا الصنف؟')) {
      this.menuService.restoreItem(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.deletedItems[categoryId] = this.deletedItems[
              categoryId
            ].filter((i) => i.id !== id);
            this.loadItems(categoryId);
            this.toastr.success('تم استرجاع الصنف بنجاح');
          } else {
            this.toastr.error(response.message || 'فشل في استرجاع الصنف');
          }
        },
        error: () => this.toastr.error('فشل في استرجاع الصنف'),
      });
    }
  }

  hardDeleteItem(categoryId: number, id: number): void {
    if (confirm('هل أنت متأكد من الحذف النهائي لهذا الصنف؟')) {
      this.menuService.HardDeleteItem(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.deletedItems[categoryId] = this.deletedItems[
              categoryId
            ].filter((i) => i.id !== id);
            this.toastr.success('تم الحذف النهائي للصنف بنجاح');
          } else {
            this.toastr.error(response.message || 'فشل في الحذف النهائي للصنف');
          }
        },
        error: () => this.toastr.error('فشل في الحذف النهائي للصنف'),
      });
    }
  }

  toggleDeleted(): void {
    this.showDeleted = !this.showDeleted;
  }
}
