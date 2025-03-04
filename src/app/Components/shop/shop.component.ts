import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataView } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { SelectItem, MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../../../../services/localstorage.service';
import { ProductsService } from '../../../../services/products.service';
import {
  Product,
  TranslatedProduct,
} from '../../../../interface/product.interface';
import { SearchFilterPipe } from '../../../../.angular/pipe/search-filter.pipe';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataView,
    ButtonModule,
    SelectButton,
    DropdownModule,
    DialogModule,
    SearchFilterPipe,
    TranslateModule,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ShopComponent {
  private productService = inject(ProductsService);
  private localStorageService = inject(LocalStorageService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  cart: TranslatedProduct[] = [];
  originalProducts: any[] = [];
  translatedProducts: TranslatedProduct[] = [];
  filteredProducts: TranslatedProduct[] = [];
  sortOptions: SelectItem[] = [];
  searchText = '';
  sortKey!: string;
  sortOrder!: number;
  sortField!: string;
  layout: 'list' | 'grid' = 'list';
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
  newProduct: Product = {
    name: { en: '', ar: '' }, // Two fields for name (English and Arabic)
    description: { en: '', ar: '' },
    id: 0,
    category: {
      en: '',
      ar: '',
    },
    price: 0,
    stock: 0,
    image: '',
    availability: true,
    quantity: 0,
  };
  isEditing = false;
  currentLang: 'en' | 'ar' = 'en'; // Explicitly type it
  editProduct: Product = {
    name: { en: '', ar: '' }, // Two fields for name (English and Arabic)
    description: { en: '', ar: '' },
    id: 0,
    category: {
      en: '',
      ar: '',
    },
    price: 0,
    stock: 0,
    image: '',
    availability: true,
    quantity: 0,
  };

  storedProducts =
    this.localStorageService.getItem<Product[]>('products') || [];
  ngOnInit() {
    const storedLang = this.localStorageService.getItem('language');
    this.currentLang =
      storedLang === 'en' || storedLang === 'ar' ? storedLang : 'en'; // Ensure valid type

    this.translate.onLangChange.subscribe(() => {
      const newLang = this.translate.currentLang;
      this.currentLang = newLang === 'en' || newLang === 'ar' ? newLang : 'en';
      this.updateTranslations();
    });

    this.loadProducts();

    this.sortOptions = [
      {
        label: this.translate.instant('SORT.PRICE_HIGH_TO_LOW'),
        value: '!price',
      },
      {
        label: this.translate.instant('SORT.PRICE_LOW_TO_HIGH'),
        value: 'price',
      },
    ];
  }

  loadProducts() {
    const storedProducts =
      this.localStorageService.getItem<Product[]>('products') || [];

    if (storedProducts.length) {
      this.originalProducts = storedProducts.filter((p) => p !== undefined); // Avoid undefined values
      this.updateTranslations();
    } else {
      this.productService.getProducts().subscribe((data) => {
        this.originalProducts = data
          .filter((p) => p !== undefined)
          .slice(0, 12);
        this.updateTranslations();
        this.updateLocalStorage();
      });
    }
  }

  convertToTranslatedProduct(
    product: Product | undefined,
    lang: 'en' | 'ar'
  ): TranslatedProduct {
    if (!product) {
      console.error('convertToTranslatedProduct: Received undefined product');
      return {
        id: 0,
        name: 'Unknown',
        description: '',
        category: '',
        price: 0,
        stock: 0,
        image: '',
        availability: false,
        quantity: 1,
      };
    }

    return {
      id: product.id,
      name:
        typeof product.name === 'object'
          ? product.name?.[lang] || product.name?.en || 'Unknown'
          : product.name || 'Unknown',
      description:
        typeof product.description === 'object'
          ? product.description?.[lang] || product.description?.en || ''
          : product.description || '',
      category:
        typeof product.category === 'object'
          ? product.category?.[lang] || product.category?.en || ''
          : product.category || '',
      price: product.price ?? 0,
      stock: product.stock ?? 0,
      image: product.image ?? '',
      availability: product.availability ?? false,
      quantity: product.quantity ?? 1,
    };
  }

  updateTranslations() {
    this.translatedProducts = this.originalProducts.map((product) => ({
      id: product.id,
      name: product.name[this.currentLang] || product.name.en,
      description:
        product.description[this.currentLang] || product.description.en,
      category: product.category[this.currentLang] || product.category.en,
      price: product.price,
      stock: product.stock,
      image: product.image,
      quantity: product.quantity,
      availability: product.availability,
    }));

    this.applyFilters(); // Reapply filters after translation update
  }

  updateLocalStorage() {
    this.localStorageService.setItem('products', this.originalProducts);
  }

  /** Applies filters to translated products */
  applyFilters() {
    this.filteredProducts = this.translatedProducts.filter(
      (product) =>
        (this.selectedAvailability === null ||
          (this.selectedAvailability
            ? product.stock > 0
            : product.stock === 0)) &&
        (!this.selectedCategory ||
          product.category === this.selectedCategory) &&
        (this.minPrice === null || product.price >= this.minPrice) &&
        (this.maxPrice === null || product.price <= this.maxPrice)
    );
  }

  updateCategoryOptions() {
    this.categoryOptions = [
      { label: this.translate.instant('CATEGORY.ALL'), value: null },
      ...Array.from(
        new Set(this.translatedProducts.map((p) => p.category))
      ).map((category) => ({
        label: this.translate.instant(`PRODUCTS.${category}`) || category,
        value: category,
      })),
    ];
  }
  saveProduct() {
    if (this.editProduct) {
      const index = this.storedProducts.findIndex(
        (product) => product.id === this.editProduct.id
      );

      if (index !== -1) {
        // Update the product
        this.storedProducts[index] = { ...this.editProduct };
        this.applyFilters();
        // Optionally, save to localStorage or backend
        this.localStorageService.setItem('products', this.storedProducts);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product updated successfully!',
        });

        // Close the edit dialog
        this.closeEditDialog();
        window.location.reload();
      }
    }
  }

  openAdminDialog(product?: Product) {
    this.newProduct = product
      ? { ...product }
      : {
          name: { en: '', ar: '' },
          description: { en: '', ar: '' },
          id: 0,
          category: { en: '', ar: '' },
          price: 0,
          stock: 0,
          image: '',
          availability: false,
          quantity: 0,
        };
    this.isEditing = !!product;
    this.adminDialogVisible = true;
  }

  closeAdminDialog() {
    this.adminDialogVisible = false;
    this.newProduct = {
      name: { en: '', ar: '' },
      description: { en: '', ar: '' },
      id: 0,
      category: { en: '', ar: '' },
      price: 0,
      stock: 0,
      image: '',
      availability: false,
      quantity: 0,
    };
    this.isEditing = false;
  }
  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      // Convert the file to a URL or base64 string, depending on your preference
      this.newProduct.image = URL.createObjectURL(file); // or use FileReader for base64 encoding
    }
  }
  editProductDialog(productId: number) {
    // Ensure productId is a number and not a product object
    const product = this.storedProducts.find((prod) => prod.id === productId);

    if (product) {
      this.editProduct = { ...product }; // Clone the product to avoid direct mutation
      this.editDialogVisible = true;
    } else {
      console.error('Product not found');
    }
  }

  deleteProduct(id: number) {
    // Remove the product from the originalProducts array
    this.originalProducts = this.originalProducts.filter(
      (product) => product.id !== id
    );

    // Update the localStorage with the updated list of products
    this.localStorageService.setItem('products', this.originalProducts);

    // Apply translations and filters after deletion
    this.updateTranslations();
    this.applyFilters();

    // Optionally, show a success message
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Product Deleted Successfully',
    });
  }

  addToCart(product: any) {
    console.log('Product before adding:', product);

    const originalProduct = this.storedProducts.find(
      (p) => p.id === product.id
    );
    if (!originalProduct) {
      console.error('Product not found in products list:', product);
      return;
    }

    const translatedProduct: Product = {
      id: originalProduct.id,
      name: {
        en:
          typeof originalProduct.name === 'string'
            ? originalProduct.name
            : originalProduct.name?.en || 'Unknown',
        ar:
          typeof originalProduct.name === 'string'
            ? originalProduct.name
            : originalProduct.name?.ar || 'غير معروف',
      },
      description: {
        en:
          typeof originalProduct.description === 'string'
            ? originalProduct.description
            : originalProduct.description?.en || 'No description available',
        ar:
          typeof originalProduct.description === 'string'
            ? originalProduct.description
            : originalProduct.description?.ar || 'لا يوجد وصف',
      },
      category: {
        en:
          typeof originalProduct.category === 'string'
            ? originalProduct.category
            : originalProduct.category?.en || 'Uncategorized',
        ar:
          typeof originalProduct.category === 'string'
            ? originalProduct.category
            : originalProduct.category?.ar || 'غير مصنف',
      },
      price: originalProduct.price,
      stock: originalProduct.stock,
      image: originalProduct.image,
      availability: originalProduct.availability ?? true,
      quantity: product.quantity || 1, // Preserve selected quantity
    };

    console.log('Translated Product:', translatedProduct);

    // Retrieve cart from local storage and ensure it's always an array
    let storedCart: Product[] =
      this.localStorageService.getItem<Product[]>('cart') || [];
    if (!Array.isArray(storedCart)) {
      storedCart = []; // Ensure storedCart is an array
    }

    // Check if product already exists in cart
    const existingProduct = storedCart.find(
      (item) => item.id === translatedProduct.id
    );
    if (existingProduct) {
      existingProduct.quantity += 1;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Item Added To Cart successfully',
      });
    } else {
      storedCart.push(translatedProduct);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Item Added To Cart successfully',
      });
    }

    // Save updated cart to local storage
    this.localStorageService.setItem(
      'cart',
      JSON.parse(JSON.stringify(storedCart))
    ); // Stringify to store correctly

    console.log('Cart after adding:', this.localStorageService.getItem('cart')); // Debugging
  }

  closeEditDialog() {
    this.editDialogVisible = false;
  }

  updateProduct() {
    // Ensure the product being edited exists
    const index = this.storedProducts.findIndex(
      (product: Product) => product.id === this.editProduct.id
    );

    if (index !== -1) {
      // Update the product data with the new values
      this.storedProducts[index] = { ...this.editProduct };

      // Save the updated list back to localStorage
      this.localStorageService.setItem('products', this.storedProducts);

      // Show a success message
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Product updated successfully!',
      });

      // Close the edit dialog
      this.closeEditDialog();
    } else {
      // Handle case if the product with the provided ID doesn't exist
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Product not found!',
      });
    }
  }
}
