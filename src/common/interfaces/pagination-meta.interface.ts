export interface PaginationMeta {
  page: number;             // Current active page number (e.g. 1)
  limit: number;            // Items per page limit (e.g. 20)
  total: number;            // Total matching record count (e.g. 150)
  totalPage: number;        // Calculated total pages count (e.g. 8)
  hasNextPage: boolean;     // True if next page exists
  hasPreviousPage: boolean; // True if previous page exists
}
