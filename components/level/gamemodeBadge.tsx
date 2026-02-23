import Image from "next/image";

export default function GamemodeBadge({ platformer, size }: { platformer: boolean; size?: number }) {
  const imageSrc = platformer
    ? "https://gdbrowser.com/assets/moon.png"
    : "https://gdbrowser.com/assets/star.png";
  const label = platformer ? "Platformer" : "Classic";

  return (
    <Image src={imageSrc} alt={label} title={label} width={size || 14} height={size || 14} />
  );
}