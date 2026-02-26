"use client";

import { fetchLeaderboard, fetchLevel } from "@/api/integration";
import { GamemodeFilter, LeaderboardLevel, Level, RateFilter } from "@/api/models";
import { useCallback, useEffect, useRef, useState } from "react";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Input } from "@heroui/input";
import { RiArrowLeftSLine, RiSearchLine } from "@remixicon/react";
import LevelRow from "@/components/level/levelRow";
import LevelPreview from "@/components/level/levelPreview";
import FilterDropdown from "@/components/filterDropdown";

const PAGE_SIZE = 50;

type DropdownFilter<T> = "All" | T;

const RATE_OPTIONS: DropdownFilter<RateFilter>[] = ["All", "Rated", "Unrated"];
const GAMEMODE_OPTIONS: DropdownFilter<GamemodeFilter>[] = ["All", "Classic", "Platformer"];

function convertToServerFilter<T>(filter: DropdownFilter<T>): T | null {
  return filter === "All" ? null : (filter as T);
}

export default function LevelsPage() {
  const [levels, setLevels] = useState<LeaderboardLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LeaderboardLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rate, setRate] = useState<DropdownFilter<RateFilter>>("All");
  const [gamemode, setGamemode] = useState<DropdownFilter<GamemodeFilter>>("All");

  const listRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [levelDetail, setLevelDetail] = useState<Level | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleSelectLevel = useCallback(async (level: LeaderboardLevel) => {
    setLevelDetail(null);
    if (selectedLevel?.level_id === level.level_id) {
      setSelectedLevel(null);
      return;
    }
  
    setSelectedLevel(level);
    setIsLoadingDetail(true);

    const response = await fetchLevel(level.level_id);
    if (response.success && response.data) {
      setLevelDetail(response.data);
    }

    setIsLoadingDetail(false);
  }, [selectedLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.dataset.elementid === "navbar-search-input") return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

      e.preventDefault();
      const currentIndex = selectedLevel !== null
        ? levels.findIndex((l) => l.level_id === selectedLevel.level_id)
        : -1;
      const nextIndex =
        e.key === "ArrowDown"
          ? Math.min(currentIndex + 1, levels.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (nextIndex !== currentIndex && levels[nextIndex]) {
        const newLevel = levels[nextIndex];
        const remaining = levels.length - nextIndex - 1;
        if (remaining <= 5 && hasMore && !isFetchingMore && !isLoading) {
          loadLevels(offset);
        }
        handleSelectLevel(newLevel);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [levels, selectedLevel, handleSelectLevel]);

  useEffect(() => {
    if (!selectedLevel || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-level-id="${selectedLevel.level_id}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedLevel]);

  // useEffect(() => {
  //   fetch('/level.json')
  //     .then((res) => res.json())
  //     .then((data: Level) => setLevelDetail(data))
  //     .catch((error) => console.error('Failed to load placeholder level:', error));
  // }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLevels([]);
    setOffset(0);
    setHasMore(true);
    setSelectedLevel(null);
    loadLevels(0, true);
  }, [rate, gamemode, debouncedSearch]);

  const loadLevels = useCallback(
    async (currentOffset: number, initial = false) => {
      if (initial) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const response = await fetchLeaderboard({
        offset: currentOffset,
        limit: PAGE_SIZE,
        rate_filter: convertToServerFilter(rate),
        gamemode_filter: convertToServerFilter(gamemode),
        search: debouncedSearch || null,
      });

      if (response.success && response.data) {
        setTotal(response.data?.total || 0);
        setLevels((prev) => (initial ? response.data?.levels || [] : [...prev, ...response.data?.levels || []]));
        setOffset(currentOffset + (response.data?.levels.length || 0));
        setHasMore((response.data?.levels.length || 0) === PAGE_SIZE && currentOffset + (response.data?.levels.length || 0) < (response.data?.total || 0));
      }
      setIsLoading(false);
      setIsFetchingMore(false);
    },
    [rate, gamemode, debouncedSearch]
  );

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          loadLevels(offset);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [hasMore, isFetchingMore, isLoading, offset, loadLevels]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px-48px)]">
      <Divider />
      <div className="flex flex-1 overflow-hidden mx-auto w-full">
        <div className={`flex-shrink-0 flex flex-col border-r border-divider ${selectedLevel ? "hidden md:flex md:w-80" : "flex w-full md:w-80"}`}>
          <div className="flex-shrink-0 p-3 border-b border-divider space-y-3 bg-default-50/30">
            <Input
              size="sm"
              placeholder="Search levels..."
              value={search}
              onValueChange={setSearch}
              startContent={
                <RiSearchLine size={16} className="text-default-400" />
              }
              isClearable
              onClear={() => setSearch("")}
              classNames={{ inputWrapper: "h-8" }}
            />

            <div className="flex items-center gap-2">
              <FilterDropdown
                label="Rate"
                value={rate}
                options={RATE_OPTIONS}
                onChange={setRate}
              />

              <FilterDropdown
                label="Gamemode"
                value={gamemode}
                options={GAMEMODE_OPTIONS}
                onChange={setGamemode}
              />
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner size="sm" />
              </div>
            ) : levels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-default-400 text-sm gap-2 select-none">
                <RiSearchLine size={32} className="opacity-40" />
                No levels found
              </div>
            ) : (
              <>
                {levels.map((level, i) => (
                  <div key={level.level_id} data-level-id={level.level_id}>
                    <LevelRow
                      level={level}
                      rank={level.rank}
                      isSelected={selectedLevel?.level_id === level.level_id}
                      onClick={() => handleSelectLevel(level)}
                    />
                  </div>
                ))}

                <div ref={sentinelRef} className="h-4" />

                {isFetchingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                )}

                {!hasMore && levels.length > 0 && (
                  <p className="text-center text-xs text-default-300 py-4">
                    All {levels.length} levels loaded
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className={`flex-col overflow-hidden items-center ${selectedLevel ? "flex flex-1" : "hidden md:flex md:flex-1"}`}>
          <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-divider w-full flex-shrink-0">
            <button
              onClick={() => { setSelectedLevel(null); setLevelDetail(null); }}
              className="flex items-center gap-1 text-sm text-default-600 hover:text-default-900 active:text-default-700"
            >
              <RiArrowLeftSLine size={18} />
              Back
            </button>
          </div>
          <LevelPreview level={levelDetail} rank={selectedLevel?.rank || 0} isLoadingDetail={isLoadingDetail} />
        </div>
      </div>
      <Divider />
    </div>
  );
}