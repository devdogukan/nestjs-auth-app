import { ApiResponse } from "../dto/api-response.dto";
import { PaginatedResponse } from "../dto/paginated-response.dto";
import { IApiResponse, IPaginatedResponse } from "../interfaces/api-response.interface";

export class ResponseHelper {
  /**
   * Success response helper
   * @example
   * ResponseHelper.success("Operation successful", data);
   *
   * @param message
   * @param data
   * @param path
   * @returns IApiResponse<T>
   */
  static success<T>(message: string, data?: T, path?: string): IApiResponse<T> {
    return new ApiResponse(true, message, data, path);
  }

  /**
   * Error response helper
   * @example
   * ResponseHelper.error("Operation failed");
   *
   * @param message
   * @param path
   * @return IApiResponse<null>
   */
  static error(message: string, path?: string): IApiResponse<null> {
    return new ApiResponse(false, message, null, path);
  }

  /**
   * Paginated response helper
   * @example
   * ResponseHelper.paginated(data, totalItems, page, limit, "Data retrieved successfully");
   *
   * @param data
   * @param totalItems
   * @param page
   * @param limit
   * @param message
   * @returns IPaginatedResponse<T>
   */
  static paginated<T>(
    data: T[],
    totalItems: number,
    page: number,
    limit: number,
    message?: string,
  ): IPaginatedResponse<T> {
    return new PaginatedResponse(data, totalItems, page, limit, message);
  }
}
