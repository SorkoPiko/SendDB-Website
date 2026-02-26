"use client";

import { fetchLevel } from "@/api/integration";
import { Level } from "@/api/models";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import LevelPreview from "@/components/level/levelPreview";
import { Divider } from "@heroui/divider";

export default function LevelPage() {
  const [level, setLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLevel = async (hash: string) => {
      setIsLoading(true);
      setLevel(null);
      const id = parseInt(hash.replace("#", ""), 10);
      if (!isNaN(id)) {
        const response = await fetchLevel(id);
        if (response.success && response.data) {
          setLevel(response.data);
        }
      }
      setIsLoading(false);
    };

    loadLevel(window.location.hash);

    const onHashChange = () => loadLevel(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!level) {
    return <div className="h-full flex items-center justify-center">Level not found</div>;
  }

  return (
    <>
      <Divider />
      <div className="h-full flex flex-col">
        <LevelPreview level={level} rank={level.rank} isLoadingDetail={false} />
      </div>
      <Divider />
    </>
  );
}
