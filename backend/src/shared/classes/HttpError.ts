/**
 * API error object
 * @property status
 * @property message
 * @property code - Specific error code
 * @property data - Additional data
 */
export class HttpError extends Error {
  public status: number;

  public message: string;

  public code?: number;

  public results?: any;

  constructor(status: number, message: string, code?: number, results?: any) {
    super(message);
    this.status = status;
    this.message = message;
    this.code = code;
    this.results = results;
  }
}
