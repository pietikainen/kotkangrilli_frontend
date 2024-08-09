import React from "react";
import GameForm from "@/components/game-form";
import GameTable from "@/components/game-table";

export default function GameSuggestions() {
  return (
    <div>
      <div>
        <GameForm />
      </div>
      <div>
        <GameTable />
      </div>
    </div>
  );
}
