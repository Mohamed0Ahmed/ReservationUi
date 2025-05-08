import { Component, signal, computed } from '@angular/core';
import { StoreService } from '../../core/services/store.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Store } from '../../interface/interfaces';
import { debounceTime } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css'],
})
export class StoreListComponent {
  activeStores = signal<Store[]>([]);
  deletedStores = signal<Store[]>([]);
  searchQuery = signal('');
  showDeleted = signal(false);
  modalError = signal('');
  showModal = signal(false);
  modalAction = signal<'add' | 'edit' | 'delete' | 'restore'>('add');
  selectedStoreId = signal<number | null>(null);
  newStore = signal<{ name: string; ownerEmail: string }>({
    name: '',
    ownerEmail: '',
  });
  private searchSubject = new Subject<string>();

  filteredStores = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const storesToFilter = this.showDeleted()
      ? this.deletedStores()
      : this.activeStores();
    return storesToFilter.filter((store) =>
      store.name.toLowerCase().includes(query)
    );
  });

  constructor(
    private storeService: StoreService,
    private toastr: ToastrService
  ) {
    this.loadStores();
    this.loadDeletedStores();
    this.searchSubject.pipe(debounceTime(300)).subscribe((query) => {
      this.searchQuery.set(query);
    });
  }

  loadStores() {
    this.storeService.getStores().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.activeStores.set(res.data);
        }
      },
      error: (err) => {
        this.toastr.error('حدث خطأ أثناء تحميل المتاجر، حاول مرة أخرى');
      },
    });
  }

  loadDeletedStores() {
    this.storeService.getDeletedStores().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.deletedStores.set(res.data);
        }
      },
      error: (err) => {
        this.toastr.error(
          'حدث خطأ أثناء تحميل المتاجر المحذوفة، حاول مرة أخرى'
        );
      },
    });
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  toggleShowDeleted() {
    this.showDeleted.update((v) => !v);
    if (this.showDeleted() && this.deletedStores().length === 0) {
      this.loadDeletedStores();
    }
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchSubject.next('');
  }

  openModal(action: 'add' | 'edit' | 'delete' | 'restore', storeId?: number) {
    this.modalAction.set(action);
    this.showModal.set(true);
    this.selectedStoreId.set(storeId ?? null);
    this.modalError.set('');

    if (action === 'edit' && storeId != null) {
      const store = this.showDeleted()
        ? this.deletedStores().find((s) => s.id === storeId)
        : this.activeStores().find((s) => s.id === storeId);
      if (store) {
        this.newStore.set({ name: store.name, ownerEmail: store.ownerEmail });
      }
    } else {
      this.newStore.set({ name: '', ownerEmail: '' });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.modalError.set('');
    this.newStore.set({ name: '', ownerEmail: '' });
    this.selectedStoreId.set(null);
    this.modalAction.set('add');
  }

  saveStore() {
    const storeData = this.newStore();
    const action = this.modalAction();
    const storeId = this.selectedStoreId();

    if (!storeData.name || !storeData.ownerEmail) {
      this.modalError.set('جميع الحقول مطلوبة');
      return;
    }

    const request =
      action === 'add'
        ? this.storeService.createStore(storeData)
        : this.storeService.updateStore(storeId!, storeData);

    request.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.loadStores();
          this.toastr.success(res.message );
          this.closeModal();
        } else {
          this.modalError.set(res.message );
          this.toastr.error(res.message );
        }
      },
      error: (err) => {
        this.modalError.set('حدث خطأ أثناء الحفظ، حاول مرة أخرى');
        this.toastr.error('حدث خطأ أثناء الحفظ');
      },
    });
  }

  confirmAction() {
    const action = this.modalAction();
    const storeId = this.selectedStoreId();

    if (!storeId) return;

    const request =
      action === 'delete'
        ? this.storeService.deleteStore(storeId)
        : this.storeService.restoreStore(storeId);

    request.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          if (action === 'delete') {
            const store = this.activeStores().find((s) => s.id === storeId);
            if (store) {
              this.activeStores.set(
                this.activeStores().filter((s) => s.id !== storeId)
              );
              this.deletedStores.set([...this.deletedStores(), store]);
            }
          } else {
            const store = this.deletedStores().find((s) => s.id === storeId);
            if (store) {
              this.deletedStores.set(
                this.deletedStores().filter((s) => s.id !== storeId)
              );
              this.activeStores.set([...this.activeStores(), store]);
            }
          }
          this.loadStores();
          this.loadDeletedStores();
          this.toastr.success(res.message );
          this.closeModal();
        } else {
          this.modalError.set(res.message );
          this.toastr.error(res.message );
        }
      },
      error: (err) => {
        this.modalError.set('حدث خطأ أثناء العملية، حاول مرة أخرى');
        this.toastr.error('حدث خطأ أثناء العملية');
      },
    });
  }
}
