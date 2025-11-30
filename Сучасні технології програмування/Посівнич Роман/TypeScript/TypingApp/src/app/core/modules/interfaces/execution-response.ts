import { RecordResponse } from "./record-response";

export interface ExecutionResponse<T> {
  success: boolean;
  message: string;
  result: T;
}