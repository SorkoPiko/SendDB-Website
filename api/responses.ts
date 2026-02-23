import { BatchLevel } from "./models";

export interface SendDBAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BatchLevelResponse {
  levels: BatchLevel[];
}

export interface LeaderboardResponse<T> {
  total: number;
  levels: T[];
}