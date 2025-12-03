export type MedicineCategory = 'prescription' | 'otc' | 'supplement';

export interface PharmacyInfo {
  name: string;
  phone: string;
  address: string;
}

export interface IntakeRecord {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  taken: boolean;
  timestamp: number;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice' | 'thrice' | 'custom';
  times: string[]; // Time in HH:mm format
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;

  // New enhanced fields
  category: MedicineCategory;
  photoUri?: string;
  effectiveness?: string; // 효능
  sideEffects?: string; // 부작용
  remainingPills?: number; // 남은 개수
  totalPills?: number; // 전체 개수
  pharmacy?: PharmacyInfo; // 약국 정보
  intakeHistory: IntakeRecord[]; // 복용 기록
  color?: string; // Custom color for the medicine card
}

export interface AlarmTime {
  hour: number;
  minute: number;
}

export interface DailyIntakeSummary {
  date: string;
  totalMedicines: number;
  takenMedicines: number;
  missedMedicines: number;
  percentage: number;
}
