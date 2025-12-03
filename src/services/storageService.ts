import AsyncStorage from '@react-native-async-storage/async-storage';
import {Medicine, IntakeRecord, DailyIntakeSummary} from '../types/Medicine';

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

  async recordIntake(
    medicineId: string,
    time: string,
    taken: boolean,
  ): Promise<void> {
    try {
      const medicines = await this.getMedicines();
      const medicine = medicines.find(m => m.id === medicineId);

      if (medicine) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        const record: IntakeRecord = {
          date: dateStr,
          time: time,
          taken: taken,
          timestamp: now.getTime(),
        };

        // Remove existing record for the same date and time if exists
        medicine.intakeHistory = medicine.intakeHistory.filter(
          r => !(r.date === dateStr && r.time === time),
        );

        medicine.intakeHistory.push(record);

        // Decrease remaining pills if taken
        if (taken && medicine.remainingPills && medicine.remainingPills > 0) {
          medicine.remainingPills -= 1;
        }

        await AsyncStorage.setItem(
          MEDICINE_STORAGE_KEY,
          JSON.stringify(medicines),
        );
      }
    } catch (error) {
      console.error('Error recording intake:', error);
      throw error;
    }
  },

  async getTodaysMedicines(): Promise<
    Array<{medicine: Medicine; nextTime: string | null; timeRemaining: string}>
  > {
    try {
      const medicines = await this.getMedicines();
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
      ).padStart(2, '0')}`;
      const dateStr = now.toISOString().split('T')[0];

      const todaysMedicines = medicines
        .filter(m => m.isActive)
        .map(medicine => {
          // Find next scheduled time for today
          const futureTimes = medicine.times.filter(t => t > currentTime);
          const nextTime = futureTimes.length > 0 ? futureTimes[0] : null;

          // Calculate time remaining
          let timeRemaining = '';
          if (nextTime) {
            const [nextHour, nextMin] = nextTime.split(':').map(Number);
            const nextDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              nextHour,
              nextMin,
            );
            const diffMs = nextDate.getTime() - now.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            if (diffHours > 0) {
              timeRemaining = `${diffHours}시간 ${diffMins}분 후`;
            } else {
              timeRemaining = `${diffMins}분 후`;
            }
          }

          return {medicine, nextTime, timeRemaining};
        })
        .filter(item => item.nextTime !== null); // Only return medicines with upcoming times

      return todaysMedicines;
    } catch (error) {
      console.error('Error getting todays medicines:', error);
      return [];
    }
  },

  async getDailyIntakeSummary(days: number = 7): Promise<DailyIntakeSummary[]> {
    try {
      const medicines = await this.getMedicines();
      const summaries: DailyIntakeSummary[] = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        let totalMedicines = 0;
        let takenMedicines = 0;

        medicines.forEach(medicine => {
          const scheduledTimes = medicine.times.length;
          totalMedicines += scheduledTimes;

          const takenRecords = medicine.intakeHistory.filter(
            r => r.date === dateStr && r.taken,
          );
          takenMedicines += takenRecords.length;
        });

        const missedMedicines = totalMedicines - takenMedicines;
        const percentage =
          totalMedicines > 0 ? (takenMedicines / totalMedicines) * 100 : 0;

        summaries.push({
          date: dateStr,
          totalMedicines,
          takenMedicines,
          missedMedicines,
          percentage,
        });
      }

      return summaries;
    } catch (error) {
      console.error('Error getting daily intake summary:', error);
      return [];
    }
  },

  async updateRemainingPills(
    medicineId: string,
    remaining: number,
  ): Promise<void> {
    try {
      const medicines = await this.getMedicines();
      const medicine = medicines.find(m => m.id === medicineId);

      if (medicine) {
        medicine.remainingPills = remaining;
        await AsyncStorage.setItem(
          MEDICINE_STORAGE_KEY,
          JSON.stringify(medicines),
        );
      }
    } catch (error) {
      console.error('Error updating remaining pills:', error);
      throw error;
    }
  },
};
