"use client";

import { fetchLevel } from "@/api/integration";
import { Level } from "@/api/models";
import { use, useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import LevelPreview from "@/components/level/levelPreview";
import { Divider } from "@heroui/divider";

export default function LevelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [level, setLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLevel = async () => {
      const response = await fetchLevel(parseInt(id));
      if (response.success && response.data) {
        setLevel(response.data);
      }
      setIsLoading(false);
    };
    loadLevel();
  }, [id]);

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