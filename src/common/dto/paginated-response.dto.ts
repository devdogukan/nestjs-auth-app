import { IPaginatedResponse } from "../interfaces/api-response.interface";

export class PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaginatedResponse<T> implements IPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;

  constructor(
    data: T[],
    totalItems: number,
    page: number,
    limit: number,
    message: string = 'Paginated data retrieved successfully',
  ) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    
    const totalPages = Math.ceil(totalItems / limit);
    
    this.meta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}