"use client";

import React from "react";
import GameSearch from "@/components/game-search";
import GameTable from "@/components/game-table";

export default function GameSuggestions() {
  return (
    <div>
      <div>
        <GameSearch />
      </div>
      <div>
        <GameTable />
      </div>
    </div>
  );
}
