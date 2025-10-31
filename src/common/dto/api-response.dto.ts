import { IApiResponse } from "../interfaces/api-response.interface";

export class ApiResponse<T> implements IApiResponse {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  path?: string;

  constructor(success: boolean, message: string, data?: T, path?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}
