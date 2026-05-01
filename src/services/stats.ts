import { api } from './api';

export interface DashboardStats {
  licenses: number;
  agencies: number;
  regulations: number;
  open_regulations: number;
  locations: number;
  industries: number;
  business_types: number;
  activities: number;
  comments: number;
  pending_comments: number;
  feedback_pending: number;
  news: number;
}

export const statsService = {
  getDashboardStats() {
    return api.get<{ success: boolean; data: DashboardStats }>('/stats');
  },

  healthCheck() {
    return api.get<{ status: string; database: string }>('/health');
  },
};
