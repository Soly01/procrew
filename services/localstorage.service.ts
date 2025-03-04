import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  /**
   * Stores a value in localStorage as JSON.
   * @param key The key under which the value is stored.
   * @param value The data to store.
   */
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving data to localStorage ("${key}")`, error);
    }
  }

  /**
   * Retrieves a value from localStorage and parses it as JSON.
   * @param key The key to retrieve.
   * @returns The parsed data or null if not found.
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return null;
    }
  }

  /**
   * Removes a specific item from localStorage.
   * @param key The key to remove.
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }

  /**
   * Clears all localStorage data.
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
