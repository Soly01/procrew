import { LocalStorageService } from './../../../../services/localstorage.service';
import { SearchFilterPipe } from './../../../../.angular/pipe/search-filter.pipe';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { DataView } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../../services/products.service';
import { Product } from '../../../../interface/product.interface';
import { SelectItem, MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    DataView,
    ButtonModule,
    CommonModule,
    SelectButton,
    FormsModule,
    DropdownModule,
    DialogModule,
    SearchFilterPipe,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ShopComponent {
  private productService = inject(ProductsService);
  private localStorageService = inject(LocalStorageService);
  private MessageService = inject(MessageService);
  cart: Product[] = [];

  sortOptions!: SelectItem[];
  searchText = '';

  sortKey!: string;
  sortOrder!: number;
  sortField!: string;
  layout: 'list' | 'grid' = 'list';

  products: Product[] = [];
  filteredProducts: Product[] = [];

  options: ('list' | 'grid')[] = ['list', 'grid'];

  selectedAvailability: boolean | null = null;
  selectedCategory: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  availabilityOptions = [
    { label: 'All', value: null },
    { label: 'Available', value: true },
    { label: 'Out of Stock', value: false },
  ];

  categoryOptions: SelectItem[] = [];

  isAdmin = this.localStorageService.getItem('currentRole');
  adminDialogVisible = false;
  editDialogVisible = false;

  newProduct: Partial<Product> = {};
  editProduct: Partial<Product> = {};
  isEditing = false; // Flag to track edit mode

  ngOnInit() {
    const storedProducts =
      this.localStorageService.getItem<Product[]>('products');
    const storedCart = this.localStorageService.getItem<Product[]>('cart');
    this.cart = storedCart ? storedCart : [];
    if (storedProducts && storedProducts.length > 0) {
      this.products = storedProducts;
    } else {
      this.productService.getProducts().subscribe((data) => {
        this.products = data.slice(0, 12);
        this.updateLocalStorage();
      });
    }

    // ✅ Populate categories from the current product list
    this.updateCategoryOptions();
    this.filteredProducts = [...this.products];
    this.applyFilters(); // ✅ Apply filters after loading products

    this.sortOptions = [
      { label: 'Price High to Low', value: '!price' },
      { label: 'Price Low to High', value: 'price' },
    ];
  }

  updateLocalStorage() {
    this.localStorageService.setItem('products', this.products);
  }

  applyFilters() {
    this.filteredProducts = this.products.filter((product) => {
      return (
        (this.selectedAvailability === null ||
          product.avaliablity === this.selectedAvailability) &&
        (!this.selectedCategory ||
          product.category === this.selectedCategory) &&
        (this.minPrice === null || product.price >= this.minPrice) &&
        (this.maxPrice === null || product.price <= this.maxPrice)
      );
    });
  }

  openAdminDialog(product?: Product) {
    if (product) {
      this.newProduct = { ...product };
      this.isEditing = true;
    } else {
      this.newProduct = {};
      this.isEditing = false;
    }
    this.adminDialogVisible = true;
  }

  closeAdminDialog() {
    this.adminDialogVisible = false;
    this.newProduct = {};
    this.isEditing = false;
  }
  updateCategoryOptions() {
    this.categoryOptions = [
      { label: 'All', value: null },
      ...Array.from(new Set(this.products.map((p) => p.category))).map(
        (category) => ({
          label: category,
          value: category,
        })
      ),
    ];
  }
  saveProduct() {
    if (this.isEditing && this.newProduct.id) {
      const index = this.products.findIndex((p) => p.id === this.newProduct.id);
      if (index !== -1) {
        this.products[index] = { ...this.newProduct } as Product;
      }
    } else {
      const newId = this.products.length + 1;
      this.products.push({ ...this.newProduct, id: newId } as Product);
    }

    this.updateLocalStorage();
    this.updateCategoryOptions(); // ✅ Update categories
    this.applyFilters(); // ✅ Keep filtering after changes
    this.closeAdminDialog();
  }

  editProductDialog(product: Product) {
    this.editProduct = { ...product };
    this.editDialogVisible = true;
  }

  updateProduct() {
    const index = this.products.findIndex((p) => p.id === this.editProduct.id);
    if (index !== -1) {
      this.products[index] = { ...this.editProduct } as Product;
      this.updateLocalStorage();
      this.updateCategoryOptions(); // ✅ Update categories
      this.applyFilters();
    }
    this.closeEditDialog();
  }
  closeEditDialog() {
    this.editDialogVisible = false;
    this.editProduct = {};
  }

  deleteProduct(id: number) {
    this.products = this.products.filter((product) => product.id !== id);
    this.updateLocalStorage();
    this.updateCategoryOptions(); // ✅ Update categories
    this.applyFilters();
  }
  addToCart(product: Product) {
    const existingProduct = this.cart.find((p) => p.id === product.id);

    if (existingProduct) {
      this.MessageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Product Already added to cart',
      });
    } else {
      this.cart.push(product);
      this.localStorageService.setItem('cart', this.cart);
      this.MessageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Added to Cart  successfully',
      });
    }
  }
}
