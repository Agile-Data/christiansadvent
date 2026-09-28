import catalog from "@/lib/characters/catalog.json";
import type { CSSProperties } from "react";

export type CharacterId = keyof typeof catalog.characters;
export type CharacterView = "front" | "threeQuarter" | "profile" | "portrait";
type Frame = { x: number; y: number; width: number; height: number };

/** Render a non-destructive view of a versioned character master.
 * assetUrl is supplied by the host app/API: no private source photo is bundled.
 * For future locked cards, request artwork only after the API permits the reveal.
 */
export default function CharacterAvatar({ characterId, assetUrl, view, width = 140, label, decorative = false, style }: {
  characterId: CharacterId;
  assetUrl: string;
  view?: CharacterView;
  width?: number | string;
  label?: string;
  decorative?: boolean;
  style?: CSSProperties;
}) {
  const character = catalog.characters[characterId];
  const asset = catalog.assets[character.asset as keyof typeof catalog.assets];
  const frames: Record<string, Frame> = character.views;
  const frame = frames[view || character.defaultView];
  if (!frame) throw new Error(`View ${view} is not available for ${characterId}`);
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`}
    width={width} role={decorative ? undefined : "img"} aria-hidden={decorative || undefined}
    aria-label={decorative ? undefined : label || character.label}
    style={{ display: "block", maxWidth: "100%", overflow: "hidden", ...style }}>
    <image href={assetUrl} width={asset.width} height={asset.height} />
  </svg>;
}
