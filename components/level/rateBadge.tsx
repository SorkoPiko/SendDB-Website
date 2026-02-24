import { LeaderboardRate } from "@/api/models";

const STARS_MAP: Record<number, string> = {
  0: "unrated",
  1: "auto",
  2: "easy",
  3: "normal",
  4: "hard",
  5: "hard",
  6: "harder",
  7: "harder",
  8: "insane",
  9: "insane",
  10: "demon"
}

const DEMON_MAP: Record<number, string> = {
  0: "easy",
  1: "medium",
  2: "hard",
  3: "insane",
  4: "extreme"
}

const POINTS_MAP: Record<number, string> = {
  2: "featured",
  3: "epic",
  4: "legendary",
  5: "mythic"
}

export default function RateBadge({ rate }: { rate: LeaderboardRate | null }) {
  
  let badgeString: string = "unrated";
  if (rate) {
    badgeString = STARS_MAP[rate.stars];

    if (rate.stars === 10) {
      badgeString += `-${DEMON_MAP[rate.difficulty]}`;
    }

    if (rate.points > 1) {
      badgeString += `-${POINTS_MAP[rate.points]}`;
    }
  }

  let imageUrl: string = `https://gdbrowser.com/assets/difficulties/${badgeString}.png`;

  return (
    <div className="relative w-12 self-stretch flex-shrink-0 overflow-visible">
      <img
        src={imageUrl}
        alt={badgeString}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-25 w-auto h-auto max-w-none max-h-none"
      />
    </div>
  );
}