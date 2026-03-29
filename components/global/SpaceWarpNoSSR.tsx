"use client";

import dynamic from "next/dynamic";

const SpaceWarp = dynamic(() => import("./SpaceWarp"), {
  ssr: false,
});

export default function SpaceWarpNoSSR() {
  return <SpaceWarp />;
}
