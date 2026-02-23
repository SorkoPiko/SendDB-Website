export interface Send {
  timestamp: number;
}

export interface CreatorLevel {
  name: string;
  level_id: number;
  send_count: number;
}

export interface LevelCreator {
  name: string;
  player_id: number;
}

export interface LeaderboardRate {
  difficulty: number;
  points: number;
  stars: number;
}

export interface Rate {
  difficulty: number;
  points: number;
  stars: number;
  timestamp: number;
  accurate: boolean;
}

export interface Level {
  name: string;
  level_id: number;
  creator: LevelCreator;
  sends: Send[];
  accurate: boolean;
  platformer: boolean;
  length: number;
  rank: number;
  trending_score: number;
  rate_rank: number;
  gamemode_rank: number;
  joined_rank: number;
  trending_rank: number;
  rate: Rate | null;
}

export interface BatchLevel {
    level_id: number;
    send_count: number;
    accurate: boolean;
    platformer: boolean;
    length: number;
    rank: number;
    trending_score: number;
    rate: Rate | null;
}

export interface Creator {
  name: string;
  player_id: number;
  account_id: number;
  levels: CreatorLevel[];
  send_count: number;
  recent_sends: number;
  send_count_stddev: number;
  trending_score: number;
  trending_level_count: number;
  latest_send: number;
  rank: number;
  trending_rank: number;
}

export interface LeaderboardLevel {
  name: string;
  level_id: number;
  creator: LevelCreator;
  send_count: number;
  rank: number;
  platformer: boolean;
  rate: LeaderboardRate | null;
}

export interface TrendingLeaderboardLevel extends LeaderboardLevel {
  trending_score: number;
}

export interface LeaderboardCreator {
  name: string;
  player_id: number;
  account_id: number;
  level_count: number;
  send_count: number;
  trending_score: number;
  rank: number;
  trending_rank: number;
}

export type RateFilter = "Rated" | "Unrated";
export type GamemodeFilter = "Classic" | "Platformer";