export interface CursorPagination {
  cursor?: string;
  limit?: number;
}

export interface CursorPageResponse<T> {
  data: T[];
  limit: number;
  nextCursor?: string | null;
  hasNextPage: boolean;
}