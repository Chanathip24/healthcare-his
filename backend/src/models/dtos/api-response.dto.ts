export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public message: string,
    public data: T | null,
    public timestamp: string
  ) {}

  static successResponse<T>(data: T): ApiResponse<T> {
    return new ApiResponse<T>(true, "Success", data, new Date().toISOString());
  }

  static successMessage<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data, new Date().toISOString());
  }

  static error<T>(message: string): ApiResponse<T> {
    return new ApiResponse<T>(false, message, null, new Date().toISOString());
  }
}
