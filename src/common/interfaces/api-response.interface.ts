import { PaginationMeta } from './pagination-meta.interface';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
  path: string;
}

export interface FieldValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  errorCode?: string;
  errors?: FieldValidationError[];
  timestamp: string;
  path: string;
}
