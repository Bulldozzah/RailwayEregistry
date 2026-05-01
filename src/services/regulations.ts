import { api } from './api';
import type {
  Regulation,
  RegulationAttachment,
  Comment,
  Position,
  RegulationFieldData,
  PaginatedResponse,
  ApiResponse,
} from '@/types/database';

export interface RegulationDetail extends Regulation {
  agency_name: string | null;
  industry_name: string | null;
  attachments: RegulationAttachment[];
  comments: (Comment & { user_role: string | null })[];
  positions: Position[];
  field_data: (RegulationFieldData & { fieldlabel: string; fieldtype: number })[];
}

export interface RegulationListItem extends Regulation {
  agency_name: string | null;
  comment_count: number;
}

export interface RegulationListParams {
  page?: number;
  per_page?: number;
  search?: string;
  order_by?: string;
  order_dir?: string;
  agency_id?: number;
  industry_id?: number;
  published?: number;
  consultation_stage?: number;
}

export interface CommentSubmission {
  comment: string;
  user?: number;
  parent?: number | null;
  position?: number;
  documents?: string | null;
}

export const regulationService = {
  list(params: RegulationListParams = {}) {
    return api.get<PaginatedResponse<RegulationListItem>>('/regulations', params as Record<string, string | number>);
  },

  getById(id: number | string) {
    return api.get<ApiResponse<RegulationDetail>>(`/regulations/${id}`);
  },

  submitComment(regulationId: number | string, data: CommentSubmission) {
    return api.post<ApiResponse<{ id: number }>>(`/regulations/${regulationId}/comments`, data);
  },
};
