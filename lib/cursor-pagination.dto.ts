export interface CursorPagination {
  cursor?: string;
  limit?: number;
}

export interface CursorPageResponse<T> {
  data: T[];
  nextCursor?: string | null;
  hasNextPage: boolean;
}