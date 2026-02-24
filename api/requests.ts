import { GamemodeFilter, RateFilter } from "./models";

export interface BatchLevelRequest {
  level_ids: number[];
}

export interface LeaderboardQuery {
  limit: number;
  offset: number;
  rate_filter: RateFilter | null;
  gamemode_filter: GamemodeFilter | null;
  search: string | null;
}

export interface TrendingLeaderboardQuery {
  limit: number;
  offset: number;
  search: string | null;
}

export interface CreatorLeaderboardQuery {
  limit: number;
  offset: number;
  search: string | null;
}