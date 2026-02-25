"use client";

import { fetchCreator } from "@/api/integration";
import { Creator } from "@/api/models";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import CreatorPreview from "@/components/creator/creatorPreview";

export default function CreatorPage() {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCreator = async (hash: string) => {
      setIsLoading(true);
      setCreator(null);
      const id = parseInt(hash.replace("#", ""), 10);
      if (!isNaN(id)) {
        const response = await fetchCreator(id);
        if (response.success && response.data) {
          setCreator(response.data);
        }
      }
      setIsLoading(false);
    };

    loadCreator(window.location.hash);

    const onHashChange = () => loadCreator(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!creator) {
    return <div className="h-full flex items-center justify-center">Creator not found</div>;
  }

  return (
    <>
      <Divider />
      <div className="h-full flex flex-col">
        <CreatorPreview creator={creator} rank={creator.rank} isLoadingDetail={false} collapseCreatorInfo={false} />
      </div>
      <Divider />
    </>
  );
}
