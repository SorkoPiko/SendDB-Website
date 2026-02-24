import { BatchLevel, LeaderboardCreator } from "./models";

export interface SendDBAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BatchLevelResponse {
  levels: BatchLevel[];
}

export interface LevelLeaderboardResponse<T> {
  total: number;
  levels: T[];
}

export interface CreatorLeaderboardResponse {
  total: number;
  creators: LeaderboardCreator[];
}