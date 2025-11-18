import AsyncStorage from '@react-native-async-storage/async-storage';
import {Medicine} from '../types/Medicine';

const MEDICINE_STORAGE_KEY = '@medicines';

export const storageService = {
  async getMedicines(): Promise<Medicine[]> {
    try {
      const medicinesJson = await AsyncStorage.getItem(MEDICINE_STORAGE_KEY);
      return medicinesJson ? JSON.parse(medicinesJson) : [];
    } catch (error) {
      console.error('Error loading medicines:', error);
      return [];
    }
  },

  async saveMedicine(medicine: Medicine): Promise<void> {
    try {
      const medicines = await this.getMedicines();
      const existingIndex = medicines.findIndex(m => m.id === medicine.id);

      if (existingIndex >= 0) {
        medicines[existingIndex] = medicine;
      } else {
        medicines.push(medicine);
      }

      await AsyncStorage.setItem(
        MEDICINE_STORAGE_KEY,
        JSON.stringify(medicines),
      );
    } catch (error) {
      console.error('Error saving medicine:', error);
      throw error;
    }
  },

  async deleteMedicine(id: string): Promise<void> {
    try {
      const medicines = await this.getMedicines();
      const filteredMedicines = medicines.filter(m => m.id !== id);
      await AsyncStorage.setItem(
        MEDICINE_STORAGE_KEY,
        JSON.stringify(filteredMedicines),
      );
    } catch (error) {
      console.error('Error deleting medicine:', error);
      throw error;
    }
  },

  async updateMedicineStatus(id: string, isActive: boolean): Promise<void> {
    try {
      const medicines = await this.getMedicines();
      const medicine = medicines.find(m => m.id === id);

      if (medicine) {
        medicine.isActive = isActive;
        await AsyncStorage.setItem(
          MEDICINE_STORAGE_KEY,
          JSON.stringify(medicines),
        );
      }
    } catch (error) {
      console.error('Error updating medicine status:', error);
      throw error;
    }
  },
};
