import { Creator, LeaderboardCreator, LeaderboardLevel, Level, TrendingLeaderboardLevel } from "./models";
import { BatchLevelRequest, CreatorLeaderboardQuery, LeaderboardQuery, TrendingLeaderboardQuery } from "./requests";
import { BatchLevelResponse, LeaderboardResponse, SendDBAPIResponse } from "./responses";
import { getCached, setCached } from "./cache";

const API_BASE_URL = "http://localhost:8080/api/v1";

async function fetchGeneric<T>(url: string, options?: RequestInit): Promise<SendDBAPIResponse<T>> {
  try {
    const res = await fetch(url, options);
    const json = await res.json();
    if (res.ok) {
      return { success: true, data: json };
    } else {
      return { success: false, error: json.message };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred while fetching data." };
  }
}

async function fetchPostGeneric<T>(url: string, body: any): Promise<SendDBAPIResponse<T>> {
  return fetchGeneric<T>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function fetchLevel(levelID: number): Promise<SendDBAPIResponse<Level>> {
  const key = `level:${levelID}`;
  const cached = getCached<Level>(key);
  if (cached) return { success: true, data: cached };

  const res = await fetchGeneric<Level>(`${API_BASE_URL}/level/${levelID}`);
  if (res.success) setCached(key, res.data);
  return res;
}

export async function fetchCreator(playerID: number): Promise<SendDBAPIResponse<Creator>> {
  const key = `creator:${playerID}`;
  const cached = getCached<Creator>(key);
  if (cached) return { success: true, data: cached };

  const res = await fetchGeneric<Creator>(`${API_BASE_URL}/creator/${playerID}`);
  if (res.success) setCached(key, res.data);
  return res;
}

export async function fetchLevels(request: BatchLevelRequest): Promise<SendDBAPIResponse<BatchLevelResponse>> {
  const key = `levels:${JSON.stringify(request)}`;
  const cached = getCached<BatchLevelResponse>(key);
  if (cached) return { success: true, data: cached };

  const res = await fetchPostGeneric<BatchLevelResponse>(`${API_BASE_URL}/level/batch`, request);
  if (res.success) setCached(key, res.data);
  return res;
}

export async function fetchLeaderboard(request: LeaderboardQuery): Promise<SendDBAPIResponse<LeaderboardResponse<LeaderboardLevel>>> {
  return fetchPostGeneric<LeaderboardResponse<LeaderboardLevel>>(`${API_BASE_URL}/leaderboard`, request);
}

export async function fetchTrendingLeaderboard(request: TrendingLeaderboardQuery): Promise<SendDBAPIResponse<LeaderboardResponse<TrendingLeaderboardLevel>>> {
  return fetchPostGeneric<LeaderboardResponse<TrendingLeaderboardLevel>>(`${API_BASE_URL}/leaderboard/trending`, request);
}

export async function fetchCreatorLeaderboard(request: CreatorLeaderboardQuery): Promise<SendDBAPIResponse<LeaderboardResponse<LeaderboardCreator>>> {
  return fetchPostGeneric<LeaderboardResponse<LeaderboardCreator>>(`${API_BASE_URL}/leaderboard/creators`, request);
}