export interface CompanySettings {
  id: string;
  companyId: string;
  lateMarkHour: number;
  lateMarkMinute: number;
  halfDayHours: number;
  defaultGeoRadius: number;
  weekOffDays: number[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsPayload {
  lateMarkHour?: number;
  lateMarkMinute?: number;
  halfDayHours?: number;
  defaultGeoRadius?: number;
  weekOffDays?: number[];
}