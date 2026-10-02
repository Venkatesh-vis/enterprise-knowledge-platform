export class BillingServiceError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, status = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = "BillingServiceError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
