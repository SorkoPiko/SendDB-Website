import { Send } from "./models";

export interface PeakTrendingScore {
  score: number;
  timestamp: number;
}

export function trendingScore(sends: Send[], currentTime: number): number {
  let totalScore = 0;
  for (const send of sends) {
    totalScore += individualTrendingScore(send, currentTime);
  }
  return totalScore;
}

export function peakTrendingScore(sends: Send[]): PeakTrendingScore {
  let peakScore = 0;
  let peakTime = 0;

  for (const send of sends) {
    const score = trendingScore(sends, send.timestamp);
    if (score > peakScore) {
      peakScore = score;
      peakTime = send.timestamp;
    }
  }

  return { score: peakScore, timestamp: peakTime };
}

function individualTrendingScore(send: Send, currentTime: number): number {
  const ageInDays = (currentTime - send.timestamp) / (1000 * 60 * 60 * 24);
  if (ageInDays < 0 || ageInDays > 30) {
    return 0;
  }
  return 25000 / Math.pow(ageInDays + 2, 1);
}