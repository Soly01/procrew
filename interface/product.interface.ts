export interface Product {
  id: number;
  name: { en: string; ar: string }; // Correct structure
  description: { en: string; ar: string };
  category: { en: string; ar: string };
  price: number;
  stock: number;
  image: string;
  availability: boolean;
  quantity: number;
}

export interface TranslatedProduct {
  id: number;
  name: string; // Now a string, not an object
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  availability: boolean;
  quantity: number;
}
