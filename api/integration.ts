import { Creator, LeaderboardCreator, LeaderboardLevel, Level, TrendingLeaderboardLevel } from "./models";
import { BatchLevelRequest, CreatorLeaderboardQuery, LeaderboardQuery, TrendingLeaderboardQuery } from "./requests";
import { BatchLevelResponse, LeaderboardResponse, SendDBAPIResponse } from "./responses";

const API_BASE_URL = "https://apia.senddb.dev/api/v1";

function fetchGeneric<T>(url: string, options?: RequestInit): Promise<SendDBAPIResponse<T>> {
  return fetch(url, options)
    .then(async (res) => {
      const json = await res.json();
      if (res.ok) {
        return { success: true, data: json };
      } else {
        return { success: false, error: json.message };
      }
    })
    .catch((error) => ({
      success: false,
      error: error.message || "An error occurred while fetching data.",
    }));
}

function fetchPostGeneric<T>(url: string, body: any): Promise<SendDBAPIResponse<T>> {
  return fetchGeneric<T>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export function fetchLevel(levelID: number): Promise<SendDBAPIResponse<Level>> {
  return fetchGeneric<Level>(`${API_BASE_URL}/level/${levelID}`);
}

export function fetchCreator(playerID: number): Promise<SendDBAPIResponse<Creator>> {
  return fetchGeneric<Creator>(`${API_BASE_URL}/creator/${playerID}`);
}

export function fetchLevels(request: BatchLevelRequest): Promise<SendDBAPIResponse<BatchLevelResponse>> {
  return fetchPostGeneric<BatchLevelResponse>(`${API_BASE_URL}/level/batch`, request);
}

export function fetchLeaderboard(request: LeaderboardQuery): Promise<SendDBAPIResponse<LeaderboardResponse<LeaderboardLevel>>> {
  return fetchPostGeneric<LeaderboardResponse<LeaderboardLevel>>(`${API_BASE_URL}/leaderboard`, request);
}

export function fetchTrendingLeaderboard(request: TrendingLeaderboardQuery): Promise<SendDBAPIResponse<LeaderboardResponse<TrendingLeaderboardLevel>>> {
  return fetchPostGeneric<LeaderboardResponse<TrendingLeaderboardLevel>>(`${API_BASE_URL}/leaderboard/trending`, request);
}

export function fetchCreatorLeaderboard(request: CreatorLeaderboardQuery): Promise<SendDBAPIResponse<LeaderboardResponse<LeaderboardCreator>>> {
  return fetchPostGeneric<LeaderboardResponse<LeaderboardCreator>>(`${API_BASE_URL}/leaderboard/creators`, request);
}