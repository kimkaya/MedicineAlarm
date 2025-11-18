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
}

export interface AlarmTime {
  hour: number;
  minute: number;
}
