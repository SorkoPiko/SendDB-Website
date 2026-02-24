"use client";

import { fetchCreator, fetchCreatorLeaderboard } from "@/api/integration";
import { Creator, LeaderboardCreator } from "@/api/models";
import { CreatorLeaderboardResponse } from "@/api/responses";
import CreatorPreview from "@/components/creator/creatorPreview";
import CreatorRow from "@/components/creator/creatorRow";
import { SearchIcon } from "@/components/icons";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 50;

export default function CreatorsPage() {
  const [creators, setCreators] = useState<LeaderboardCreator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<LeaderboardCreator | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const listRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [creatorDetail, setCreatorDetail] = useState<Creator | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // useEffect(() => {
  //   fetch('/creators.json')
  //     .then((res) => res.json())
  //     .then((data: CreatorLeaderboardResponse) => setCreators(data.creators))
  //     .catch((error) => console.error('Failed to load placeholder creators:', error));
  // }, []);

  const handleSelectCreator = useCallback(async (creator: LeaderboardCreator) => {
    setCreatorDetail(null);
    if (selectedCreator?.player_id === creator.player_id) {
      setSelectedCreator(null);
      return;
    }
    
    setSelectedCreator(creator);
    setIsLoadingDetail(true);

    const response = await fetchCreator(creator.player_id);
    if (response.success && response.data) {
      setCreatorDetail(response.data);
    }

    setIsLoadingDetail(false);
  }, [selectedCreator]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCreators([]);
    setOffset(0);
    setHasMore(true);
    setSelectedCreator(null);
    loadLevels(0, true);
  }, [debouncedSearch]);

  const loadLevels = useCallback(
    async (currentOffset: number, initial = false) => {
      if (initial) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const response = await fetchCreatorLeaderboard({
        offset: currentOffset,
        limit: PAGE_SIZE,
        search: debouncedSearch || null,
      });

      if (response.success && response.data) {
        setTotal(response.data?.total || 0);
        setCreators((prev) => (initial ? response.data?.creators || [] : [...prev, ...response.data?.creators || []]));
        setOffset(currentOffset + (response.data?.creators.length || 0));
        setHasMore((response.data?.creators.length || 0) === PAGE_SIZE && currentOffset + (response.data?.creators.length || 0) < (response.data?.total || 0));
      }
      setIsLoading(false);
      setIsFetchingMore(false);
    },
    [debouncedSearch]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px-48px)]">
      <Divider />
        <div className="flex flex-1 overflow-hidden mx-auto w-full">
          <div className="w-80 flex-shrink-0 flex flex-col border-r border-divider">
            <div className="flex-shrink-0 p-3 border-b border-divider space-y-3 bg-default-50/30">
              <Input
                size="sm"
                placeholder="Search creators..."
                value={search}
                onValueChange={setSearch}
                startContent={
                  <SearchIcon size={16} className="w-3.5 h-3.5 text-default-400" />
                }
                isClearable
                onClear={() => setSearch("")}
                classNames={{ inputWrapper: "h-8" }}
              />
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Spinner size="sm" />
                </div>
              ) : creators.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-default-400 text-sm gap-2 select-none">
                  <SearchIcon className="w-8 h-8 opacity-40" />
                  No creators found
                </div>
              ) : (
                <>
                  {creators.map((creator, i) => (
                    <CreatorRow
                      key={creator.player_id}
                      creator={creator}
                      rank={creator.rank}
                      isSelected={selectedCreator?.player_id === creator.player_id}
                      onClick={() => handleSelectCreator(creator)}
                    />
                  ))}

                  <div ref={sentinelRef} className="h-4" />

                  {isFetchingMore && (
                    <div className="flex items-center justify-center py-4">
                      <Spinner size="sm" />
                    </div>
                  )}

                  {!hasMore && creators.length > 0 && (
                    <p className="text-center text-xs text-default-300 py-4">
                      All {creators.length} creators loaded
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden items-center">
            <CreatorPreview creator={creatorDetail} rank={selectedCreator?.rank || 0} isLoadingDetail={isLoadingDetail} />
          </div>
        </div>
      <Divider />
    </div>
  );
}
